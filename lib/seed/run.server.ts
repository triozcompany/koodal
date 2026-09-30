import type { Firestore } from 'firebase-admin/firestore';
import { buildSeed } from './scenarios';
import { TEST_CITIZENS, citizenUid } from './accounts';

// Seed / reset / wipe, shared by the Console's test-mode card (server/actions/console-admin.ts) and the
// CLI (scripts/seed-koodal.ts). Takes the Firestore handle so the CLI can bring its own admin app.
// Staff accounts (staff/*) and the org config (orgs/gcc) are never touched here.

async function deleteRefs(db: Firestore, refs: FirebaseFirestore.DocumentReference[]) {
  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    refs.slice(i, i + 400).forEach((r) => batch.delete(r));
    await batch.commit();
  }
  return refs.length;
}

/** Writes the seed set (overwriting seeded docs of the same id). Existing real reports are left alone. */
export async function seed(db: Firestore) {
  const { issues, users, counters } = buildSeed();
  for (let i = 0; i < issues.length; i += 100) {
    const batch = db.batch();
    issues.slice(i, i + 100).forEach((iss) => batch.set(db.doc(`issues/${iss.id}`), iss));
    await batch.commit();
  }
  const batch = db.batch();
  users.forEach((u) => batch.set(db.doc(`users/${u.uid}`), u));
  batch.set(db.doc('counters/issue'), counters.issue);
  batch.set(db.doc('counters/case'), counters.case);
  await batch.commit();
  return { issues: issues.length, users: users.length };
}

/** Removes everything the demo created — seeded issues, anything a test citizen reported, the test
 * citizens themselves (so the onboarding number starts fresh), and the older design-mock issues
 * (demo:true, or no reporter uid — see isDemo) — then seeds again. Real citizens' reports stay. */
export async function resetSeed(db: Firestore) {
  const testUids = new Set(TEST_CITIZENS.map((c) => citizenUid(c.phone)));
  const all = await db.collection('issues').select('seed', 'uid', 'demo').get();
  const refs = new Map(all.docs.filter((d) => { const x = d.data(); return x.seed || x.demo || !x.uid || testUids.has(x.uid); }).map((d) => [d.ref.path, d.ref]));
  const removed = await deleteRefs(db, [...refs.values(), ...[...testUids].map((u) => db.doc(`users/${u}`))]);
  const added = await seed(db);
  return { removed, ...added };
}

/** Deletes every issue, every citizen profile and the ID counters. */
export async function wipeAll(db: Firestore) {
  const issues = await db.collection('issues').listDocuments();
  const citizens = (await db.collection('users').listDocuments()).filter((r) => r.id.startsWith('ph_') || r.id === 'demo-citizen');
  const removed = await deleteRefs(db, [...issues, ...citizens, db.doc('counters/issue'), db.doc('counters/case')]);
  return { removed };
}
