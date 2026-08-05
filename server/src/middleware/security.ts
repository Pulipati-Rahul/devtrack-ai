import { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';
import { LIMITS, MESSAGES } from '../constants/api-constants';

export function configureSecurity(app: Express) {
  // Trust proxy (necessary for accurate rate limiting when deployed behind a proxy like Nginx/Cloudflare)
  app.set('trust proxy', 1);

  // Helmet secure headers
  app.use(helmet());

  // CORS Configuration
  const allowedOrigins = [env.CLIENT_URL, 'http://localhost:3000', 'http://localhost:3001'];
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  }));

  // Gzip compression
  app.use(compression());

  // Cookie Parser
  app.use(cookieParser(env.BETTER_AUTH_SECRET));

  // Global Rate Limiting for API routes
  const limiter = rateLimit({
    windowMs: LIMITS.RATE_LIMIT_WINDOW_MS,
    max: LIMITS.RATE_LIMIT_MAX,
    message: {
      success: false,
      message: MESSAGES.TOO_MANY_REQUESTS,
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api', limiter);
}

export function configureBodyParsers(app: Express) {
  // Request body parsing limits
  app.use(express.json({ limit: LIMITS.MAX_REQUEST_SIZE }));
  app.use(express.urlencoded({ extended: true, limit: LIMITS.MAX_REQUEST_SIZE }));
}
