'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { clearOrgConfigCache, loadOrgConfig } from '@/lib/console/orgConfig.server';
import type { OrgConfig } from '@/lib/console/config';
import { resetSeed, seed, wipeAll } from '@/lib/seed/run.server';

// Admin-only: case thresholds, test mode, and the seed / reset / wipe buttons in Console → Settings.

async function admin(idToken: string) {
  const t = await adminAuth.verifyIdToken(idToken);
  if (!t.staff || t.role !== 'admin') throw new Error('Only an admin can do this');
}

export type TestConfig = Pick<OrgConfig, 'caseSupporters' | 'caseConfidence' | 'confPerSupport' | 'fixConfirmsNeeded' | 'testMode'>;

export async function saveTestConfig(idToken: string, p: TestConfig): Promise<OrgConfig> {
  await admin(idToken);
  const int = (v: unknown, lo: number, hi: number) => { const n = Math.round(Number(v)); if (!(n >= lo && n <= hi)) throw new Error(`Enter a number from ${lo} to ${hi}`); return n; };
  await adminDb.doc('orgs/gcc').set({
    caseSupporters: int(p.caseSupporters, 1, 500), caseConfidence: int(p.caseConfidence, 1, 100),
    confPerSupport: int(p.confPerSupport, 1, 50), fixConfirmsNeeded: int(p.fixConfirmsNeeded, 1, 500),
    testMode: !!p.testMode, updatedAt: Date.now(),
  }, { merge: true });
  clearOrgConfigCache();
  return loadOrgConfig();
}

async function inTestMode(idToken: string) {
  await admin(idToken);
  clearOrgConfigCache();
  if (!(await loadOrgConfig()).testMode) throw new Error('Turn on test mode first');
}

export async function seedData(idToken: string) { await inTestMode(idToken); return seed(adminDb); }
export async function resetSeedData(idToken: string) { await inTestMode(idToken); return resetSeed(adminDb); }
export async function removeAllData(idToken: string) { await inTestMode(idToken); return wipeAll(adminDb); }
