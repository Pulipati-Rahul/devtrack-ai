import { Response } from 'express';
import { sendSuccess } from '../responses/api-responses';
import { HTTP_STATUS } from '../constants/api-constants';

export abstract class BaseController {
  protected ok<T>(res: Response, data: T, message?: string): Response {
    return sendSuccess(res, data, message, HTTP_STATUS.OK);
  }

  protected created<T>(res: Response, data: T, message?: string): Response {
    return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
  }

  protected noContent(res: Response, message?: string): Response {
    return sendSuccess(res, null, message, HTTP_STATUS.NO_CONTENT);
  }
}
