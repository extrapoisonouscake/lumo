import { QueryObserverResult } from "@tanstack/react-query";

const TTL_MAP = {
  schedule: 1000 * 60 * 60 * 24,
} as const;

export type ClientCacheTTLKey = keyof typeof TTL_MAP;

type CacheItem<T> = {
  value: T;
  expiresAt?: number;
};

// IndexedDB storage implementation
class IndexedDBStorage {
  private dbName = "app-cache";
  private storeName = "cache-store";
  private dbVersion = 1;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });

    return this.initPromise;
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.init();
    if (!this.db) return undefined;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const item = request.result;
        if (!item) {
          resolve(undefined);
          return;
        }

        try {
          const { value, expiresAt } = item as CacheItem<T>;

          if (expiresAt && Date.now() > expiresAt) {
            this.delete(key);
            resolve(undefined);
            return;
          }

          resolve(value);
        } catch (e) {
          this.delete(key);
          resolve(undefined);
        }
      };
    });
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const item: CacheItem<any> = { value };
      if (ttl) {
        item.expiresAt = Date.now() + ttl;
      }
      const request = store.put(item, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getAllKeys(): Promise<string[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  async clearExpired(): Promise<void> {
    const keys = await this.getAllKeys();
    await Promise.all(keys.map((key) => this.get(key)));
  }

  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.storeName], "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const storage = new IndexedDBStorage();

// Async cache functions
export async function getCachedClientResponse<ResponseType>(
  key: string,
  defaultValue?: ResponseType
): Promise<ResponseType | undefined> {
  const value = await storage.get<ResponseType>(key);
  if (!value) return defaultValue;
  const response = {
    ...defaultValue,
    ...value,
  } as ResponseType;
  return response as ResponseType;
}

export async function saveClientResponseToCache<ResponseType>(
  key: string,
  value: ResponseType,
  ttlKey?: string
): Promise<void> {
  await storage.set(key, value, TTL_MAP[ttlKey as ClientCacheTTLKey]);
}

export function getReactQueryMockSuccessResponse<ResponseType, ErrorShape>(
  query: QueryObserverResult<ResponseType, ErrorShape>,
  data: ResponseType
) {
  return {
    ...query,
    isFetching: false,
    isError: false,
    data,
    isPaused: false,
  };
}
