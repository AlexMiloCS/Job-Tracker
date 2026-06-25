import Groq from 'groq-sdk';

class LLMClient {
  constructor() {
    this.groq = null;
  }

  getGroqClient() {
    if (!this.groq) {
      this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return this.groq;
  }

  extractJson(content) {
    let cleanContent = content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleanContent);
  }

  async chat(messages, temperature = 0.7, maxTokens = 1024) {
    const chatCompletion = await this.getGroqClient().chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature,
      max_tokens: maxTokens,
    });

    const choice = chatCompletion.choices?.[0];
    if (!choice) {
      throw new Error('No response received from Groq');
    }

    return {
      content: choice.message.content,
      usage: chatCompletion.usage,
    };
  }
}

export default LLMClient;
