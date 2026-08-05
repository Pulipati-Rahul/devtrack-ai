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

// Mock profile repository
vi.mock('../src/repositories/profile.repository', () => {
  const dummyProfile = {
    id: 'profile-id',
    userId: 'user-id',
    fullName: 'Test Developer',
    username: 'testdev',
    phone: '+1-234-567-890',
    bio: 'Initial bio text',
    headline: 'Front-End Engineer',
    gender: 'Male',
    dob: new Date('1995-05-15'),
    country: 'USA',
    state: 'California',
    city: 'San Francisco',
    githubUrl: 'https://github.com/testdev',
    linkedinUrl: 'https://linkedin.com/in/testdev',
    portfolioUrl: 'https://testdev.com',
    twitterUrl: 'https://x.com/testdev',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dummyEducation = {
    id: 'edu-id',
    profileId: 'profile-id',
    college: 'Stanford University',
    degree: 'Bachelor of Science',
    branch: 'Computer Science',
    cgpa: '3.9',
    startYear: 2015,
    endYear: 2019,
    description: 'Coursework in compilers, systems, databases.',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return {
    profileRepository: {
      getProfileByUserId: vi.fn().mockResolvedValue(dummyProfile),
      isUsernameTaken: vi.fn().mockResolvedValue(false),
      getFullProfileData: vi.fn().mockResolvedValue({
        profile: dummyProfile,
        education: [dummyEducation],
        experience: [],
        skills: [],
        certifications: [],
        achievements: [],
      }),
      updateProfile: vi.fn().mockImplementation((userId, data) => ({
        ...dummyProfile,
        ...data,
        updatedAt: new Date(),
      })),
      getEducationById: vi.fn().mockResolvedValue(dummyEducation),
      createEducation: vi.fn().mockImplementation((data) => ({
        id: 'new-edu-id',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      updateEducation: vi.fn().mockImplementation((id, data) => ({
        id,
        profileId: 'profile-id',
        college: 'Updated College',
        degree: 'Master of Science',
        startYear: 2019,
        ...data,
        updatedAt: new Date(),
      })),
      deleteEducation: vi.fn().mockResolvedValue({ id: 'edu-id' }),
    },
  };
});

// Mock DB utilities health check
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('Profile Module CRUD API Endpoints', () => {
  it('should return full profile details on GET /api/v1/profile', async () => {
    const res = await request(app).get('/api/v1/profile');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.profile.fullName).toBe('Test Developer');
    expect(res.body.data.completionPercentage).toBeGreaterThan(0);
    expect(res.body.data.education[0].college).toBe('Stanford University');
  });

  it('should successfully update personal info on PUT /api/v1/profile', async () => {
    const res = await request(app)
      .put('/api/v1/profile')
      .send({ fullName: 'Updated Full Name', headline: 'Full-Stack Software Engineer' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.fullName).toBe('Updated Full Name');
    expect(res.body.data.headline).toBe('Full-Stack Software Engineer');
  });

  it('should successfully add education details on POST /api/v1/profile/education', async () => {
    const res = await request(app)
      .post('/api/v1/profile/education')
      .send({
        college: 'MIT University',
        degree: 'Master of Science',
        startYear: 2019,
        endYear: 2021,
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.college).toBe('MIT University');
    expect(res.body.data.degree).toBe('Master of Science');
  });

  it('should successfully delete education details on DELETE /api/v1/profile/education/:id', async () => {
    const res = await request(app).delete('/api/v1/profile/education/edu-id');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
