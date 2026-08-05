export const DEFAULT_MODEL = 'gemini-2.0-flash';
export const ADVANCED_MODEL = 'gemini-2.5-pro';

// Gemini Pricing per 1M tokens (as of stable rates)
// 1.5 Flash: Input $0.075 / 1M, Output $0.30 / 1M
// 1.5 Pro: Input $1.25 / 1M, Output $5.00 / 1M
export const MODEL_PRICING = {
  'gemini-2.0-flash': {
    inputPerMillion: 0.075,
    outputPerMillion: 0.30,
  },
  'gemini-2.5-pro': {
    inputPerMillion: 1.25,
    outputPerMillion: 5.00,
  },
};

export const MAX_CONTEXT_MESSAGES = 20;
