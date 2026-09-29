'use server';
import { adminAuth } from '@/lib/firebase/admin';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';
import type { OrgConfig } from '@/lib/console/config';

export async function getOrgConfig(idToken: string): Promise<OrgConfig> {
  const t = await adminAuth.verifyIdToken(idToken);
  if (!t.staff) throw new Error('Not authorised');
  return loadOrgConfig();
}
