import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from '../db/database';
import * as schema from '../db/schema';
import { env } from '../config/env';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
      const { emailService } = await import('../email/services/email.service');
      await emailService.sendVerification(user.email, user.name, url);
    },
    sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
      const { emailService } = await import('../email/services/email.service');
      await emailService.sendPasswordReset(user.email, user.name, url);
    },
  },
  trustedOrigins: [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'],
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  advanced: {
    database: {
      generateId: false, // Disables Better Auth's ID generation in favor of PostgreSQL UUID generation
    },
  },
});
