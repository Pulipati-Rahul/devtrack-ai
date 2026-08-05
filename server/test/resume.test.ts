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
vi.mock('../src/repositories/profile.repository', () => {
  return {
    profileRepository: {
      getFullProfileData: vi.fn().mockResolvedValue({
        profile: { fullName: 'Profile Developer', bio: 'Bio summary details' },
        education: [{ id: 'edu-123', college: 'MIT Tech', degree: 'M.S.', startYear: 2021, endYear: 2023 }],
        experience: [],
        skills: [],
        certifications: [],
        achievements: [],
      }),
      getProfileByUserId: vi.fn().mockResolvedValue({ id: 'p-123' }),
    },
  };
});

vi.mock('../src/repositories/resume.repository', () => {
  const dummyResume = {
    id: 'res-123',
    userId: 'user-id',
    name: 'Tech Resume',
    template: 'Modern',
    font: 'Inter',
    accentColor: '#3b82f6',
    spacing: 2,
    fontSize: 12,
    isDefault: false,
    lastExported: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummySection = {
    id: 'sec-123',
    resumeId: 'res-123',
    sectionType: 'personal',
    sortOrder: 1,
    visible: true,
    content: { fullName: 'Original Name' },
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    resumeRepository: {
      listResumes: vi.fn().mockResolvedValue([dummyResume]),
      getResumeById: vi.fn().mockResolvedValue(dummyResume),
      getResumeSections: vi.fn().mockResolvedValue([dummySection]),
      createResume: vi.fn().mockImplementation((data) => ({
        id: 'new-res-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      createResumeSection: vi.fn().mockResolvedValue({}),
      updateResume: vi.fn().mockImplementation((id, data) => ({
        ...dummyResume,
        ...data,
        updatedAt: new Date(),
      })),
      updateResumeSection: vi.fn().mockImplementation((id, data) => ({
        id,
        content: data.content,
      })),
      deleteResume: vi.fn().mockResolvedValue({ id: 'res-123' }),
      duplicateResume: vi.fn().mockResolvedValue({
        id: 'dup-res-id',
        name: 'Tech Resume Copy',
        userId: 'user-id',
        template: 'Modern',
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

describe('Resume Builder CRUD API Endpoints', () => {
  it('should list user resumes on GET /api/v1/resumes', async () => {
    const res = await request(app).get('/api/v1/resumes');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data[0].name).toBe('Tech Resume');
  });

  it('should get resume details and sections on GET /api/v1/resumes/:id', async () => {
    const res = await request(app).get('/api/v1/resumes/res-123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.resume.id).toBe('res-123');
    expect(res.body.data.sections[0].sectionType).toBe('personal');
  });

  it('should create a new resume draft on POST /api/v1/resumes', async () => {
    const res = await request(app)
      .post('/api/v1/resumes')
      .send({ name: 'Starter Layout', template: 'Professional' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Starter Layout');
    expect(res.body.data.template).toBe('Professional');
  });

  it('should successfully update theme on PUT /api/v1/resumes/:id', async () => {
    const res = await request(app)
      .put('/api/v1/resumes/res-123')
      .send({ font: 'Merriweather', spacing: 3 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.font).toBe('Merriweather');
    expect(res.body.data.spacing).toBe(3);
  });

  it('should successfully duplicate a resume layout on POST /api/v1/resumes/:id/duplicate', async () => {
    const res = await request(app)
      .post('/api/v1/resumes/res-123/duplicate')
      .send({ name: 'Tech Resume Copy' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('dup-res-id');
  });

  it('should successfully import profile details on POST /api/v1/resumes/:id/import-profile', async () => {
    const res = await request(app)
      .post('/api/v1/resumes/res-123/import-profile')
      .send({ sections: ['personal', 'education'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should log timestamp on POST /api/v1/resumes/:id/export', async () => {
    const res = await request(app).post('/api/v1/resumes/res-123/export');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.lastExported).not.toBeNull();
  });
});
