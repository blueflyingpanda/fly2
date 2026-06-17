/**
 * Tiny synchronous key/value storage adapter.
 * Web implementation backed by localStorage. For React Native, replace this
 * file with an adapter over a sync store (e.g. react-native-mmkv).
 */

const memoryFallback = new Map<string, string>();

const hasLocalStorage = (() => {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
})();

export const storage = {
  get(key: string): string | null {
    if (hasLocalStorage) {
      try {
        return localStorage.getItem(key);
      } catch {
        /* ignore */
      }
    }
    return memoryFallback.get(key) ?? null;
  },
  set(key: string, value: string): void {
    if (hasLocalStorage) {
      try {
        localStorage.setItem(key, value);
        return;
      } catch {
        /* ignore */
      }
    }
    memoryFallback.set(key, value);
  },
  remove(key: string): void {
    if (hasLocalStorage) {
      try {
        localStorage.removeItem(key);
        return;
      } catch {
        /* ignore */
      }
    }
    memoryFallback.delete(key);
  },
};
