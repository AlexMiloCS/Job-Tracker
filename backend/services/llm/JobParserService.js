import LLMClient from './LLMClient.js';

class JobParserService {
  constructor() {
    this.llmClient = new LLMClient();
  }

  async parseJobDescription(description) {
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

    const chatCompletion = await this.llmClient.getGroqClient().chat.completions.create({
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
      const err = new Error('No response received from Groq');
      err.status = 502;
      throw err;
    }

    try {
      const parsedJob = this.llmClient.extractJson(choice.message.content);
      
      const allowedFields = ['company', 'title', 'workModel', 'city', 'country', 'requirements'];
      const result = {};
      for (const field of allowedFields) {
        if (parsedJob[field] && typeof parsedJob[field] === 'string') {
          result[field] = parsedJob[field];
        }
      }

      if (result.workModel && !['Remote', 'Hybrid', 'On-site'].includes(result.workModel)) {
        delete result.workModel;
      }

      return result;
    } catch (parseError) {
      console.error('Failed to parse LLM JSON:', choice.message.content);
      const err = new Error('LLM returned invalid JSON. Please try again.');
      err.status = 502;
      throw err;
    }
  }
}

export default JobParserService;
