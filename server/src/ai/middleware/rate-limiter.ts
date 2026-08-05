import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '../../errors/app-errors';

const LIMIT_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 15; // 15 requests per minute

const userRequestStore = new Map<string, number[]>();

export function aiRateLimiter(req: Request, res: Response, next: NextFunction) {
  const userId = req.session?.user?.id;
  if (!userId) {
    throw new AuthenticationError('Unauthorized. Session user ID not found.');
  }

  const now = Date.now();
  const requestTimestamps = userRequestStore.get(userId) || [];

  // Filter out timestamps outside the active limit window
  const activeTimestamps = requestTimestamps.filter((time) => now - time < LIMIT_MS);

  if (activeTimestamps.length >= MAX_REQUESTS) {
    return res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. You can only make 15 AI requests per minute.',
      retryAfterSeconds: Math.ceil((LIMIT_MS - (now - activeTimestamps[0])) / 1000),
    });
  }

  // Record current request timestamp
  activeTimestamps.push(now);
  userRequestStore.set(userId, activeTimestamps);

  next();
}
