import { useSyncExternalStore } from 'react';
import { CartItem, Flyer } from '@/types/flyer';

// Event emitter for local state updates
const listeners = new Map<string, Set<() => void>>();

function emitChange(key: string) {
  const set = listeners.get(key);
  if (set) {
    set.forEach((cb) => cb());
  }
}

function subscribeKey(key: string, callback: () => void) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  listeners.get(key)!.add(callback);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === key) {
      callback();
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', handleStorage);
  }

  return () => {
    listeners.get(key)?.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', handleStorage);
    }
  };
}

export function getStorageItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

export function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange(key);
  } catch (e) {
    console.error('Error writing to storage:', e);
  }
}

/**
 * Hydration-safe hook for reading localStorage with useSyncExternalStore.
 * Guarantees zero hydration mismatch between SSR HTML and Client.
 */
export function useSyncedStorage<T>(key: string, fallback: T): [T, (val: T | ((prev: T) => T)) => void] {
  const rawValue = useSyncExternalStore(
    (callback) => subscribeKey(key, callback),
    () => {
      try {
        const item = localStorage.getItem(key);
        return item ?? '__EMPTY__';
      } catch {
        return '__EMPTY__';
      }
    },
    () => '__EMPTY__'
  );

  const value: T = rawValue === '__EMPTY__' ? fallback : JSON.parse(rawValue);

  const setValue = (newVal: T | ((prev: T) => T)) => {
    const resolved = typeof newVal === 'function' ? (newVal as (prev: T) => T)(value) : newVal;
    setStorageItem(key, resolved);
  };

  return [value, setValue];
}
