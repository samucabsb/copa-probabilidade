import { database } from '../database/databaseAdapter.js';
import { env } from '../config/env.js';

export class CacheRepository {
  get(key) {
    return database.getCache(key, env.cacheTtlHours);
  }

  set(key, value) {
    database.setCache(key, value);
  }
}

export const cacheRepository = new CacheRepository();
