// Demo data for the citizen app and the Console (scenarios in lib/seed/scenarios.ts).
// Usage: npx tsx scripts/seed-koodal.ts            reset: remove seeded + test-citizen data, then seed
//        npx tsx scripts/seed-koodal.ts --wipe     delete every issue and citizen profile (no reseed)
// The same actions are in Console → Settings → Test mode (admin, test mode on).
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import { resetSeed, wipeAll } from '../lib/seed/run.server';

const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'secret', 'trioz-319df-firebase-adminsdk-fbsvc-9ed783fdc2.json');
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  try { return JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8')); } catch { return undefined; }
}

async function main() {
  const sa = loadServiceAccount();
  const app = getApps()[0] ?? initializeApp(sa ? { credential: cert(sa) } : { projectId: 'trioz-319df' });
  const db = getFirestore(app);
  const res = process.argv.includes('--wipe') ? await wipeAll(db) : await resetSeed(db);
  console.log(res);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
