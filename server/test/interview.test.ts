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

// Stateful mock database map for tests
const mockSessionsDb = new Map<string, any>();
const mockQuestionStatesDb = new Map<string, any>();

const dummySession = {
  id: 'session-123',
  userId: 'user-id',
  title: 'JS Mock Session',
  category: 'JavaScript',
  company: 'Google',
  position: 'Frontend',
  duration: 45,
  score: 85,
  notes: 'React hook questions',
  startedAt: new Date(),
  completedAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  feedback: {
    id: 'feed-123',
    feedback: 'Good closures answers',
    rating: 8,
    strengths: 'Scopes',
    weaknesses: 'Piping',
  },
};
mockSessionsDb.set('session-123', dummySession);

// Mock repositories
vi.mock('../src/repositories/interview.repository', () => {
  return {
    interviewRepository: {
      listQuestionStates: vi.fn().mockImplementation(() => Array.from(mockQuestionStatesDb.values())),
      getQuestionState: vi.fn().mockImplementation((userId, qId) => {
        const key = `${userId}-${qId}`;
        return mockQuestionStatesDb.get(key) || null;
      }),
      upsertQuestionState: vi.fn().mockImplementation((userId, questionId, data) => {
        const key = `${userId}-${questionId}`;
        const existing = mockQuestionStatesDb.get(key) || {
          id: 'state-123',
          userId,
          questionId,
          bookmarked: false,
          solved: false,
        };
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        mockQuestionStatesDb.set(key, updated);
        return updated;
      }),
      listSessions: vi.fn().mockImplementation(() => Array.from(mockSessionsDb.values())),
      getSessionById: vi.fn().mockImplementation((id) => mockSessionsDb.get(id) || null),
      createSession: vi.fn().mockImplementation((data) => {
        const created = {
          id: 'new-session-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          feedback: null,
        };
        mockSessionsDb.set('new-session-id', created);
        return created;
      }),
      updateSession: vi.fn().mockImplementation((id, data) => {
        const existing = mockSessionsDb.get(id) || {};
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        mockSessionsDb.set(id, updated);
        return updated;
      }),
      deleteSession: vi.fn().mockImplementation((id) => {
        mockSessionsDb.delete(id);
        return { id };
      }),
      getFeedbackBySessionId: vi.fn().mockImplementation((sessionId) => {
        const session = mockSessionsDb.get(sessionId);
        return session ? session.feedback : null;
      }),
      upsertFeedback: vi.fn().mockImplementation((sessionId, data) => {
        const session = mockSessionsDb.get(sessionId);
        if (session) {
          session.feedback = {
            id: 'feed-123',
            ...data,
          };
        }
        return { id: 'feed-123', sessionId, ...data };
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

describe('Interview Preparation Module API Endpoints', () => {
  it('should list interview questions on GET /api/v1/interview/questions', async () => {
    const res = await request(app).get('/api/v1/interview/questions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('Explain closures in JavaScript.');
  });

  it('should toggle question state on POST /api/v1/interview/questions/state', async () => {
    const res = await request(app)
      .post('/api/v1/interview/questions/state')
      .send({
        questionId: 'js-1',
        bookmarked: true,
        solved: true,
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.bookmarked).toBe(true);
    expect(res.body.data.solved).toBe(true);
  });

  it('should list session history on GET /api/v1/interview/history', async () => {
    const res = await request(app).get('/api/v1/interview/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('JS Mock Session');
  });

  it('should create mock session log on POST /api/v1/interview/session', async () => {
    const res = await request(app)
      .post('/api/v1/interview/session')
      .send({
        title: 'System Design Mock',
        category: 'DBMS',
        company: 'Netflix',
        score: 90,
        rating: 9,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('System Design Mock');
  });

  it('should update mock session on PUT /api/v1/interview/session/:id', async () => {
    const res = await request(app)
      .put('/api/v1/interview/session/session-123')
      .send({ title: 'Updated JS Session' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Updated JS Session');
  });

  it('should compile stats on GET /api/v1/interview/statistics', async () => {
    const res = await request(app).get('/api/v1/interview/statistics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.completedMocks).toBe(2);
    expect(res.body.data.totalSolved).toBe(1); // from toggling state test syncd state!
  });

  it('should delete mock session on DELETE /api/v1/interview/session/:id', async () => {
    const res = await request(app).delete('/api/v1/interview/session/session-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
