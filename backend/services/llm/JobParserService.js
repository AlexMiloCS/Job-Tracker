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

  async parseCvFromText(text) {
    const systemPrompt = `You are an expert resume parser. Extract structured data from the provided raw PDF text of a user's CV.

Return ONLY a valid JSON object with EXACTLY this structure (omit fields you cannot confidently determine or leave them empty, but keep the structure intact):
{
  "basics": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "Phone number",
    "location": "City, State",
    "links": [
      { "name": "LinkedIn/GitHub/Portfolio", "url": "https://..." }
    ]
  },
  "sections": [
    {
      "title": "Exact Header from PDF (e.g. Volunteer Experience, Awards, Education)",
      "type": "DetailedList | ProjectList | SimpleList | TagsList",
      "items": [
        // Fields depend on the "type" chosen above. See rules below.
      ]
    }
  ]
}

Layout Types and their exact items schemas:
1. DetailedList: Use for jobs, volunteer roles, or degrees. 
   Item schema: { "title": "Role/Degree", "subtitle": "Company/School", "date": "Month Year -- Month Year", "location": "City, State", "highlights": ["bullet 1", "bullet 2"] }
2. ProjectList: Use for projects or academic papers.
   Item schema: { "title": "Project Name", "subtitle": "Technologies/Venue", "date": "Month Year", "highlights": ["bullet 1"] }
3. SimpleList: Use for awards, scholarships, or simple certifications.
   Item schema: { "title": "Award Name", "date": "Month Year", "description": "Short description" }
4. TagsList: Use for grouped skills (e.g. Technical Skills, Languages).
   Item schema: { "title": "Category (e.g. Languages)", "description": "Comma separated list of skills" }

Rules:
- Output ONLY the JSON object, no markdown, no explanation.
- Identify the logical sections the user has created in their PDF (e.g., 'Volunteer Experience', 'Academic Papers', 'Certifications'). Create a custom Block in the "sections" array for EACH one, preserving the user's custom section titles.
- Choose the best layout "type" for each section block based on the content.
- Break down long paragraphs into concise bullet points in the "highlights" arrays.`;

    const chatCompletion = await this.llmClient.getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    });

    const choice = chatCompletion.choices?.[0];
    if (!choice) {
      const err = new Error('No response received from Groq');
      err.status = 502;
      throw err;
    }

    try {
      const parsedCv = this.llmClient.extractJson(choice.message.content);
      return parsedCv;
    } catch (parseError) {
      console.error('Failed to parse LLM CV JSON:', choice.message.content);
      const err = new Error('LLM returned invalid JSON. Please try again.');
      err.status = 502;
      throw err;
    }
  }
}

export default JobParserService;
