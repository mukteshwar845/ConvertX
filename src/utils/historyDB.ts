/**
 * historyDB.ts
 *
 * Wraps browser IndexedDB for storing ConvertX conversion history records.
 *
 * Privacy guarantees:
 *   - 100% local — no data ever leaves the device
 *   - No backend calls — all operations run entirely in the browser
 *   - Users own their own data; each browser profile is independent
 *   - Storage limit is device-determined (typically 50–80% of free disk)
 *
 * Replaces localStorage (which has a hard 5 MB cap and is synchronous).
 */

import { HistoryRecord } from '../types';

const DB_NAME = 'ConvertX_DB';
const DB_VERSION = 1;
const STORE_NAME = 'history';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // Index for fast chronological sorting
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Load all records ordered newest-first */
export async function dbGetAllHistory(): Promise<HistoryRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    // Open a reverse cursor (DESC order) to get newest-first
    const results: HistoryRecord[] = [];
    const req = index.openCursor(null, 'prev');
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor) {
        results.push(cursor.value as HistoryRecord);
        cursor.continue();
      } else {
        resolve(results);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

/** Insert or update a single record */
export async function dbSaveRecord(record: HistoryRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Delete a single record by id */
export async function dbDeleteRecord(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Delete ALL records — used by "Clear History" */
export async function dbClearAllHistory(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/** Migrate any existing localStorage history into IndexedDB (one-time, then removes the old key) */
export async function migrateFromLocalStorage(): Promise<void> {
  const OLD_KEY = 'docuconvert_history';
  try {
    const raw = localStorage.getItem(OLD_KEY);
    if (!raw) return;
    const records: HistoryRecord[] = JSON.parse(raw);
    if (!Array.isArray(records) || records.length === 0) {
      localStorage.removeItem(OLD_KEY);
      return;
    }
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      records.forEach((r) => store.put(r));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    localStorage.removeItem(OLD_KEY);
  } catch {
    // Non-fatal — migration failure just means the old history isn't imported
  }
}
