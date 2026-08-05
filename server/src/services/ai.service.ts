import { BaseService } from './base.service';
import { env } from '../config/env';

export class AIService extends BaseService {
  constructor() {
    super('AIService');
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 3,
    delayMs: number = 1000
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if ((response.status === 429 || response.status === 503) && retries > 0) {
        this.logInfo(`Gemini REST API rate limited (${response.status}). Retrying in ${delayMs}ms... (Retries left: ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.fetchWithRetry(url, options, retries - 1, delayMs * 2);
      }
      return response;
    } catch (err) {
      if (retries > 0) {
        this.logInfo(`Gemini REST API fetch failed. Retrying in ${delayMs}ms... (Retries left: ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.fetchWithRetry(url, options, retries - 1, delayMs * 2);
      }
      throw err;
    }
  }

  async generateJSON(prompt: string, mockResponseFallback?: any): Promise<any> {
    const apiKey = env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === 'placeholder_gemini_api_key' || env.NODE_ENV === 'test';

    if (isMock) {
      this.logInfo('Using local mock response fallback for Gemini content generation', { isTest: env.NODE_ENV === 'test' });
      return mockResponseFallback || { success: true };
    }

    try {
      this.logInfo('Calling Google Gemini API model gemini-2.0-flash');
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      
      const response = await this.fetchWithRetry(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logError('Gemini API call failed', { status: response.status, details: errorText });
        throw new Error(`Gemini API connection error: ${response.statusText}`);
      }

      const body = await response.json() as any;
      const jsonText = body?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!jsonText) {
        throw new Error('Gemini model response content block is empty');
      }

      return JSON.parse(jsonText);
    } catch (err: any) {
      this.logError('Failed generating content via Gemini API, reverting to fallback', { message: err.message });
      if (mockResponseFallback) return mockResponseFallback;
      throw err;
    }
  }
}
export const aiService = new AIService();
