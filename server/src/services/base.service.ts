import { Logger } from '../utils/logger';

export abstract class BaseService {
  protected readonly serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  protected logInfo(message: string, meta?: Record<string, unknown>): void {
    Logger.info(`[${this.serviceName}] ${message}`, meta);
  }

  protected logWarn(message: string, meta?: Record<string, unknown>): void {
    Logger.warn(`[${this.serviceName}] ${message}`, meta);
  }

  protected logError(message: string, error?: unknown, meta?: Record<string, unknown>): void {
    Logger.error(`[${this.serviceName}] ${message}`, error, meta);
  }
}
