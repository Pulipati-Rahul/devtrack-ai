import { MODEL_PRICING } from '../constants';
import { TokenUsageStats } from '../types';

export class TokenCounter {
  /**
   * Approximate token count using standard English text heuristic:
   * 1 token is roughly 4 characters.
   */
  public static countTokens(text: string): number {
    if (!text) return 0;
    return Math.ceil(text.length / 4);
  }

  /**
   * Generates a token usage statistics report including pricing calculation.
   */
  public static calculateStats(
    inputText: string,
    outputText: string,
    modelName: 'gemini-2.0-flash' | 'gemini-2.5-pro' = 'gemini-2.0-flash',
    latencyMs: number
  ): TokenUsageStats {
    const promptTokens = this.countTokens(inputText);
    const candidatesTokens = this.countTokens(outputText);
    const totalTokens = promptTokens + candidatesTokens;

    // Get pricing configurations
    const pricing = MODEL_PRICING[modelName] || MODEL_PRICING['gemini-2.0-flash'];
    const inputCost = (promptTokens / 1_000_000) * pricing.inputPerMillion;
    const outputCost = (candidatesTokens / 1_000_000) * pricing.outputPerMillion;
    const estimatedCost = Number((inputCost + outputCost).toFixed(8));

    return {
      promptTokens,
      candidatesTokens,
      totalTokens,
      estimatedCost,
      latencyMs,
    };
  }
}
