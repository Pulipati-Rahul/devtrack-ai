import { Router, Request, Response } from 'express';
import { healthCheck } from '../db/utilities';
import { sendSuccess, sendError } from '../responses/api-responses';
import { HTTP_STATUS } from '../constants/api-constants';
import { env } from '../config/env';

const router = Router();

// Liveness check: verifies the Express process is running
router.get('/live', (req: Request, res: Response) => {
  return sendSuccess(res, {
    status: 'UP',
    timestamp: new Date().toISOString(),
  }, 'Liveness check passed');
});

// Readiness check: verifies process is running and downstream database connection is active
router.get('/ready', async (req: Request, res: Response) => {
  const dbConnected = await healthCheck();
  if (!dbConnected) {
    return sendError(
      res,
      'Database connection failed',
      { database: 'DOWN' },
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  return sendSuccess(res, {
    status: 'READY',
    database: 'UP',
    timestamp: new Date().toISOString(),
  }, 'Readiness check passed');
});

// Detailed full system diagnostic health status
router.get('/', async (req: Request, res: Response) => {
  const dbConnected = await healthCheck();
  const uptime = process.uptime();
  const diagnosticData = {
    status: dbConnected ? 'UP' : 'DEGRADED',
    environment: env.NODE_ENV,
    version: '1.0.0',
    uptime,
    timestamp: new Date().toISOString(),
    services: {
      database: dbConnected ? 'UP' : 'DOWN',
      server: 'UP',
    },
  };

  if (!dbConnected) {
    return sendError(res, 'System is degraded', diagnosticData, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  return sendSuccess(res, diagnosticData, 'System is healthy');
});

export default router;
