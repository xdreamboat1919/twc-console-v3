/**
 * Browser persistence.
 *
 * Workspace data lives in IndexedDB. Versioned checkpoints allow recovery from a
 * bad edit. Nothing here knows what a restart cell or a creative verdict is;
 * features declare what they persist.
 */

const DB_NAME = 'twc-console';
const DB_VERSION = 1;
const STATE_STORE = 'state';
const CHECKPOINT_STORE = 'checkpoints';
const MAX_CHECKPOINTS = 20;

export interface Checkpoint {
  readonly id: number;
  readonly at: string;
  readonly label: string;
  readonly payload: unknown;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function open(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STATE_STORE)) db.createObjectStore(STATE_STORE);
      if (!db.objectStoreNames.contains(CHECKPOINT_STORE)) {
        db.createObjectStore(CHECKPOINT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB unavailable'));
  });
  return dbPromise;
}

function transact<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(store, mode);
        const request = run(tx.objectStore(store));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Transaction failed'));
      }),
  );
}

export const isAvailable = (): boolean => typeof indexedDB !== 'undefined';

export function save(key: string, value: unknown): Promise<IDBValidKey> {
  return transact(STATE_STORE, 'readwrite', (s) => s.put(value, key));
}

export function load<T>(key: string): Promise<T | undefined> {
  return transact<T | undefined>(STATE_STORE, 'readonly', (s) => s.get(key));
}

export async function checkpoint(label: string, payload: unknown): Promise<void> {
  await transact(CHECKPOINT_STORE, 'readwrite', (s) =>
    s.add({ at: new Date().toISOString(), label, payload }),
  );
  await prune();
}

export function checkpoints(): Promise<Checkpoint[]> {
  return transact<Checkpoint[]>(CHECKPOINT_STORE, 'readonly', (s) => s.getAll());
}

/** Keeps only the most recent checkpoints so storage cannot grow without bound. */
async function prune(): Promise<void> {
  const all = await checkpoints();
  const excess = all.length - MAX_CHECKPOINTS;
  if (excess <= 0) return;
  const doomed = all.sort((a, b) => a.id - b.id).slice(0, excess);
  await Promise.all(
    doomed.map((c) => transact(CHECKPOINT_STORE, 'readwrite', (s) => s.delete(c.id))),
  );
}
