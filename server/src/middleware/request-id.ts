import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { HEADERS } from '../constants/api-constants';

declare module 'express-serve-static-core' {
  interface Request {
    id?: string;
  }
}

export function requestId(req: Request, res: Response, next: NextFunction) {
  const reqId = (req.headers[HEADERS.REQUEST_ID] as string) || randomUUID();
  req.id = reqId;
  res.setHeader(HEADERS.REQUEST_ID, reqId);
  next();
}
