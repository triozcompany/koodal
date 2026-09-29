'use client';
import { DEFAULT_PREFS, type Prefs } from './prefs.shared';
export { DEFAULT_PREFS, LANGUAGES, TIMEOUT_MIN, type Prefs } from './prefs.shared';

const KEY = 'cp-console-prefs';

// Local cache of the signed-in staff member's settings (the source of truth is staff/{id}.prefs in
// Firestore). It lets the idle timer and first paint work without waiting for the network.
export function readPrefs(): Prefs {
  try { return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return DEFAULT_PREFS; }
}
export function writePrefs(next: Prefs) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}
export function clearPrefs() {
  try { localStorage.removeItem(KEY); } catch {}
}
