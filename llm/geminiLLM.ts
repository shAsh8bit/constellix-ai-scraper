import axios from 'axios';
import { ScraperPrompt } from '../prompts/index';

export class GeminiLLM {
  private apiKey: string;
  private readonly MODEL_NAME = 'gemini-2.0-flash';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async processQuery(content: string, query: string, mode = 'Element'): Promise<any> {
    try {
      const prompt = mode === 'Element' ? ScraperPrompt.elementQuery({ content, query }) : ScraperPrompt.dataQuery({ content, query })

      const requestData = {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      };

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.MODEL_NAME}:generateContent?key=${this.apiKey}`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      throw error;
    }
  }
  
}