import { CustomPattern } from '@/types';

/**
 * IndexedDB-based storage for PupStitch patterns.
 *
 * IndexedDB provides ~hundreds of MB of storage (vs localStorage's 5MB),
 * so we can safely store full pattern data including photo thumbnails.
 */

const DB_NAME = 'pupstitch';
const DB_VERSION = 1;
const PATTERNS_STORE = 'patterns';

/**
 * Open (or create) the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('IndexedDB not available server-side'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PATTERNS_STORE)) {
        const store = db.createObjectStore(PATTERNS_STORE, { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('breedId', 'breedId', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Revive date fields on a pattern loaded from storage
 */
function reviveDates(pattern: CustomPattern): CustomPattern {
  pattern.createdAt = new Date(pattern.createdAt);
  pattern.updatedAt = new Date(pattern.updatedAt);
  if (pattern.analysisResult) {
    pattern.analysisResult.analysisTimestamp = new Date(
      pattern.analysisResult.analysisTimestamp
    );
  }
  if (pattern.editorState) {
    pattern.editorState.lastEditedAt = new Date(
      pattern.editorState.lastEditedAt
    );
  }
  return pattern;
}

// ============================================================================
// PUBLIC API — all async
// ============================================================================

/**
 * Save a pattern to IndexedDB
 */
export async function savePattern(pattern: CustomPattern): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PATTERNS_STORE, 'readwrite');
      tx.objectStore(PATTERNS_STORE).put(JSON.parse(JSON.stringify(pattern)));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[Storage] Error saving pattern:', error);
    throw error;
  }
}

/**
 * Load a pattern by ID
 */
export async function loadPattern(id: string): Promise<CustomPattern | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PATTERNS_STORE, 'readonly');
      const request = tx.objectStore(PATTERNS_STORE).get(id);
      request.onsuccess = () => {
        const result = request.result as CustomPattern | undefined;
        resolve(result ? reviveDates(result) : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Storage] Error loading pattern:', error);
    return null;
  }
}

/**
 * Load all saved patterns, sorted newest first
 */
export async function loadAllPatterns(): Promise<CustomPattern[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PATTERNS_STORE, 'readonly');
      const request = tx.objectStore(PATTERNS_STORE).getAll();
      request.onsuccess = () => {
        const patterns = (request.result as CustomPattern[]).map(reviveDates);
        patterns.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        resolve(patterns);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[Storage] Error loading all patterns:', error);
    return [];
  }
}

/**
 * Delete a pattern by ID
 */
export async function deletePattern(id: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PATTERNS_STORE, 'readwrite');
      tx.objectStore(PATTERNS_STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[Storage] Error deleting pattern:', error);
    throw error;
  }
}

/**
 * Get recent patterns
 */
export async function getRecentPatterns(
  limit: number = 5
): Promise<CustomPattern[]> {
  const patterns = await loadAllPatterns();
  return patterns.slice(0, limit);
}

/**
 * Clear all patterns
 */
export async function clearAllPatterns(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PATTERNS_STORE, 'readwrite');
      tx.objectStore(PATTERNS_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (error) {
    console.error('[Storage] Error clearing all patterns:', error);
    throw error;
  }
}

/**
 * Check if a pattern exists
 */
export async function patternExists(id: string): Promise<boolean> {
  const pattern = await loadPattern(id);
  return pattern !== null;
}

/**
 * Search patterns by name or breed
 */
export async function searchPatterns(
  query: string
): Promise<CustomPattern[]> {
  const patterns = await loadAllPatterns();
  const lowerQuery = query.toLowerCase();
  return patterns.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.breedId.toLowerCase().includes(lowerQuery) ||
      (p.description && p.description.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Export pattern as JSON string
 */
export function exportPatternAsJSON(pattern: CustomPattern): string {
  return JSON.stringify(pattern, null, 2);
}

/**
 * Import pattern from JSON string
 */
export function importPatternFromJSON(
  jsonString: string
): CustomPattern | null {
  try {
    const pattern = JSON.parse(jsonString) as CustomPattern;
    if (!pattern.id || !pattern.breedId || !pattern.generatedPattern) {
      return null;
    }
    pattern.createdAt = new Date(pattern.createdAt);
    pattern.updatedAt = new Date(pattern.updatedAt);
    return pattern;
  } catch (error) {
    console.error('[Storage] Error importing pattern:', error);
    return null;
  }
}

// ============================================================================
// MIGRATION: one-time move from localStorage → IndexedDB
// ============================================================================

/**
 * Migrate any patterns in localStorage to IndexedDB, then clean up.
 * Safe to call multiple times — skips if already migrated.
 */
export async function migrateFromLocalStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  const MIGRATED_FLAG = 'pupstitch_migrated_to_idb';
  if (localStorage.getItem(MIGRATED_FLAG)) return;

  try {
    // Find all pattern keys in localStorage
    const keys = Object.keys(localStorage).filter((k) =>
      k.startsWith('pupstitch_pattern_')
    );

    if (keys.length > 0) {
      const db = await openDB();
      const tx = db.transaction(PATTERNS_STORE, 'readwrite');
      const store = tx.objectStore(PATTERNS_STORE);

      for (const key of keys) {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) continue;
          const pattern = JSON.parse(raw) as CustomPattern;
          // Strip any huge image data that was the source of quota issues
          pattern.dogPhotoUrl = undefined as unknown as string;
          pattern.previewImageUrl = undefined as unknown as string;
          store.put(pattern);
        } catch {
          // skip unparseable entries
        }
      }

      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });

      console.log(`[Storage] Migrated ${keys.length} patterns to IndexedDB`);
    }

    // Clean up ALL pupstitch localStorage data
    const allKeys = Object.keys(localStorage);
    for (const k of allKeys) {
      if (k.startsWith('pupstitch')) {
        localStorage.removeItem(k);
      }
    }

    localStorage.setItem(MIGRATED_FLAG, '1');
  } catch (error) {
    console.warn('[Storage] Migration error (non-fatal):', error);
  }
}
