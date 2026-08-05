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

// Mock repositories to avoid live postgres database connection
vi.mock('../src/repositories/analytics.repository', () => {
  return {
    analyticsRepository: {
      getResumesCount: vi.fn().mockResolvedValue(1),
      getProjectsCounts: vi.fn().mockResolvedValue({ active: 1, completed: 1, total: 2 }),
      getTasksCounts: vi.fn().mockResolvedValue({ completed: 5, total: 10 }),
      getDsaProblemsCounts: vi.fn().mockResolvedValue({ easy: 10, medium: 5, hard: 1, total: 16 }),
      getDsaProblemsSolvedTodayCount: vi.fn().mockResolvedValue(1),
      getDsaProblemSolveDates: vi.fn().mockResolvedValue([new Date()]),
      getInterviewSessionsCounts: vi.fn().mockResolvedValue(2),
      getLatestInterviewSession: vi.fn().mockResolvedValue({
        id: 'session-123',
        createdAt: new Date(),
        score: 85,
        completedAt: new Date(),
      }),
      getProfileCompletenessDetails: vi.fn().mockResolvedValue({
        bio: 'Developer bio',
        fullName: 'Test User',
        phone: '1234',
        githubUrl: 'git',
        linkedinUrl: 'link',
        skillsCount: 5,
        experiencesCount: 2,
        educationsCount: 1,
      }),
      getLatestResumes: vi.fn().mockResolvedValue([{ id: 'resume-123', name: 'Resume Draft', updatedAt: new Date() }]),
      getUpcomingProjectDeadlines: vi.fn().mockResolvedValue([]),
      getActivityLogs: vi.fn().mockResolvedValue([]),
      getAllProjects: vi.fn().mockResolvedValue([]),
      getAllResumes: vi.fn().mockResolvedValue([]),
      getAllDsaProblems: vi.fn().mockResolvedValue([]),
      getAllDsaRevisions: vi.fn().mockResolvedValue([]),
      getAllInterviewSessions: vi.fn().mockResolvedValue([]),
      getPortfolioDetails: vi.fn().mockResolvedValue(null),
      saveSnapshot: vi.fn().mockResolvedValue({ id: 'snapshot-id' }),
      listSnapshots: vi.fn().mockResolvedValue([]),
      saveReport: vi.fn().mockResolvedValue({ id: 'report-id' }),
      listReports: vi.fn().mockResolvedValue([]),
    },
  };
});

// Mock Centralized AI Service
vi.mock('../src/ai/services/ai.service', () => {
  return {
    aiService: {
      generate: vi.fn().mockResolvedValue({
        content: JSON.stringify({
          title: 'Weekly Performance Report',
          summary: 'Weekly progress summary text',
          insights: {
            strengths: ['Algorithmic correctness'],
            weaknesses: ['Missing systems structure designs'],
            missingSkills: ['System Design'],
            mostActiveWeek: 'Week 3',
            leastActiveWeek: 'Week 1',
            improvementSuggestions: ['Solve more Medium level problems'],
            placementReadiness: 'Partially Ready',
          },
          actionItems: [{ label: 'Practice behavioral interview models', deadlineDays: 7 }],
        }),
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

describe('Analytics & Insights Module API Endpoints', () => {
  it('should fetch dashboard overview on GET /api/v1/analytics/dashboard', async () => {
    const res = await request(app).get('/api/v1/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.progressOverview.activeProjects).toBe(1);
  });

  it('should save daily/weekly snapshots on POST /api/v1/analytics/snapshots', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/snapshots')
      .send({ snapshotType: 'weekly' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should list snapshots on GET /api/v1/analytics/snapshots', async () => {
    const res = await request(app).get('/api/v1/analytics/snapshots');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should generate report using Gemini on POST /api/v1/analytics/reports/generate', async () => {
    const res = await request(app)
      .post('/api/v1/analytics/reports/generate')
      .send({ reportType: 'weekly' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should list reports on GET /api/v1/analytics/reports', async () => {
    const res = await request(app).get('/api/v1/analytics/reports');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get activities timeline on GET /api/v1/analytics/timeline', async () => {
    const res = await request(app).get('/api/v1/analytics/timeline');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
