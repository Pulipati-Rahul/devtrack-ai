import { sql } from 'drizzle-orm';
import { Logger } from 'drizzle-orm/logger';
import { db } from './database';

class DatabaseLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DB Query]: ${query}`);
      if (params && params.length > 0) {
        console.log(`[DB Params]:`, params);
      }
    }
  }
}

export const dbLogger = new DatabaseLogger();

export async function healthCheck(): Promise<boolean> {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function transactionHelper<T>(
  callback: (tx: any) => Promise<T>
): Promise<T> {
  return await db.transaction(callback);
}

export function paginationHelper(page = 1, limit = 10) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(100, limit));
  const offset = (safePage - 1) * safeLimit;
  return {
    limit: safeLimit,
    offset,
  };
}
