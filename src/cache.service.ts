import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';

export class CacheService {
  TTL = 60 * 1000; // 1 minute
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async add({ key, value }: { key: string; value: string }): Promise<string> {
    return this.cacheManager.set<string>(key, value);
  }

  async get(key: string) {
    return this.cacheManager.get(key);
  }

  async del(key: string) {
    return this.cacheManager.del(key);
  }

  async clear() {
    return this.cacheManager.clear();
  }
}
