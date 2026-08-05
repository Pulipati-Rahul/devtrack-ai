import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Hoisted variable to test non-admin 403 security blocks
let mockUserRole = 'ADMIN';

vi.mock('../src/auth/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn().mockImplementation(() => {
          return {
            session: { id: 'session-id', userId: 'user-id' },
            user: { id: 'user-id', email: 'admin@example.com', role: mockUserRole },
          };
        }),
      },
    },
  };
});

// Stateful mock db for admin tests
const mockUsersDb = new Map<string, any>();
const dummyUser = {
  id: 'usr-123',
  name: 'Test Dev',
  email: 'dev@example.com',
  role: 'USER',
  createdAt: new Date(),
};
mockUsersDb.set('usr-123', dummyUser);

vi.mock('../src/repositories/admin.repository', () => {
  return {
    adminRepository: {
      getDashboardMetrics: vi.fn().mockResolvedValue({
        totalUsers: 1,
        activeUsers: 1,
        totalResumes: 2,
        totalProjects: 3,
        totalPortfolios: 1,
        totalAiRequests: 5,
      }),
      getUsers: vi.fn().mockImplementation(() => Array.from(mockUsersDb.values())),
      getUserDetails: vi.fn().mockImplementation((userId) => {
        const profile = mockUsersDb.get(userId);
        if (!profile) return null;
        return {
          profile,
          resumeCount: 2,
          projectCount: 3,
          portfolios: [],
          aiRequestsCount: 5,
        };
      }),
      updateUser: vi.fn().mockImplementation((userId, data) => {
        const current = mockUsersDb.get(userId) || {};
        const updated = { ...current, ...data };
        mockUsersDb.set(userId, updated);
        return updated;
      }),
      deleteUser: vi.fn().mockImplementation((userId) => {
        const deleted = mockUsersDb.get(userId);
        mockUsersDb.delete(userId);
        return deleted || null;
      }),
      getActivityLogs: vi.fn().mockResolvedValue([
        { id: 'log-1', action: 'USER_LOGIN', userId: 'usr-123', createdAt: new Date() },
      ]),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('Admin Panel Module API Endpoints & RBAC Security', () => {
  beforeEach(() => {
    mockUserRole = 'ADMIN'; // Reset role to admin before each test
  });

  describe('Security & RBAC Blocks', () => {
    it('should block non-admin requests with HTTP 403 on GET /api/v1/admin/dashboard', async () => {
      mockUserRole = 'USER'; // Alter role to user
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Forbidden');
    });
  });

  describe('Administrative Actions', () => {
    it('should retrieve metrics on GET /api/v1/admin/dashboard', async () => {
      const res = await request(app).get('/api/v1/admin/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalUsers).toBe(1);
    });

    it('should retrieve users list on GET /api/v1/admin/users', async () => {
      const res = await request(app).get('/api/v1/admin/users');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].email).toBe('dev@example.com');
    });

    it('should retrieve user details on GET /api/v1/admin/users/:id', async () => {
      const res = await request(app).get('/api/v1/admin/users/usr-123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.resumeCount).toBe(2);
    });

    it('should update user roles on PUT /api/v1/admin/users/:id', async () => {
      const res = await request(app)
        .put('/api/v1/admin/users/usr-123')
        .send({ role: 'ADMIN' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe('ADMIN');
    });

    it('should delete users accounts on DELETE /api/v1/admin/users/:id', async () => {
      const res = await request(app).delete('/api/v1/admin/users/usr-123');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should fetch server health metrics on GET /api/v1/admin/system', async () => {
      const res = await request(app).get('/api/v1/admin/system');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.apiStatus).toBe('ONLINE');
    });

    it('should retrieve action history audits on GET /api/v1/admin/logs', async () => {
      const res = await request(app).get('/api/v1/admin/logs');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data[0].action).toBe('USER_LOGIN');
    });

    it('should compile telemetry usage on GET /api/v1/admin/analytics', async () => {
      const res = await request(app).get('/api/v1/admin/analytics');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.growthRatio).toContain('14.2%');
    });
  });
});
