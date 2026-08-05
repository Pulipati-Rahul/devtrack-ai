import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { isDev } from '../config/env';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
    const { method, originalUrl, id: requestId } = req;
    const { statusCode } = res;

    const meta: Record<string, unknown> = {
      method,
      url: originalUrl,
      status: statusCode,
      requestId,
      durationMs,
    };

    const message = `${method} ${originalUrl} ${statusCode} - ${durationMs}ms`;

    if (isDev) {
      Logger.performance(message, durationMs, meta);
    } else {
      Logger.info(message, meta);
    }
  });

  next();
}
