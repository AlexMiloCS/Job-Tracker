import Groq from 'groq-sdk';

// Lazy-initialise the Groq client
let groq;
export function getGroqClient() {
  if (!groq) {
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

/**
 * Use Groq LLM to generate short, human-readable labels for clusters.
 *
 * @param {Object} clusters - { "0": { titles: ["AI Engineer", ...] }, ... }
 * @returns {Object} - { "0": "AI/ML Engineering", "1": "Data Science", ... }
 */
export async function generateClusterLabels(clusters) {
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
    if (content.startsWith('\`\`\`json')) {
      content = content.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
    } else if (content.startsWith('\`\`\`')) {
      content = content.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('LLM cluster naming failed:', error.message);
    // Fallback to default labels
    const fallback = {};
    for (const id of Object.keys(clusters)) {
      fallback[id] = \`Cluster \${id}\`;
    }
    return fallback;
  }
}
