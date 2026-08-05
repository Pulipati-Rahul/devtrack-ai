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

// Mock SearchRepository
vi.mock('../src/repositories/search.repository', () => {
  return {
    searchRepository: {
      search: vi.fn().mockResolvedValue([
        { id: 'res-123', title: 'Resume Draft 1', subtitle: 'Modern template', type: 'resume', url: '/resume/res-123' },
        { id: 'proj-123', title: 'Side Project 1', subtitle: 'Vite app', type: 'project', url: '/projects/proj-123' }
      ]),
      saveSearchHistory: vi.fn().mockResolvedValue({ id: 'hist-123', query: 'resume', createdAt: new Date() }),
      getRecentSearches: vi.fn().mockResolvedValue([
        { id: 'hist-123', query: 'resume', createdAt: new Date() }
      ]),
      getPinnedCommands: vi.fn().mockResolvedValue([
        { commandId: 'create-resume' }
      ]),
      pinCommand: vi.fn().mockResolvedValue({}),
      unpinCommand: vi.fn().mockResolvedValue({}),
    },
  };
});

describe('Global Search & Command Palette API Endpoints', () => {
  describe('GET /api/v1/search', () => {
    it('should query cross-module database records with search term', async () => {
      const res = await request(app)
        .get('/api/v1/search')
        .query({ q: 'resume' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].type).toBe('resume');
    });

    it('should return empty results if query is empty', async () => {
      const res = await request(app)
        .get('/api/v1/search')
        .query({ q: '' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/v1/search/recent', () => {
    it('should fetch user unique recent searches logs', async () => {
      const res = await request(app).get('/api/v1/search/recent');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].query).toBe('resume');
    });
  });

  describe('POST /api/v1/search', () => {
    it('should record user search queries in history log', async () => {
      const res = await request(app)
        .post('/api/v1/search')
        .send({ query: 'new-query' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.query).toBe('resume'); // matches mock return
    });

    it('should reject missing search query', async () => {
      const res = await request(app)
        .post('/api/v1/search')
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/search/commands', () => {
    it('should compile command registry with user pin states', async () => {
      const res = await request(app).get('/api/v1/search/commands');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      
      const createResumeCmd = res.body.data.find((c: any) => c.id === 'create-resume');
      expect(createResumeCmd).toBeDefined();
      expect(createResumeCmd.isPinned).toBe(true);
    });
  });

  describe('POST /api/v1/search/commands/pin', () => {
    it('should pin or unpin commands in user database profiles', async () => {
      const res = await request(app)
        .post('/api/v1/search/commands/pin')
        .send({ commandId: 'create-resume', isPinned: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.commandId).toBe('create-resume');
      expect(res.body.data.isPinned).toBe(false);
    });

    it('should reject invalid payload coordinates', async () => {
      const res = await request(app)
        .post('/api/v1/search/commands/pin')
        .send({ commandId: 'create-resume' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
