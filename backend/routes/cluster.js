import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import Job from '../models/Job.js';
import Groq from 'groq-sdk';

const router = express.Router();

const FLASK_URL = process.env.FLASK_CLUSTER_URL || 'http://localhost:5001';

// Lazy-initialise the Groq client
let groq;
function getGroqClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// POST /api/cluster/recluster
// Re-clusters all jobs for the authenticated user
router.post('/recluster', requireAuth, async (req, res) => {
  try {
    const { autoName = false } = req.body;

    // Fetch all jobs for this user
    const jobs = await Job.find({ userId: req.userId });

    if (jobs.length < 2) {
      return res.status(400).json({
        error: 'Need at least 2 jobs to cluster',
      });
    }

    // Collect titles
    const titles = jobs.map((j) => j.title).filter(Boolean);

    // Call Flask /cluster-all
    const flaskResponse = await fetch(`${FLASK_URL}/cluster-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titles }),
    });

    if (!flaskResponse.ok) {
      const err = await flaskResponse.json();
      return res.status(502).json({
        error: err.error || 'Clustering service error',
      });
    }

    const clusterData = await flaskResponse.json();
    const { assignments, clusters, optimal_k } = clusterData;

    // If user requested auto-naming via LLM
    let clusterLabels = {};
    if (autoName) {
      clusterLabels = await generateClusterLabels(clusters);
    } else {
      // Use default "Cluster N" labels
      for (const [id, info] of Object.entries(clusters)) {
        clusterLabels[id] = info.label;
      }
    }

    // Update every job in the database
    const bulkOps = jobs.map((job) => {
      const assignment = assignments[job.title];
      if (!assignment) return null;

      const clusterId = assignment.clusterId;
      const clusterLabel =
        clusterLabels[String(clusterId)] || `Cluster ${clusterId}`;

      return {
        updateOne: {
          filter: { _id: job._id },
          update: { $set: { clusterId, clusterLabel } },
        },
      };
    }).filter(Boolean);

    if (bulkOps.length > 0) {
      await Job.bulkWrite(bulkOps);
    }

    // Return the updated jobs
    const updatedJobs = await Job.find({ userId: req.userId }).sort({
      dateApplied: -1,
    });

    res.status(200).json({
      message: `Clustered ${jobs.length} jobs into ${optimal_k} groups`,
      optimal_k,
      clusterLabels,
      jobs: updatedJobs,
    });
  } catch (error) {
    console.error('Recluster error:', error.message);
    res.status(500).json({
      error: error.message || 'Internal server error during reclustering',
    });
  }
});

// POST /api/cluster/rename
// Rename a cluster label for all jobs in that cluster
router.post('/rename', requireAuth, async (req, res) => {
  try {
    const { clusterId, newLabel } = req.body;

    if (clusterId === undefined || !newLabel) {
      return res
        .status(400)
        .json({ error: 'clusterId and newLabel are required' });
    }

    const result = await Job.updateMany(
      { userId: req.userId, clusterId: clusterId },
      { $set: { clusterLabel: newLabel } }
    );

    res.status(200).json({
      message: `Renamed cluster ${clusterId} to "${newLabel}"`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Rename cluster error:', error.message);
    res.status(500).json({ error: 'Failed to rename cluster' });
  }
});

// POST /api/cluster/auto-name
// Use LLM to generate labels for all current clusters
router.post('/auto-name', requireAuth, async (req, res) => {
  try {
    const jobs = await Job.find({ userId: req.userId });

    // Group by clusterId
    const clusters = {};
    for (const job of jobs) {
      if (job.clusterId === undefined || job.clusterId === null) continue;
      const key = String(job.clusterId);
      if (!clusters[key]) clusters[key] = { label: job.clusterLabel, titles: [] };
      if (!clusters[key].titles.includes(job.title)) {
        clusters[key].titles.push(job.title);
      }
    }

    if (Object.keys(clusters).length === 0) {
      return res.status(400).json({
        error: 'No clustered jobs found. Run recluster first.',
      });
    }

    const clusterLabels = await generateClusterLabels(clusters);

    // Update jobs in DB
    const bulkOps = [];
    for (const [id, label] of Object.entries(clusterLabels)) {
      bulkOps.push({
        updateMany: {
          filter: { userId: req.userId, clusterId: Number(id) },
          update: { $set: { clusterLabel: label } },
        },
      });
    }

    if (bulkOps.length > 0) {
      await Job.bulkWrite(bulkOps);
    }

    const updatedJobs = await Job.find({ userId: req.userId }).sort({
      dateApplied: -1,
    });

    res.status(200).json({
      message: 'Cluster labels generated by AI',
      clusterLabels,
      jobs: updatedJobs,
    });
  } catch (error) {
    console.error('Auto-name error:', error.message);
    res.status(500).json({ error: 'Failed to auto-name clusters' });
  }
});

/**
 * Use Groq LLM to generate short, human-readable labels for clusters.
 *
 * @param {Object} clusters - { "0": { titles: ["AI Engineer", ...] }, ... }
 * @returns {Object} - { "0": "AI/ML Engineering", "1": "Data Science", ... }
 */
async function generateClusterLabels(clusters) {
  const clusterSummary = Object.entries(clusters)
    .map(([id, info]) => `Cluster ${id}: ${info.titles.join(', ')}`)
    .join('\n');

  const systemPrompt = `You generate short, descriptive category labels for groups of job titles.

Given a set of clusters with their job titles, return ONLY a valid JSON object mapping each cluster ID to a short label (2-4 words max).

Example input:
Cluster 0: AI Engineer, ML Engineer, AI/ML Engineer
Cluster 1: Data Analyst, Data Scientist

Example output:
{"0": "AI/ML Engineering", "1": "Data Science"}

Rules:
- Output ONLY the JSON object, no markdown, no code fences, no explanation.
- Labels should be concise (2-4 words).
- Labels should describe the category, not list titles.`;

  try {
    const chatCompletion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: clusterSummary },
      ],
      temperature: 0,
      max_tokens: 512,
    });

    const choice = chatCompletion.choices?.[0];
    if (!choice) return {};

    let content = choice.message.content.trim();
    // Strip markdown code fences if present
    if (content.startsWith('```json')) {
      content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (content.startsWith('```')) {
      content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('LLM cluster naming failed:', error.message);
    // Fallback to default labels
    const fallback = {};
    for (const id of Object.keys(clusters)) {
      fallback[id] = `Cluster ${id}`;
    }
    return fallback;
  }
}

export default router;
