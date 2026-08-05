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

// Mock settings repository methods to avoid hitting live postgres
vi.mock('../src/repositories/settings.repository', () => {
  return {
    settingsRepository: {
      getSettings: vi.fn().mockResolvedValue({
        id: 'settings-123',
        userId: 'user-id',
        theme: 'system',
        language: 'en',
        name: 'John Doe',
        image: 'photo',
        notifications: {},
        privacy: {},
        aiPreferences: {},
        resumePreferences: {},
        portfolioPreferences: {},
        appearance: {},
      }),
      updateSettings: vi.fn().mockResolvedValue({ id: 'settings-123' }),
      getSessions: vi.fn().mockResolvedValue([{ id: 'sess-123', userAgent: 'Chrome', ipAddress: '127.0.0.1' }]),
      deleteSession: vi.fn().mockResolvedValue({ id: 'sess-123' }),
      deleteUserAccount: vi.fn().mockResolvedValue({ id: 'user-id' }),
      updateUserProfile: vi.fn().mockResolvedValue({ id: 'user-id' }),
      clearAiHistory: vi.fn().mockResolvedValue(true),
      clearAnalyticsData: vi.fn().mockResolvedValue(true),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('Settings & User Preferences API Endpoints', () => {
  it('should get user settings on GET /api/v1/settings', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('John Doe');
  });

  it('should update user preferences on PUT /api/v1/settings', async () => {
    const res = await request(app)
      .put('/api/v1/settings')
      .send({ theme: 'dark' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should export user settings and data on POST /api/v1/export', async () => {
    const res = await request(app).post('/api/v1/export');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.preferences.theme).toBe('system');
  });

  it('should clear user data segments on POST /api/v1/delete-data', async () => {
    const res = await request(app)
      .post('/api/v1/delete-data')
      .send({ target: 'ai' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.target).toBe('ai');
  });
});
