import { isDev } from '../config/env';

export interface LogData {
  message: string;
  timestamp: string;
  level: string;
  requestId?: string;
  durationMs?: number;
  metadata?: Record<string, unknown>;
  error?: unknown;
}

export class Logger {
  private static formatLog(level: string, message: string, meta?: Record<string, unknown>, error?: unknown): string {
    const timestamp = new Date().toISOString();
    const logObj: LogData = {
      level,
      message,
      timestamp,
    };

    if (meta) {
      logObj.metadata = meta;
      if (typeof meta.requestId === 'string') {
        logObj.requestId = meta.requestId;
      }
      if (typeof meta.durationMs === 'number') {
        logObj.durationMs = meta.durationMs;
      }
    }

    if (error) {
      logObj.error = error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: isDev ? error.stack : undefined,
      } : error;
    }

    if (isDev) {
      const colorMap: Record<string, string> = {
        INFO: '\x1b[32m',  // Green
        WARN: '\x1b[33m',  // Yellow
        ERROR: '\x1b[31m', // Red
        DEBUG: '\x1b[36m', // Cyan
        PERF: '\x1b[35m',  // Magenta
      };
      const color = colorMap[level] || '\x1b[0m';
      const reset = '\x1b[0m';
      const reqIdStr = logObj.requestId ? ` [ReqID: ${logObj.requestId}]` : '';
      const durationStr = logObj.durationMs ? ` (${logObj.durationMs}ms)` : '';
      
      const filteredMeta = meta ? { ...meta } : undefined;
      if (filteredMeta) {
        delete filteredMeta.requestId;
        delete filteredMeta.durationMs;
      }
      const metaStr = filteredMeta && Object.keys(filteredMeta).length > 0
        ? ` | Meta: ${JSON.stringify(filteredMeta)}`
        : '';
      const errorStr = error ? ` | Error: ${error instanceof Error ? error.message : JSON.stringify(error)}` : '';
      
      return `${color}[${level}]${reset} [${timestamp}]${reqIdStr}${durationStr} ${message}${metaStr}${errorStr}`;
    }

    return JSON.stringify(logObj);
  }

  public static info(message: string, meta?: Record<string, unknown>) {
    console.log(this.formatLog('INFO', message, meta));
  }

  public static warn(message: string, meta?: Record<string, unknown>) {
    console.warn(this.formatLog('WARN', message, meta));
  }

  public static error(message: string, error?: unknown, meta?: Record<string, unknown>) {
    console.error(this.formatLog('ERROR', message, meta, error));
  }

  public static debug(message: string, meta?: Record<string, unknown>) {
    if (isDev) {
      console.log(this.formatLog('DEBUG', message, meta));
    }
  }

  public static performance(message: string, durationMs: number, meta?: Record<string, unknown>) {
    console.log(this.formatLog('PERF', message, { ...meta, durationMs }));
  }
}
