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

// Mock repositories & storage services
vi.mock('../src/repositories/profile.repository', () => {
  return {
    profileRepository: {
      getProfileByUserId: vi.fn().mockResolvedValue({
        id: 'profile-123',
        userId: 'user-id',
        fullName: 'Test Developer',
        username: 'testdev',
        avatar: 'https://cloudinary.com/testdev/avatars/old.jpg',
      }),
      updateProfile: vi.fn().mockResolvedValue({
        id: 'profile-123',
        userId: 'user-id',
        fullName: 'Test Developer',
        username: 'testdev',
        avatar: 'https://cloudinary.com/testdev/avatars/new.jpg',
      }),
    },
  };
});

vi.mock('../src/storage/upload.service', () => {
  return {
    uploadService: {
      uploadSingle: vi.fn().mockResolvedValue({
        url: 'https://cloudinary.com/testdev/avatars/new.jpg',
        publicId: 'devtrack-ai/avatars/avatar_user-id',
      }),
      deleteFile: vi.fn().mockResolvedValue({ result: 'ok' }),
    },
  };
});

describe('Profile Avatar Upload & Deletion API Endpoints', () => {
  describe('POST /api/v1/profile/avatar', () => {
    it('should successfully upload new avatar image to Cloudinary and update profile URL', async () => {
      const buffer = Buffer.from('fake image content');
      
      const res = await request(app)
        .post('/api/v1/profile/avatar')
        .attach('avatar', buffer, 'test-image.jpg');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.avatarUrl).toBe('https://cloudinary.com/testdev/avatars/new.jpg');
    });

    it('should reject requests without attached image stream file payload', async () => {
      const res = await request(app)
        .post('/api/v1/profile/avatar');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/profile/avatar', () => {
    it('should successfully remove avatar image from Cloudinary and clear profile URL', async () => {
      const res = await request(app)
        .delete('/api/v1/profile/avatar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.success).toBe(true);
    });
  });
});
