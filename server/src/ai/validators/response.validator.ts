import { z } from 'zod';
import { JsonParser } from '../parsers/json.parser';

export class ResponseValidator {
  /**
   * Parses text to JSON and validates it against the provided Zod schema.
   * If parsing or validation fails, it can either throw or return a fallback object.
   */
  public static validate<T>(
    rawText: string,
    schema: z.ZodSchema<T>,
    fallback?: T
  ): T {
    try {
      const parsed = JsonParser.parse<any>(rawText);
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      if (fallback !== undefined) {
        console.warn('⚠️ Response validation failed. Applying fallback schema data.', error);
        return fallback;
      }
      throw error;
    }
  }
}
