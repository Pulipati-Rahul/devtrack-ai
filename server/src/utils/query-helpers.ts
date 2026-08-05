import { sql } from 'drizzle-orm';
import { PgColumn } from 'drizzle-orm/pg-core';
import { LIMITS } from '../constants/api-constants';

export interface PaginationResult {
  limit: number;
  offset: number;
  page: number;
}

export function getPaginationOptions(page?: number | string, limit?: number | string): PaginationResult {
  const parsedPage = typeof page === 'string' ? parseInt(page, 10) : page;
  const parsedLimit = typeof limit === 'string' ? parseInt(limit, 10) : limit;

  const safePage = parsedPage && parsedPage > 0 ? parsedPage : LIMITS.DEFAULT_PAGE;
  const safeLimit = parsedLimit && parsedLimit > 0 ? Math.min(parsedLimit, LIMITS.MAX_LIMIT) : LIMITS.DEFAULT_LIMIT;
  const offset = (safePage - 1) * safeLimit;

  return {
    limit: safeLimit,
    offset,
    page: safePage,
  };
}

export function buildSearchFilter(searchTerm: string, columns: PgColumn[]) {
  if (!searchTerm || columns.length === 0) return undefined;
  
  const searchLower = `%${searchTerm.toLowerCase()}%`;
  const conditions = columns.map(col => sql`lower(${col}) like ${searchLower}`);
  return sql.join(conditions, sql` or `);
}

export function formatDateISO(date: Date | string | number): string {
  return new Date(date).toISOString();
}

export function isPastDate(date: Date | string | number): boolean {
  return new Date(date).getTime() < Date.now();
}
