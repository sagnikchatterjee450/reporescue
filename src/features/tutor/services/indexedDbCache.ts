/**
 * IndexedDB Cache for Tutor RepoModels (keyed by owner/repo@commitSha)
 */
import { RepoModel } from '../types';
import { TUTOR_CONFIG } from '../config';

const DB_NAME = TUTOR_CONFIG.CACHE.DB_NAME;
const DB_VERSION = TUTOR_CONFIG.CACHE.DB_VERSION;
const STORE_NAME = TUTOR_CONFIG.CACHE.STORE_NAME;

// In-memory fallback if IndexedDB is unavailable
const memoryCache = new Map<string, { model: RepoModel; savedAt: number }>();

function getDbKey(repoUrl: string, commitSha: string): string {
  const cleanUrl = repoUrl.toLowerCase().trim().replace(/\/$/, '');
  return `${cleanUrl}@${commitSha || 'latest'}`;
}

function openDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function getCachedRepoModel(repoUrl: string, commitSha: string): Promise<RepoModel | null> {
  const key = getDbKey(repoUrl, commitSha);

  // Check in-memory first
  const memItem = memoryCache.get(key);
  if (memItem) {
    if (Date.now() - memItem.savedAt < TUTOR_CONFIG.CACHE.TTL_MS) {
      return memItem.model;
    }
    memoryCache.delete(key);
  }

  const db = await openDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const result = req.result;
        if (result && result.model) {
          if (Date.now() - result.savedAt < TUTOR_CONFIG.CACHE.TTL_MS) {
            // Keep memory cache warm
            memoryCache.set(key, { model: result.model, savedAt: result.savedAt });
            resolve(result.model);
            return;
          }
        }
        resolve(null);
      };

      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setCachedRepoModel(model: RepoModel): Promise<void> {
  const key = getDbKey(model.repoUrl, model.commitSha);
  const record = {
    key,
    model,
    savedAt: Date.now(),
  };

  // Update in-memory
  memoryCache.set(key, { model, savedAt: record.savedAt });

  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(record);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function clearTutorCache(): Promise<void> {
  memoryCache.clear();
  const db = await openDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}
