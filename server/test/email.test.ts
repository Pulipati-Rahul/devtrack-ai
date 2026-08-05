import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock session
vi.mock('../src/auth/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: { id: 'session-id', userId: 'user-id' },
          user: { id: 'user-id', email: 'dev@example.com', name: 'Test Dev', role: 'USER' },
        }),
      },
    },
  };
});

// Mock Resend provider to prevent real API calls
vi.mock('../src/email/providers/resend.provider', () => {
  return {
    resendProvider: {
      send: vi.fn().mockResolvedValue({ id: 'mock-resend-id-123' }),
    },
  };
});

// Mock settings repository for preference checks
vi.mock('../src/repositories/settings.repository', () => {
  return {
    settingsRepository: {
      getSettings: vi.fn().mockResolvedValue({
        notifications: {
          email: true,
          resumeAlerts: true,
          dsaReminders: true,
          interviewReminders: true,
          securityAlerts: true,
          portfolioAlerts: true,
        },
      }),
      updateSettings: vi.fn().mockResolvedValue({}),
      getSessions: vi.fn().mockResolvedValue([]),
      deleteSession: vi.fn().mockResolvedValue(null),
      deleteUserAccount: vi.fn().mockResolvedValue(null),
      updateUserProfile: vi.fn().mockResolvedValue(null),
    },
  };
});

describe('Email Service Infrastructure API Endpoints', () => {
  describe('POST /api/v1/email/send', () => {
    it('should queue a transactional email successfully', async () => {
      const res = await request(app)
        .post('/api/v1/email/send')
        .send({ to: 'user@example.com', name: 'User', subject: 'Test', message: 'Hello' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('queued');
    });

    it('should reject missing payload parameters', async () => {
      const res = await request(app)
        .post('/api/v1/email/send')
        .send({ to: 'user@example.com' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/email/test', () => {
    it('should queue a test welcome email to the authenticated user', async () => {
      const res = await request(app).post('/api/v1/email/test');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('dev@example.com');
    });
  });

  describe('GET /api/v1/email/status', () => {
    it('should return the email queue status', async () => {
      const res = await request(app).get('/api/v1/email/status');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('pendingTasks');
      expect(res.body.data).toHaveProperty('processing');
    });
  });
});
