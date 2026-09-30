'use server';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';

/** The slice of orgs/gcc that unauthenticated screens need: the citizen threshold copy and
 * whether the sign-in pages list test accounts. */
export async function getPublicConfig() {
  const c = await loadOrgConfig();
  return { caseSupporters: c.caseSupporters, caseConfidence: c.caseConfidence, testMode: c.testMode };
}
