import { Injectable } from '@angular/core';
import { KVSIndexedDB, kvsIndexedDB } from '@kvs/indexeddb';

type CacheStorageSchema = {
  content: any;
  createdAt: number;
};

@Injectable({
  providedIn: 'root',
})
export class AppCacheService {
  private readonly CACHE_STORAGE_VERSION = 1;
  private storage?: KVSIndexedDB<any>;

  constructor() {}

  private async init() {
    if (this.storage) return;

    this.storage = await kvsIndexedDB<any>({
      name: 'deresposeCache',
      version: this.CACHE_STORAGE_VERSION,
    });
  }

  async getCachedJson(key: string, expires?: number) {
    await this.init();
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }

    const cacheStr = await this.storage.get(key);
    if (cacheStr === null) return undefined;

    let cache: {
      content: any;
      createdAt: number;
    };
    try {
      cache = JSON.parse(cacheStr);
    } catch (e: any) {
      return undefined;
    }
    if (!cache || !cache.content || !cache.createdAt) {
      return undefined;
    }

    const now = new Date().getTime();
    if (expires !== undefined && expires < now - cache.createdAt) {
      this.storage.delete(key);
      return undefined;
    }

    return cache['content'];
  }

  async setCachedJson(key: string, content: any) {
    await this.init();
    if (!this.storage) {
      throw new Error('Storage not initialized');
    }

    const now = new Date().getTime();

    if (typeof content === 'string') {
      content = JSON.parse(content);
    }

    const cache = {
      content: content,
      createdAt: now,
    };
    this.storage.set(key, JSON.stringify(cache));
  }
}
