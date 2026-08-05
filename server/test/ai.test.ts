import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { PromptBuilder } from '../src/ai/prompts/prompt.builder';
import { TokenCounter } from '../src/ai/utils/token.counter';

// Mock auth check
vi.mock('../src/auth/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: { id: 'session-id', userId: 'user-id' },
          user: { id: 'user-id', email: 'test@example.com', role: 'USER' },
        }),
      },
    },
  };
});

// Mock Google Generative AI SDK
vi.mock('@google/generative-ai', () => {
  const mockText = vi.fn().mockReturnValue('Mocked Gemini Response Text');
  const mockGenerateContent = vi.fn().mockResolvedValue({
    response: { text: mockText },
  });

  return {
    GoogleGenerativeAI: class {
      getGenerativeModel() {
        return {
          generateContent: mockGenerateContent,
          generateContentStream: vi.fn().mockResolvedValue({
            stream: [{ text: () => 'Mocked Stream Chunk' }],
          }),
        };
      }
    },
  };
});

// Stateful mock repository for AI tests
const mockConversationsDb = new Map<string, any>();
const mockMessagesDb = new Map<string, any>();

const dummyConv = {
  id: 'conv-123',
  userId: 'user-id',
  assistant: 'Career Coach',
  title: 'JS Closures help',
  createdAt: new Date(),
  updatedAt: new Date(),
};
mockConversationsDb.set('conv-123', dummyConv);

vi.mock('../src/repositories/ai.repository', () => {
  return {
    aiRepository: {
      createConversation: vi.fn().mockImplementation((userId, assistant, title) => {
        const created = { id: 'new-conv-id', userId, assistant, title, createdAt: new Date() };
        mockConversationsDb.set('new-conv-id', created);
        return created;
      }),
      listConversations: vi.fn().mockImplementation(() => Array.from(mockConversationsDb.values())),
      getConversationById: vi.fn().mockImplementation((id) => mockConversationsDb.get(id) || null),
      deleteConversation: vi.fn().mockImplementation((id) => {
        mockConversationsDb.delete(id);
        return { id };
      }),
      getMessages: vi.fn().mockImplementation((convId) => {
        return Array.from(mockMessagesDb.values()).filter((m) => m.conversationId === convId);
      }),
      createMessage: vi.fn().mockImplementation((convId, role, content, metadata) => {
        const id = Math.random().toString();
        const created = { id, conversationId: convId, role, content, metadata, createdAt: new Date() };
        mockMessagesDb.set(id, created);
        return created;
      }),
      trimConversationContext: vi.fn().mockResolvedValue(true),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('AI Infrastructure Layer tests', () => {
  describe('Prompt Engine & Token Counter', () => {
    it('should interpolate variable prompts in template builder', () => {
      const builder = new PromptBuilder('GENERAL_CHAT')
        .setVariables({ context: 'JS Developer', query: 'What is event loop?' });
      const compiled = builder.build();

      expect(compiled.systemInstruction).toContain('career coach');
      expect(compiled.userPrompt).toContain('JS Developer');
      expect(compiled.userPrompt).toContain('event loop');
    });

    it('should estimate token count and cost accurately', () => {
      const input = 'hello world'; // 11 chars -> 3 tokens
      const output = 'test output text content'; // 25 chars -> 7 tokens
      const stats = TokenCounter.calculateStats(input, output, 'gemini-1.5-flash', 100);

      expect(stats.promptTokens).toBe(3);
      expect(stats.candidatesTokens).toBe(6);
      expect(stats.totalTokens).toBe(9);
      expect(stats.estimatedCost).toBeGreaterThan(0);
      expect(stats.latencyMs).toBe(100);
    });
  });

  describe('AI Endpoints Routing', () => {
    it('should create and list conversation logs on GET /api/v1/ai/history', async () => {
      const res = await request(app).get('/api/v1/ai/history');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].title).toBe('JS Closures help');
    });

    it('should initialize chat and persist logs on POST /api/v1/ai/chat', async () => {
      const res = await request(app)
        .post('/api/v1/ai/chat')
        .send({
          message: 'Can you critique my React code component?',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Mocked Gemini Response Text');
      expect(res.body.data.conversationId).toBe('new-conv-id');
    });

    it('should delete conversation histories on DELETE /api/v1/ai/history/:id', async () => {
      const res = await request(app).delete('/api/v1/ai/history/conv-123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
