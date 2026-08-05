import { BaseService } from '../../services/base.service';
import { geminiClient } from '../client/gemini.client';
import { PromptBuilder } from '../prompts/prompt.builder';
import { TokenCounter } from '../utils/token.counter';
import { aiRepository } from '../../repositories/ai.repository';
import { DEFAULT_MODEL } from '../constants';
import { AIModelConfig, AIServiceResponse } from '../types';

export class AiService extends BaseService {
  constructor() {
    super('AiService');
  }

  private logResponseMetadata(model: string, inputTokens: number, outputTokens: number, latencyMs: number) {
    this.logInfo(`[Gemini Response] model=${model} inputTokens=${inputTokens} outputTokens=${outputTokens} latencyMs=${latencyMs}ms`);
  }

  /**
   * Generates single-turn content from Gemini with retry.
   */
  public async generate(
    prompt: string,
    config: AIModelConfig = {}
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();
    const modelName = config.modelName || DEFAULT_MODEL;

    this.logInfo('Invoking Gemini generateContent', { model: modelName });
    
    const response = await geminiClient.generateContentWithRetry(config, prompt);
    const outputText = response.response.text() || '';
    const latency = Date.now() - startTime;

    const stats = TokenCounter.calculateStats(prompt, outputText, modelName as any, latency);
    this.logResponseMetadata(modelName, stats.promptTokens, stats.candidatesTokens, latency);

    return {
      content: outputText,
      usage: stats,
    };
  }

  /**
   * Supports streaming chunks with intermediate callbacks.
   */
  public async stream(
    prompt: string,
    onChunk: (text: string) => void,
    config: AIModelConfig = {}
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();
    const modelName = config.modelName || DEFAULT_MODEL;

    this.logInfo('Invoking Gemini generateContentStream', { model: modelName });
    
    const model = geminiClient.getModel(config);
    const result = await model.generateContentStream(prompt);

    let fullText = '';
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      fullText += chunkText;
      onChunk(chunkText);
    }

    const latency = Date.now() - startTime;
    const stats = TokenCounter.calculateStats(prompt, fullText, modelName as any, latency);
    this.logResponseMetadata(modelName, stats.promptTokens, stats.candidatesTokens, latency);

    return {
      content: fullText,
      usage: stats,
    };
  }

  /**
   * Performs technical code or system design evaluations using ANALYSIS templates.
   */
  public async analyze(content: string, focus: string): Promise<AIServiceResponse> {
    const builder = new PromptBuilder('ANALYSIS')
      .setVariables({ content, focus });
    const compiled = builder.build();

    return await this.generate(compiled.userPrompt, {
      systemInstruction: compiled.systemInstruction,
    });
  }

  /**
   * Generates text summaries under a word limit using SUMMARY templates.
   */
  public async summarize(text: string, limit: number = 100): Promise<AIServiceResponse> {
    const builder = new PromptBuilder('SUMMARY')
      .setVariables({ text, limit: String(limit) });
    const compiled = builder.build();

    return await this.generate(compiled.userPrompt, {
      systemInstruction: compiled.systemInstruction,
    });
  }

  /**
   * Processes conversational queries, loads message logs history, and saves response parameters.
   */
  public async chat(
    conversationId: string,
    userQuery: string,
    modelConfig: AIModelConfig = {}
  ): Promise<AIServiceResponse> {
    const startTime = Date.now();
    const modelName = modelConfig.modelName || DEFAULT_MODEL;

    // 1. Fetch conversation history
    const conversation = await aiRepository.getConversationById(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const historyMessages = await aiRepository.getMessages(conversationId);

    // 2. Format history logs as structured parts for the Gemini Chat model API
    // Gemini chat API takes contents array in the format: { role: 'user' | 'model', parts: [{ text: string }] }
    // Note: Drizzle stores role as 'user' | 'assistant' | 'system'
    const chatContents = historyMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // Add current query
    chatContents.push({
      role: 'user',
      parts: [{ text: userQuery }],
    });

    // 3. Invoke model
    const builder = new PromptBuilder('GENERAL_CHAT');
    const compiled = builder.build();

    this.logInfo('Invoking Gemini chat session', { conversationId });
    const result = await geminiClient.generateContentWithRetry(
      {
        ...modelConfig,
        systemInstruction: compiled.systemInstruction,
      },
      { contents: chatContents as any }
    );
    const responseText = result.response.text() || '';

    const latency = Date.now() - startTime;
    const stats = TokenCounter.calculateStats(userQuery, responseText, modelName as any, latency);
    this.logResponseMetadata(modelName, stats.promptTokens, stats.candidatesTokens, latency);

    // 4. Save User Message & Assistant Message to database
    await aiRepository.createMessage(conversationId, 'user', userQuery);
    await aiRepository.createMessage(conversationId, 'assistant', responseText, {
      usage: stats,
      latencyMs: latency,
    });

    // 5. Trim conversation window history (keep last 20 messages)
    await aiRepository.trimConversationContext(conversationId, 20);

    return {
      content: responseText,
      usage: stats,
    };
  }
}
export const aiService = new AiService();
