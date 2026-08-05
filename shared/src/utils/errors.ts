export class AppError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: any;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details: any = null) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
