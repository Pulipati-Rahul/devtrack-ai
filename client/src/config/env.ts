import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:5000'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

// Since Next.js bundles public environment variables, we validate window/process references
const envObj = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NODE_ENV: process.env.NODE_ENV,
};

const parsed = envSchema.safeParse(envObj);

if (!parsed.success) {
  console.error('❌ Invalid frontend environment variables:', parsed.error.format());
  // In browser environments we warn, in server rendering we can block or log
  if (typeof window === 'undefined') {
    process.exit(1);
  }
}

export const env = parsed.data!;

export const isDev = env.NODE_ENV === 'development';
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
