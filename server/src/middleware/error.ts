import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';
import { AppError, ValidationError } from '../errors/app-errors';
import { sendError } from '../responses/api-responses';
import { HTTP_STATUS, MESSAGES } from '../constants/api-constants';
import { isDev } from '../config/env';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log the error with request metadata context
  Logger.error(`Error handling route ${req.method} ${req.originalUrl}`, err, {
    requestId: req.id,
  });

  let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message: string = MESSAGES.INTERNAL_SERVER_ERROR;
  let errors: Record<string, string[]> | unknown = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;

    if (err instanceof ValidationError) {
      errors = err.errors;
    }
  } else {
    // For non-AppError exceptions (unhandled system bugs)
    if (isDev) {
      message = err.message;
      errors = {
        stack: err.stack,
      };
    } else {
      message = MESSAGES.INTERNAL_SERVER_ERROR;
    }
  }

  sendError(res, message, errors, statusCode);
}
