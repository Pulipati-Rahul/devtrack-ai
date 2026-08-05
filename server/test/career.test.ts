import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

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

// Mock analytics repository getters
vi.mock('../src/repositories/analytics.repository', () => {
  return {
    analyticsRepository: {
      getProfileCompletenessDetails: vi.fn().mockResolvedValue({
        bio: 'Developer',
        fullName: 'Test User',
        githubUrl: 'git',
        linkedinUrl: 'link',
        skillsCount: 5,
        experiencesCount: 2,
        educationsCount: 1,
      }),
      getResumesCount: vi.fn().mockResolvedValue(1),
      getProjectsCounts: vi.fn().mockResolvedValue({ active: 1, completed: 1, total: 2 }),
      getDsaProblemsCounts: vi.fn().mockResolvedValue({ easy: 10, medium: 5, hard: 1, total: 16 }),
      getInterviewSessionsCounts: vi.fn().mockResolvedValue(2),
    },
  };
});

// Mock Centralized AI Service
vi.mock('../src/ai/services/ai.service', () => {
  return {
    aiService: {
      chat: vi.fn().mockResolvedValue({
        content: 'Mocked Coach Response Content',
        usage: { promptTokens: 10, candidatesTokens: 20, totalTokens: 30, latencyMs: 100 },
      }),
      generate: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          strengths: ['Analytical mindset'],
          weaknesses: ['Underspecified project details'],
          missingSkills: ['System Design'],
          opportunities: ['DSA recursion counts'],
          recommendedTech: ['React', 'TypeScript'],
          recommendedCertifications: ['AWS Cloud Practitioner'],
          recommendedProjects: ['SaaS platform dashboard'],
          learningRoadmap: {
            plan30Days: ['Log skills.'],
            plan90Days: ['Solve 10 Easy problems.'],
            plan6Months: ['Build landing page.'],
            plan1Year: ['Mock practice.'],
          },
        }),
      }),
    },
  };
});

// Stateful mock repository for Career Coach tests
const mockConversationsDb = new Map<string, any>();
const dummyConv = {
  id: 'conv-career-123',
  userId: 'user-id',
  assistant: 'Career Coach',
  title: 'Fullstack transition guidance',
  createdAt: new Date(),
  updatedAt: new Date(),
};
mockConversationsDb.set('conv-career-123', dummyConv);

vi.mock('../src/repositories/ai.repository', () => {
  return {
    aiRepository: {
      createConversation: vi.fn().mockImplementation((userId, assistant, title) => {
        const created = { id: 'new-career-conv-id', userId, assistant, title, createdAt: new Date() };
        mockConversationsDb.set('new-career-conv-id', created);
        return created;
      }),
      listConversations: vi.fn().mockImplementation(() => Array.from(mockConversationsDb.values())),
      getConversationById: vi.fn().mockImplementation((id) => mockConversationsDb.get(id) || null),
      deleteConversation: vi.fn().mockImplementation((id) => {
        mockConversationsDb.delete(id);
        return { id };
      }),
    },
  };
});

// Mock careerRepository for unit test sandboxing
vi.mock('../src/repositories/career.repository', () => {
  return {
    careerRepository: {
      createReport: vi.fn().mockImplementation((userId, report) => {
        return { id: 'report-id', userId, report };
      }),
      listGoals: vi.fn().mockResolvedValue([]),
      createGoal: vi.fn().mockImplementation((userId, data) => {
        return { id: 'goal-id', userId, ...data };
      }),
      updateGoal: vi.fn().mockImplementation((id, data) => {
        return { id, ...data };
      }),
      deleteGoal: vi.fn().mockImplementation((id) => {
        return { id };
      }),
      getRoadmap: vi.fn().mockResolvedValue(null),
      upsertRoadmap: vi.fn().mockImplementation((userId, steps) => {
        return { id: 'roadmap-id', userId, steps };
      }),
      listRecommendations: vi.fn().mockResolvedValue([]),
      bulkInsertRecommendations: vi.fn().mockResolvedValue([]),
      toggleRecommendationCompleted: vi.fn().mockImplementation((id, completed) => {
        return { id, completed };
      }),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('AI Career Coach Module API Endpoints', () => {
  it('should list coach threads on GET /api/v1/career/history', async () => {
    const res = await request(app).get('/api/v1/career/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].assistant).toBe('Career Coach');
  });

  it('should analyze profile and return report on POST /api/v1/career/analyze', async () => {
    const res = await request(app).post('/api/v1/career/analyze').send({});
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.strengths[0]).toBe('Analytical mindset');
  });

  it('should trigger conversation steps on POST /api/v1/career/chat', async () => {
    const res = await request(app)
      .post('/api/v1/career/chat')
      .send({
        message: 'How should I improve my DSA recursion skill?',
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.content).toBe('Mocked Coach Response Content');
    expect(res.body.data.conversationId).toBe('new-career-conv-id');
  });

  it('should delete coach history logs on DELETE /api/v1/career/history/:id', async () => {
    const res = await request(app).delete('/api/v1/career/history/conv-career-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
