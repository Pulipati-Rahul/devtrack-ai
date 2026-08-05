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

// Mock repositories
vi.mock('../src/repositories/ats.repository', () => {
  const dummyReport = {
    id: 'report-123',
    userId: 'user-id',
    resumeId: 'res-123',
    resumeName: 'Starter Resume',
    jobTitle: 'DevOps Engineer',
    company: 'Netflix',
    jobDescription: 'Required: Kubernetes, Docker, AWS.',
    atsScore: 82,
    feedback: {
      breakdown: { formatting: 90, keywords: 80, experience: 85 },
      matchedKeywords: ['Docker'],
      missingKeywords: ['Kubernetes'],
      recommendedKeywords: ['AWS'],
      suggestions: [],
      overallFeedback: 'Good resume match.',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    atsRepository: {
      listAnalyses: vi.fn().mockResolvedValue([dummyReport]),
      getAnalysisById: vi.fn().mockResolvedValue(dummyReport),
      createAnalysis: vi.fn().mockImplementation((data) => ({
        id: 'new-report-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      deleteAnalysis: vi.fn().mockResolvedValue({ id: 'report-123' }),
      getAnalysisStats: vi.fn().mockResolvedValue({
        avgScore: 82,
        bestScore: 82,
        totalCount: 1,
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

vi.mock('../src/storage/cloudinary.client', () => {
  return {
    cloudinaryClient: {
      uploadBuffer: vi.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v12345/devtrack-ai/temporary/file.pdf',
        public_id: 'devtrack-ai/temporary/file',
        folder: 'devtrack-ai/temporary',
        created_at: new Date().toISOString(),
      }),
      deleteResource: vi.fn().mockResolvedValue(true),
    },
  };
});

describe('ATS Resume Analyzer API Endpoints', () => {
  it('should successfully upload and parse a PDF resume on POST /api/v1/ats/upload', async () => {
    const buffer = Buffer.from('fake pdf data content');
    const res = await request(app)
      .post('/api/v1/ats/upload')
      .attach('file', buffer, 'resume.pdf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.url).toBeDefined();
    expect(res.body.data.text).toBeDefined();
  });

  it('should calculate consolidated stats on GET /api/v1/ats/stats', async () => {
    const res = await request(app).get('/api/v1/ats/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.avgScore).toBe(82);
    expect(res.body.data.totalCount).toBe(1);
  });

  it('should list scan history on GET /api/v1/ats/history', async () => {
    const res = await request(app).get('/api/v1/ats/history');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].jobTitle).toBe('DevOps Engineer');
    expect(res.body.data[0].company).toBe('Netflix');
  });

  it('should get detailed report on GET /api/v1/ats/:id', async () => {
    const res = await request(app).get('/api/v1/ats/report-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('report-123');
    expect(res.body.data.feedback.overallFeedback).toBe('Good resume match.');
  });

  it('should trigger compliance analyze on POST /api/v1/ats/analyze', async () => {
    const res = await request(app)
      .post('/api/v1/ats/analyze')
      .send({
        resumeName: 'Starter Resume',
        rawResumeText: 'Experienced Node.js developer.',
        jobTitle: 'Backend Engineer',
        company: 'Uber',
        jobDescription: 'Looking for a Backend Developer skilled in Node.js.',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.atsScore).toBeGreaterThan(0);
    expect(res.body.data.jobTitle).toBe('Backend Engineer');
  });

  it('should delete report on DELETE /api/v1/ats/:id', async () => {
    const res = await request(app).delete('/api/v1/ats/report-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
