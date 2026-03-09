export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private static readonly STORAGE_KEY_PREFIX = 'stock_analyzer_cache_';

  static set<T>(key: string, data: T, ttl: number = 3600000): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
      localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch (err) {
      console.warn('Failed to cache data', err);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
      const item = localStorage.getItem(storageKey);
      
      if (!item) return null;

      const entry: CacheEntry<T> = JSON.parse(item);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if cache has expired
      if (age > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (err) {
      console.warn('Failed to retrieve cached data', err);
      return null;
    }
  }

  static remove(key: string): void {
    try {
      const storageKey = `${this.STORAGE_KEY_PREFIX}${key}`;
      localStorage.removeItem(storageKey);
    } catch (err) {
      console.warn('Failed to remove cache', err);
    }
  }

  static clear(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (err) {
      console.warn('Failed to clear cache', err);
    }
  }

  static getSize(): number {
    try {
      let size = 0;
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_KEY_PREFIX)) {
          const item = localStorage.getItem(key);
          if (item) size += item.length;
        }
      });
      return size;
    } catch (err) {
      console.warn('Failed to calculate cache size', err);
      return 0;
    }
  }
}
