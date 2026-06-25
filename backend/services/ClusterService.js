import Job from '../models/Job.js';
import ClusterNamerService from './llm/ClusterNamerService.js';

const FLASK_URL = process.env.FLASK_CLUSTER_URL || 'http://localhost:5001';

class ClusterService {
  constructor() {
    this.clusterNamerService = new ClusterNamerService();
  }

  async fetchSortedJobs(userId) {
    return await Job.find({ userId }).sort({ dateApplied: -1 });
  }

  async fetchUserJobs(userId) {
    return await Job.find({ userId });
  }

  async callClusteringService(titles) {
    const response = await fetch(`${FLASK_URL}/cluster-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titles }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Clustering service error');
    }

    return await response.json();
  }

  groupJobsByCluster(jobs) {
    const clusters = {};
    for (const job of jobs) {
      if (job.clusterId == null) continue;
      const key = String(job.clusterId);
      if (!clusters[key]) clusters[key] = { label: job.clusterLabel, titles: [] };
      if (!clusters[key].titles.includes(job.title)) {
        clusters[key].titles.push(job.title);
      }
    }
    return clusters;
  }

  async getClusterLabels(clusters, autoName) {
    if (autoName) {
      return await this.clusterNamerService.generateClusterLabels(clusters);
    }
    const clusterLabels = {};
    for (const [id, info] of Object.entries(clusters)) {
      clusterLabels[id] = info.label;
    }
    return clusterLabels;
  }

  async bulkUpdateJobClusters(jobs, assignments, clusterLabels) {
    const bulkOps = jobs.map((job) => {
      const assignment = assignments[job.title];
      if (!assignment) return null;

      const clusterId = assignment.clusterId;
      const clusterLabel = clusterLabels[String(clusterId)] || `Cluster ${clusterId}`;

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
  }

  async renameCluster(userId, clusterId, newLabel) {
    const result = await Job.updateMany(
      { userId, clusterId },
      { $set: { clusterLabel: newLabel } }
    );
    return result;
  }

  async applyAutoNameLabels(userId, clusterLabels) {
    const bulkOps = Object.entries(clusterLabels).map(([id, label]) => ({
      updateMany: {
        filter: { userId, clusterId: Number(id) },
        update: { $set: { clusterLabel: label } },
      },
    }));

    if (bulkOps.length > 0) {
      await Job.bulkWrite(bulkOps);
    }
  }
}

export default ClusterService;
