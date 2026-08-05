import { db } from '../db/database';
import * as schema from '../db/schema';
import { env } from '../config/env';

let authInstance: any = null;

async function getAuth() {
  if (!authInstance) {
    const { betterAuth } = await import('better-auth');
    const { drizzleAdapter } = await import('better-auth/adapters/drizzle');
    authInstance = betterAuth({
      database: drizzleAdapter(db, {
        provider: 'pg',
        schema: schema,
      }),
      emailAndPassword: {
        enabled: true,
        autoSignIn: true,
        sendVerificationEmail: async ({ user, url }: { user: any; url: string }) => {
          const { emailService } = await import('../email/services/email.service.js');
          await emailService.sendVerification(user.email, user.name, url);
        },
        sendResetPassword: async ({ user, url }: { user: any; url: string }) => {
          const { emailService } = await import('../email/services/email.service.js');
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
        defaultCookieAttributes: {
          sameSite: 'none',
          secure: true,
        },
      },
    });
  }
  return authInstance;
}

export const auth = {
  get api() {
    return {
      getSession: async (options: any) => {
        const instance = await getAuth();
        return instance.api.getSession(options);
      }
    };
  },
  handler: async (request: any) => {
    const instance = await getAuth();
    return instance.handler(request);
  }
};
