export interface AIModelConfig {
  modelName?: string;
  temperature?: number;
  maxOutputTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
  systemInstruction?: string;
}

export interface PromptVariables {
  [key: string]: string;
}

export interface TokenUsageStats {
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  latencyMs: number;
}

export interface AIRoleMessage {
  role: 'user' | 'model' | 'system';
  parts: string | { text: string }[];
}

export interface AIServiceResponse {
  content: string;
  usage?: TokenUsageStats;
}
