/**
 * Schema versioning & migration pipeline for AsyncStorage data.
 *
 * HOW TO ADD A NEW MIGRATION:
 *  1. Bump SCHEMA_VERSION by 1.
 *  2. Add an entry to `migrations` keyed by the NEW version.
 *     The function receives the previous-version data and returns the next.
 *  3. That's it — `migrateData` will chain all pending migrations automatically.
 */
import { AppState } from '../types';

/** Current schema version — bump when the persisted shape changes. */
export const SCHEMA_VERSION = 2;

type Migration = (data: Record<string, unknown>) => Record<string, unknown>;

/**
 * Each key is the TARGET version. The function upgrades from (key - 1) → key.
 */
const migrations: Record<number, Migration> = {
  // v1 → v2: added payments array
  2: (data) => ({
    ...data,
    payments: Array.isArray(data.payments) ? data.payments : [],
  }),
};

// ── Public API ─────────────────────────────────────────────

/**
 * Run all pending migrations on raw persisted data.
 * Data with no `version` field is treated as v1.
 */
export function migrateData(raw: Record<string, unknown>): AppState {
  let version = typeof raw.version === 'number' ? raw.version : 1;
  // Strip the version field so it doesn't pollute AppState
  const { version: _v, ...rest } = raw;
  let data: Record<string, unknown> = { ...rest };

  while (version < SCHEMA_VERSION) {
    version++;
    const migrate = migrations[version];
    if (migrate) {
      data = migrate(data);
    }
  }

  return data as unknown as AppState;
}

/**
 * Basic structural validation — ensures all required arrays exist.
 * Returns the data as AppState if valid, otherwise null.
 */
export function validateAppState(data: unknown): AppState | null {
  if (!data || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  if (!Array.isArray(d.billers)) return null;
  if (!Array.isArray(d.users)) return null;
  if (!Array.isArray(d.installments)) return null;
  if (!Array.isArray(d.payments)) return null;
  return d as unknown as AppState;
}

/**
 * Serialize AppState for AsyncStorage (includes the schema version).
 */
export function serializeState(state: AppState): string {
  return JSON.stringify({ version: SCHEMA_VERSION, ...state });
}
