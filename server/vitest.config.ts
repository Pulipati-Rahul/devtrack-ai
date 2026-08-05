import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    env: {
      CLOUDINARY_CLOUD_NAME: 'mock-cloud',
      CLOUDINARY_API_KEY: 'mock-key',
      CLOUDINARY_API_SECRET: 'mock-secret',
      RESEND_API_KEY: 'mock-resend-key',
      EMAIL_FROM: 'noreply@example.com',
      EMAIL_REPLY_TO: 'support@example.com',
    },
  },
});
