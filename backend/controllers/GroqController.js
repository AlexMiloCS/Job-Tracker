import LLMClient from '../services/llm/LLMClient.js';
import JobParserService from '../services/llm/JobParserService.js';

class GroqController {
  constructor() {
    this.llmClient = new LLMClient();
    this.jobParserService = new JobParserService();

    this.chat = this.chat.bind(this);
    this.parseJob = this.parseJob.bind(this);
  }

  // POST /api/groq/chat
  async chat(req, res) {
    try {
      const { messages, temperature = 0.7, max_tokens = 1024 } = req.body;

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages must be a non-empty array' });
      }

      const result = await this.llmClient.chat(messages, temperature, max_tokens);
      res.status(200).json(result);
    } catch (error) {
      console.error('Groq API error:', error.message);
      const status = error.status || 500;
      res.status(status).json({
        error: error.message || 'Internal server error while contacting Groq',
      });
    }
  }

  // POST /api/groq/parse-job
  async parseJob(req, res) {
    try {
      const { description } = req.body;

      if (!description || typeof description !== 'string' || description.trim().length === 0) {
        return res.status(400).json({ error: 'description must be a non-empty string' });
      }

      const result = await this.jobParserService.parseJobDescription(description);
      res.status(200).json(result);
    } catch (error) {
      console.error('Groq parse-job error:', error.message);
      const status = error.status || 500;
      res.status(status).json({
        error: error.message || 'Internal server error while parsing job description',
      });
    }
  }
}

export default GroqController;
