import { Response } from 'express';
import { HTTP_STATUS } from '../constants/api-constants';

export interface SuccessResponseFormat<T> {
  success: true;
  message: string;
  data: T;
}

export interface ErrorResponseFormat {
  success: false;
  message: string;
  errors?: Record<string, string[]> | unknown;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HTTP_STATUS.OK
): Response {
  const responseBody: SuccessResponseFormat<T> = {
    success: true,
    message,
    data,
  };
  return res.status(statusCode).json(responseBody);
}

export function sendError(
  res: Response,
  message: string,
  errors?: Record<string, string[]> | unknown,
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): Response {
  const responseBody: ErrorResponseFormat = {
    success: false,
    message,
  };
  if (errors !== undefined) {
    responseBody.errors = errors;
  }
  return res.status(statusCode).json(responseBody);
}
