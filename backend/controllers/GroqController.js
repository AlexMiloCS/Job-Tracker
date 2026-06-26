import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import LLMClient from '../services/llm/LLMClient.js';
import JobParserService from '../services/llm/JobParserService.js';

class GroqController {
  constructor() {
    this.llmClient = new LLMClient();
    this.jobParserService = new JobParserService();

    this.chat = this.chat.bind(this);
    this.parseJob = this.parseJob.bind(this);
    this.parseCvUpload = this.parseCvUpload.bind(this);
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

  // POST /api/groq/parse-cv-upload
  async parseCvUpload(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded' });
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const parser = new PDFParse({ data: fileBuffer });
      const data = await parser.getText();
      
      // Clean up the uploaded file since we just needed the text
      fs.unlinkSync(req.file.path);

      if (!data.text || data.text.trim().length === 0) {
        return res.status(400).json({ error: 'Could not extract text from the PDF' });
      }

      const result = await this.jobParserService.parseCvFromText(data.text);
      res.status(200).json(result);
    } catch (error) {
      console.error('Groq parse-cv error:', error.message);
      // Ensure file is cleaned up on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      const status = error.status || 500;
      res.status(status).json({
        error: error.message || 'Internal server error while parsing CV',
      });
    }
  }
}

export default GroqController;
