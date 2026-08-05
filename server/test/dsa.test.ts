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

// Stateful mock database map
const mockDb = new Map<string, any>();
const dummyProblem = {
  id: 'prob-123',
  userId: 'user-id',
  title: 'Two Sum',
  platform: 'LeetCode',
  url: 'https://leetcode.com/problems/two-sum',
  difficulty: 'Easy',
  topic: 'Arrays',
  status: 'Solved',
  timeTaken: 15,
  solvedDate: new Date(),
  favorite: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  revision: {
    id: 'rev-123',
    nextRevision: new Date(),
    revisionCount: 0,
    lastRevision: null,
  },
};
mockDb.set('prob-123', dummyProblem);

// Mock repositories
vi.mock('../src/repositories/dsa.repository', () => {
  return {
    dsaRepository: {
      listProblems: vi.fn().mockImplementation(() => Array.from(mockDb.values())),
      getProblemById: vi.fn().mockImplementation((id) => mockDb.get(id) || null),
      createProblem: vi.fn().mockImplementation((data) => {
        const created = {
          id: 'new-prob-id',
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          revision: null,
        };
        mockDb.set('new-prob-id', created);
        return created;
      }),
      updateProblem: vi.fn().mockImplementation((id, data) => {
        const existing = mockDb.get(id) || {};
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        mockDb.set(id, updated);
        return updated;
      }),
      deleteProblem: vi.fn().mockImplementation((id) => {
        mockDb.delete(id);
        return { id };
      }),
      getRevisionByProblemId: vi.fn().mockImplementation((probId) => {
        const prob = mockDb.get(probId);
        return prob ? prob.revision : null;
      }),
      upsertRevision: vi.fn().mockImplementation((problemId, nextRevision, count, lastRevision) => {
        const prob = mockDb.get(problemId);
        if (prob) {
          prob.revision = {
            id: 'rev-123',
            nextRevision,
            revisionCount: count,
            lastRevision: lastRevision || null,
          };
        }
        return {
          id: 'rev-123',
          problemId,
          nextRevision,
          revisionCount: count,
          lastRevision: lastRevision || null,
        };
      }),
      listAllRevisions: vi.fn().mockImplementation(() => {
        return Array.from(mockDb.values())
          .filter((p) => p.revision)
          .map((p) => ({
            ...p.revision,
            problem: p,
          }));
      }),
      listRevisionsDue: vi.fn().mockResolvedValue([]),
    },
  };
});

// Mock project list
vi.mock('../src/repositories/project.repository', () => {
  return {
    projectRepository: {
      listProjects: vi.fn().mockResolvedValue([]),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('DSA Tracker Module API Endpoints', () => {
  it('should list solved problems on GET /api/v1/dsa/problems', async () => {
    const res = await request(app).get('/api/v1/dsa/problems');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].title).toBe('Two Sum');
  });

  it('should create problem log on POST /api/v1/dsa/problems', async () => {
    const res = await request(app)
      .post('/api/v1/dsa/problems')
      .send({
        title: 'Reverse Linked List',
        platform: 'LeetCode',
        difficulty: 'Easy',
        topic: 'Linked List',
        solvedDate: new Date().toISOString(),
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Reverse Linked List');
  });

  it('should update details on PUT /api/v1/dsa/problems/:id', async () => {
    const res = await request(app)
      .put('/api/v1/dsa/problems/prob-123')
      .send({ favorite: true });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.favorite).toBe(true);
  });

  it('should retrieve streak statistics on GET /api/v1/dsa/statistics', async () => {
    const res = await request(app).get('/api/v1/dsa/statistics');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSolved).toBe(2); // Two Sum + Reverse Linked List
    expect(res.body.data.difficultyBreakdown.Easy).toBe(2);
  });

  it('should return scheduled revisions on GET /api/v1/dsa/revisions', async () => {
    const res = await request(app).get('/api/v1/dsa/revisions');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].problem.title).toBe('Two Sum');
  });

  it('should mark complete revisions on POST /api/v1/dsa/revisions/:id/complete', async () => {
    const res = await request(app).post('/api/v1/dsa/revisions/prob-123/complete');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.revisionCount).toBe(1);
  });

  it('should delete log on DELETE /api/v1/dsa/problems/:id', async () => {
    const res = await request(app).delete('/api/v1/dsa/problems/prob-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
