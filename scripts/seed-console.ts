// Creates the Console's staff accounts and org config in Firebase. Safe to re-run:
//   - staff: Firebase Auth user (uid staff_<ID>, pseudo-email, password) + non-secret profile in staff/<ID>.
//     An existing account keeps its password unless you pass --reset-passwords.
//   - orgs/gcc: written only if it does not exist yet (pass --overwrite-config to replace it).
// Usage: npx tsx scripts/seed-console.ts [--reset-passwords] [--overwrite-config]
//        STAFF_SEED_PASSWORD=... overrides the default demo password.
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_CONFIG } from '../lib/console/config';
import { TEST_STAFF, TEST_STAFF_PASSWORD } from '../lib/seed/accounts';

const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'secret', 'trioz-319df-firebase-adminsdk-fbsvc-9ed783fdc2.json');
function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  try { return JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8')); } catch { return undefined; }
}

const resetPasswords = process.argv.includes('--reset-passwords');
const overwriteConfig = process.argv.includes('--overwrite-config');
const PASSWORD = process.env.STAFF_SEED_PASSWORD ?? TEST_STAFF_PASSWORD;

// depts: [] = every department (admin). Names match the departments in orgs/gcc.
const STAFF = TEST_STAFF.map(({ note: _note, ...s }) => ({ ...s, depts: [...s.depts] }));

async function main() {
  const sa = loadServiceAccount();
  const app = getApps().length ? getApps()[0] : initializeApp(sa ? { credential: cert(sa) } : { projectId: 'trioz-319df' });
  const auth = getAuth(app);
  const db = getFirestore(app);

  for (const s of STAFF) {
    const uid = `staff_${s.id}`;
    const email = `${s.id.toLowerCase()}@staff.koodal.internal`;
    try {
      await auth.getUser(uid);
      await auth.updateUser(uid, { displayName: s.name, email, ...(resetPasswords ? { password: PASSWORD } : {}) });
      console.log(`auth   ${s.id}: exists${resetPasswords ? ', password reset' : ', password kept'}`);
    } catch (e) {
      if ((e as { code?: string }).code !== 'auth/user-not-found') throw e;
      await auth.createUser({ uid, email, password: PASSWORD, displayName: s.name, emailVerified: true });
      console.log(`auth   ${s.id}: created`);
    }
    await db.doc(`staff/${s.id}`).set({ ...s, active: true }, { merge: true });
    console.log(`staff  ${s.id}: profile saved (${s.role}${s.depts.length ? ', ' + s.depts.join(' + ') : ', all departments'})`);
  }

  const cfgRef = db.doc('orgs/gcc');
  if (overwriteConfig || !(await cfgRef.get()).exists) {
    await cfgRef.set({ ...DEFAULT_CONFIG, updatedAt: Date.now() });
    console.log('config orgs/gcc: written');
  } else {
    console.log('config orgs/gcc: already exists, left as is');
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
