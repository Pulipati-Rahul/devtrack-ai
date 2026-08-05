import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { DEFAULT_MODEL } from '../constants';
import { AIModelConfig } from '../types';

export class GeminiClient {
  private static instance: GeminiClient;
  private genAI: GoogleGenerativeAI;

  private constructor() {
    if (!env.GEMINI_API_KEY) {
      throw new Error('❌ Missing GEMINI_API_KEY inside environment configuration.');
    }
    this.genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public static getInstance(): GeminiClient {
    if (!GeminiClient.instance) {
      GeminiClient.instance = new GeminiClient();
    }
    return GeminiClient.instance;
  }

  /**
   * Helper: Runs actions with exponential backoff retries on transient errors.
   */
  private async withRetry<T>(
    action: () => Promise<T>,
    retries: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    try {
      return await action();
    } catch (error: any) {
      // Check if it looks like a transient error (e.g. rate limit, overloaded, temporary network drop)
      const isTransient =
        error.message?.includes('429') ||
        error.message?.includes('503') ||
        error.message?.includes('overloaded') ||
        error.status === 429 ||
        error.status === 503;

      if (retries > 0 && isTransient) {
        console.warn(`⚠️ Gemini API request failed. Retrying in ${delayMs}ms... (Retries left: ${retries})`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        return this.withRetry(action, retries - 1, delayMs * 2);
      }
      throw error;
    }
  }

  /**
   * Generates generative model instance configured with instructions and temperature settings.
   */
  public getModel(config: AIModelConfig = {}) {
    const modelName = config.modelName || DEFAULT_MODEL;
    return this.genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: config.temperature ?? 0.7,
        maxOutputTokens: config.maxOutputTokens,
        topP: config.topP,
        topK: config.topK,
        stopSequences: config.stopSequences,
      },
      systemInstruction: config.systemInstruction,
    });
  }

  /**
   * Simple content generation call wrapping retries.
   */
  public async generateContentWithRetry(
    config: AIModelConfig,
    prompt: any,
    retries: number = 3
  ) {
    const model = this.getModel(config);
    return await this.withRetry(async () => {
      // If we need custom timeout, we can implement it using Promise.race or custom abort handlers
      return await model.generateContent(prompt);
    }, retries);
  }
}

export const geminiClient = GeminiClient.getInstance();
