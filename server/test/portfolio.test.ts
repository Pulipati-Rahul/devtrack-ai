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
vi.mock('../src/repositories/portfolio.repository', () => {
  const dummyPortfolio = {
    id: 'port-123',
    userId: 'user-id',
    headline: 'Senior Full Stack Engineer',
    bio: 'Experienced React developer.',
    theme: 'Modern',
    published: true,
    publicSlug: 'alexdev',
    appearance: { primaryColor: '#fff', accentColor: '#000' },
    sectionsConfig: [{ id: 'hero', name: 'Hero', visible: true, sortOrder: 1 }],
    seoSettings: { title: 'Alex Dev space', description: 'Bio' },
    socialLinks: { github: 'https://github.com/alex' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyDevDetails = {
    user: { name: 'Alex', email: 'test@example.com', image: null },
    profile: { headline: 'Senior Full Stack Engineer', bio: 'Experienced React developer.' },
    educations: [],
    experiences: [],
    skills: [{ id: 'skill-1', name: 'React' }],
    certifications: [],
    achievements: [],
  };

  return {
    portfolioRepository: {
      getPortfolioByUserId: vi.fn().mockResolvedValue(dummyPortfolio),
      getPortfolioById: vi.fn().mockResolvedValue(dummyPortfolio),
      getPortfolioBySlug: vi.fn().mockResolvedValue(dummyPortfolio),
      createPortfolio: vi.fn().mockImplementation((data) => ({
        id: 'new-port-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      updatePortfolio: vi.fn().mockImplementation((id, data) => ({
        ...dummyPortfolio,
        ...data,
        updatedAt: new Date(),
      })),
      deletePortfolio: vi.fn().mockResolvedValue({ id: 'port-123' }),
      checkSlugExists: vi.fn().mockResolvedValue(false),
      syncPortfolioProjects: vi.fn().mockResolvedValue(true),
      getPortfolioProjects: vi.fn().mockResolvedValue([]),
      getFullDeveloperDetails: vi.fn().mockResolvedValue(dummyDevDetails),
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

describe('Portfolio Manager Module API Endpoints', () => {
  it('should retrieve portfolio config on GET /api/v1/portfolio', async () => {
    const res = await request(app).get('/api/v1/portfolio');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.portfolio.headline).toBe('Senior Full Stack Engineer');
  });

  it('should save portfolio config on POST /api/v1/portfolio', async () => {
    const res = await request(app)
      .post('/api/v1/portfolio')
      .send({ publicSlug: 'alexdev' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.portfolio.publicSlug).toBe('alexdev');
  });

  it('should toggle publish status on POST /api/v1/portfolio/publish', async () => {
    const res = await request(app).post('/api/v1/portfolio/publish');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.published).toBe(true);
  });

  it('should load profile details for auto-import on GET /api/v1/portfolio/import/profile', async () => {
    const res = await request(app).get('/api/v1/portfolio/import/profile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.headline).toBe('Senior Full Stack Engineer');
  });

  it('should serve public portfolio on GET /api/v1/portfolio/:slug', async () => {
    const res = await request(app).get('/api/v1/portfolio/alexdev');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.portfolio.publicSlug).toBe('alexdev');
    expect(res.body.data.developer.user.name).toBe('Alex');
  });

  it('should delete portfolio configuration on DELETE /api/v1/portfolio', async () => {
    const res = await request(app).delete('/api/v1/portfolio');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
