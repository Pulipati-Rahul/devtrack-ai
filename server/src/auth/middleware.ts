import { Request, Response, NextFunction } from 'express';
import { IncomingHttpHeaders } from 'http';
import { auth } from './auth';

interface UserSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name: string;
    image?: string | null;
    role: 'USER' | 'ADMIN';
    createdAt: Date;
    updatedAt: Date;
  };
}

declare module 'express-serve-static-core' {
  interface Request {
    session?: UserSession | null;
  }
}

// Convert Node's IncomingHttpHeaders to Fetch API Headers
function convertHeaders(incoming: IncomingHttpHeaders): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(incoming)) {
    if (typeof value === 'string') {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((val) => headers.append(key, val));
    }
  }
  return headers;
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: convertHeaders(req.headers),
    });
    req.session = session as UserSession | null;
    next();
  } catch (error) {
    console.error('Error fetching session in optionalAuth:', error);
    next();
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: convertHeaders(req.headers),
    });
    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access. Session not found.',
      });
    }
    req.session = session as UserSession;
    next();
  } catch (error) {
    console.error('Error in requireAuth middleware:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Authentication check failed.',
    });
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (!req.session || req.session.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden. Administrative access required.',
    });
  }
  next();
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  await requireAuth(req, res, () => {
    if (!req.session) return;
    if (req.session.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden. Administrative access required.',
      });
    }
    next();
  });
}

