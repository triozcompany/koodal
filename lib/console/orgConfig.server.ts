import { adminDb } from '@/lib/firebase/admin';
import { mergeConfig, setActiveConfig, type OrgConfig } from './config';

// Server-side loader for orgs/gcc with a short cache, so a burst of Console actions reads it once.
let cache: { at: number; cfg: OrgConfig } | null = null;

export async function loadOrgConfig(): Promise<OrgConfig> {
  if (cache && Date.now() - cache.at < 60_000) { setActiveConfig(cache.cfg); return cache.cfg; }
  const snap = await adminDb.doc('orgs/gcc').get();
  const cfg = mergeConfig(snap.exists ? snap.data() : undefined);
  cache = { at: Date.now(), cfg };
  setActiveConfig(cfg);
  return cfg;
}

export const clearOrgConfigCache = () => { cache = null; };
