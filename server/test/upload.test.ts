import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock session verification
vi.mock('../src/auth/auth', () => {
  return {
    auth: {
      api: {
        getSession: vi.fn().mockResolvedValue({
          session: { id: 'session-id', userId: 'user-id' },
          user: { id: 'user-id', email: 'dev@example.com', role: 'USER' },
        }),
      },
    },
  };
});

// Mock Cloudinary Client SDK calls
vi.mock('../src/storage/cloudinary.client', () => {
  return {
    cloudinaryClient: {
      uploadBuffer: vi.fn().mockResolvedValue({
        secure_url: 'https://res.cloudinary.com/demo/image/upload/v12345/devtrack-ai/temporary/file.png',
        public_id: 'devtrack-ai/temporary/file',
        folder: 'devtrack-ai/temporary',
        created_at: new Date().toISOString(),
      }),
      deleteResource: vi.fn().mockResolvedValue(true),
    },
  };
});

describe('File Storage Infrastructure API Endpoints', () => {
  describe('Single File Upload', () => {
    it('should upload a single image buffer successfully to Cloudinary', async () => {
      const buffer = Buffer.from('fake image binary content');
      const res = await request(app)
        .post('/api/v1/upload')
        .attach('file', buffer, 'profile.jpg')
        .field('folder', 'profile-images');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.url).toContain('cloudinary.com');
      expect(res.body.data.publicId).toBe('devtrack-ai/temporary/file');
    });

    it('should throw validation error for unsupported mime-types', async () => {
      const buffer = Buffer.from('plain text file');
      const res = await request(app)
        .post('/api/v1/upload')
        .attach('file', buffer, 'unsupported.html')
        .field('folder', 'temporary');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unsupported file type');
    });
  });

  describe('Multiple Files Upload', () => {
    it('should upload multiple attachments successfully', async () => {
      const buffer1 = Buffer.from('fake document content');
      const buffer2 = Buffer.from('fake zip archive content');

      const res = await request(app)
        .post('/api/v1/upload/multiple')
        .attach('files', buffer1, 'resume.pdf')
        .attach('files', buffer2, 'source.zip')
        .field('folder', 'project-files');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(2);
    });
  });

  describe('File Deletion', () => {
    it('should trigger resource destruction successfully using query param', async () => {
      const res = await request(app).delete('/api/v1/upload').query({ publicId: 'devtrack-ai/temporary/file' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
