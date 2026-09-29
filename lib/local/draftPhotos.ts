'use client';

// One key per photo, not one giant blob — removing a single photo is cheap,
// and a single failed write doesn't threaten the rest of an in-progress draft.
const PREFIX = 'koodal:draft-photo:';

/** Quota-exceeded (or any storage failure) degrades to "just don't persist"
 * rather than crashing the report flow — the photo still works from the
 * in-memory Shot, it just won't survive a refresh. */
export function saveDraftPhoto(id: string, dataUrl: string): void {
  try { localStorage.setItem(PREFIX + id, dataUrl); } catch (err) { console.error('saveDraftPhoto failed:', err); }
}

export function loadDraftPhoto(id: string): string | null {
  try { return localStorage.getItem(PREFIX + id); } catch { return null; }
}

export function removeDraftPhoto(id: string): void {
  try { localStorage.removeItem(PREFIX + id); } catch { /* ignore */ }
}

export function removeDraftPhotos(ids: string[]): void {
  for (const id of ids) removeDraftPhoto(id);
}
