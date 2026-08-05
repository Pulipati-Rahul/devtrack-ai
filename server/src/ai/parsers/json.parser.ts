export class JsonParser {
  /**
   * Cleans model output and parses JSON content.
   * Handles optional markdown fence blocks like ```json ... ```.
   */
  public static parse<T>(rawText: string): T {
    let cleaned = rawText.trim();

    // 1. Remove starting/ending markdown markers if present
    if (cleaned.startsWith('```')) {
      const match = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      }
    }

    try {
      return JSON.parse(cleaned) as T;
    } catch (error) {
      // Fallback: try to find the first '{' and last '}'
      const startIdx = cleaned.indexOf('{');
      const endIdx = cleaned.lastIndexOf('}');
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonSubstring = cleaned.substring(startIdx, endIdx + 1);
        try {
          return JSON.parse(jsonSubstring) as T;
        } catch (innerError) {
          throw new Error(`Failed to parse extracted JSON fragment. Original: ${rawText}`);
        }
      }
      throw new Error(`Text does not contain valid JSON formatting: ${rawText}`);
    }
  }
}
export const jsonParser = new JsonParser();
