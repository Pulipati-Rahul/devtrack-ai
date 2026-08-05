import { Logger } from '../utils/logger';

export interface CacheStore {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T, ttlSeconds?: number): void;
  delete(key: string): void;
  clear(): void;
}

class InMemoryCache implements CacheStore {
  private store = new Map<string, { value: unknown; expiresAt: number }>();

  get<T>(key: string): T | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      Logger.debug(`Cache expired for key: ${key}`);
      return null;
    }

    return item.value as T;
  }

  set<T>(key: string, value: T, ttlSeconds = 60): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
    Logger.debug(`Cache set for key: ${key} with TTL: ${ttlSeconds}s`);
  }

  delete(key: string): void {
    this.store.delete(key);
    Logger.debug(`Cache deleted for key: ${key}`);
  }

  clear(): void {
    this.store.clear();
    Logger.info('Cache store cleared completely');
  }
}

export const cacheStore: CacheStore = new InMemoryCache();
