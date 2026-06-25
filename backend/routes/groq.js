import express from 'express';
import Groq from 'groq-sdk';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Lazy-initialise the Groq client (dotenv hasn't run yet at import time)
let groq;
function getGroqClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

// POST /api/groq/chat
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { messages, temperature = 0.7, max_tokens = 1024 } = req.body;

    // Validate that messages is a non-empty array
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array' });
    }

    const chatCompletion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature,
      max_tokens,
    });

    const choice = chatCompletion.choices?.[0];

    if (!choice) {
      return res.status(502).json({ error: 'No response received from Groq' });
    }

    res.status(200).json({
      content: choice.message.content,
      usage: chatCompletion.usage,
    });
  } catch (error) {
    console.error('Groq API error:', error.message);

    // Forward Groq-specific HTTP errors when available
    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Internal server error while contacting Groq',
    });
  }
});

// POST /api/groq/parse-job
// Parses a raw job description into structured form fields
router.post('/parse-job', requireAuth, async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return res.status(400).json({ error: 'description must be a non-empty string' });
    }

    const systemPrompt = `You are a job posting parser. Extract structured data from the job description provided by the user.

Return ONLY a valid JSON object with these fields (omit any field you cannot confidently determine):
- "company": string — the company name
- "title": string — the job title / role name
- "workModel": string — MUST be exactly one of: "Remote", "Hybrid", "On-site"
- "country": string — the country where the job is located
- "city": string — the city where the job is located. DO NOT put the country here. If the city is not explicitly stated, omit this field entirely.
- "requirements": string — a concise comma-separated list of key skills, technologies, and experience requirements

Rules:
- Output ONLY the JSON object, no markdown, no code fences, no explanation.
- If a field cannot be determined from the description, omit it entirely.
- For "requirements", summarize the key technical skills and experience in a short comma-separated format (e.g. "React, TypeScript, 3+ years experience, GraphQL").
- For "workModel", infer from context clues. If the posting mentions "remote", use "Remote". If it mentions "hybrid", use "Hybrid". If it mentions office/on-site/in-person, use "On-site". If unclear, omit the field.`;

    const chatCompletion = await getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: description },
      ],
      temperature: 0,
      max_tokens: 1024,
    });

    const choice = chatCompletion.choices?.[0];

    if (!choice) {
      return res.status(502).json({ error: 'No response received from Groq' });
    }

    // Parse the LLM's JSON response
    let parsedJob;
    try {
      let content = choice.message.content.trim();
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      parsedJob = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse LLM JSON:', choice.message.content);
      return res.status(502).json({ error: 'LLM returned invalid JSON. Please try again.' });
    }

    // Whitelist only the fields we expect
    const allowedFields = ['company', 'title', 'workModel', 'city', 'country', 'requirements'];
    const result = {};
    for (const field of allowedFields) {
      if (parsedJob[field] && typeof parsedJob[field] === 'string') {
        result[field] = parsedJob[field];
      }
    }

    // Validate workModel enum
    if (result.workModel && !['Remote', 'Hybrid', 'On-site'].includes(result.workModel)) {
      delete result.workModel;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Groq parse-job error:', error.message);

    const status = error.status || 500;
    res.status(status).json({
      error: error.message || 'Internal server error while parsing job description',
    });
  }
});

export default router;
