import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';

// Mock DB healthCheck utility to ensure tests run in isolation
vi.mock('../src/db/utilities', () => {
  return {
    healthCheck: vi.fn().mockResolvedValue(true),
  };
});

describe('Health & Diagnostic Endpoints', () => {
  it('should return UP on GET /api/v1/health/live', async () => {
    const res = await request(app).get('/api/v1/health/live');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
  });

  it('should return READY on GET /api/v1/health/ready', async () => {
    const res = await request(app).get('/api/v1/health/ready');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('READY');
    expect(res.body.data.database).toBe('UP');
  });

  it('should return system diagnostics on GET /api/v1/health', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('UP');
    expect(res.body.data.services.server).toBe('UP');
    expect(res.body.data.services.database).toBe('UP');
  });
});
