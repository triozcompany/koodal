import { db } from './firebase';
import { FieldValue } from 'firebase-admin/firestore';

export type Issue = {
  id: string;
  cat: string;
  sev: string;
  city: string;
  area: string;
  street: string;
  title: string;
  stage: string;
  sup: number;
  conf: number;
  created: number;
  x: number;
  y: number;
  km: number;
  anon: boolean;
  mine: boolean;
  by: string;
  dept: string;
  summary: string;
  voice: { lang: string; text: string; en: string } | null;
  merged: Array<{ by: string; h: number; text: string; sim: number; me?: boolean }>;
  history: string;
  caseId: string | null;
  assignee: string | null;
  prio: string | null;
  due: number | null;
  confirms: number;
  needed: number;
  valYes: number;
  valNo: number;
  evidence: Array<{ by: string; ts: number }>;
  events: Array<{ ts: number; title: string; sub: string; icon: string; kind: string; photo: string }>;
  reject: string | null;
};

export type AppState = {
  v: number;
  issues: Issue[];
  my: { support: Record<string, boolean>; validated: Record<string, number>; confirmed: Record<string, number> };
  me: { verified: boolean; anonDefault: boolean };
  seq: number;
  caseSeq: number;
};

export async function getState(): Promise<AppState> {
  const firestore = db();

  const [issuesSnap, metaSnap, userSnap] = await Promise.all([
    firestore.collection('issues').orderBy('created', 'desc').get(),
    firestore.doc('meta/state').get(),
    firestore.doc('users/demo').get(),
  ]);

  const issues = issuesSnap.docs.map(d => d.data() as Issue);
  const meta = metaSnap.exists ? metaSnap.data()! : { seq: 2113, caseSeq: 24817 };
  const user = userSnap.exists
    ? userSnap.data()!
    : { my: { support: {}, validated: {}, confirmed: {} }, me: { verified: false, anonDefault: false } };

  return {
    v: 2,
    issues,
    my: user.my,
    me: user.me,
    seq: meta.seq,
    caseSeq: meta.caseSeq,
  };
}

export async function getIssue(id: string): Promise<Issue | null> {
  const snap = await db().doc(`issues/${id}`).get();
  return snap.exists ? (snap.data() as Issue) : null;
}

export async function saveIssue(issue: Issue): Promise<void> {
  await db().doc(`issues/${issue.id}`).set(issue);
}

export async function updateIssue(id: string, data: Partial<Issue>): Promise<void> {
  await db().doc(`issues/${id}`).update(data as Record<string, unknown>);
}

export async function updateMeta(data: { seq?: number; caseSeq?: number }): Promise<void> {
  await db().doc('meta/state').set(data, { merge: true });
}

export async function updateUserState(
  my: Record<string, unknown>,
  me?: Record<string, unknown>,
): Promise<void> {
  const update: Record<string, unknown> = {};
  Object.entries(my).forEach(([k, v]) => {
    update[`my.${k}`] = v;
  });
  if (me) {
    Object.entries(me).forEach(([k, v]) => {
      update[`me.${k}`] = v;
    });
  }
  await db().doc('users/demo').set(update, { merge: true });
}

export async function incrementIssueField(id: string, field: string, amount: number): Promise<void> {
  await db()
    .doc(`issues/${id}`)
    .update({ [field]: FieldValue.increment(amount) });
}

export async function seedFirestore(issues: Issue[], seq: number, caseSeq: number): Promise<void> {
  const firestore = db();
  const batch = firestore.batch();

  // Clear existing issues
  const existing = await firestore.collection('issues').get();
  existing.docs.forEach(d => batch.delete(d.ref));

  // Write new issues
  issues.forEach(issue => {
    batch.set(firestore.doc(`issues/${issue.id}`), issue);
  });

  batch.set(firestore.doc('meta/state'), { seq, caseSeq });
  batch.set(firestore.doc('users/demo'), {
    my: {
      support: { 'CP-2051': true, 'CP-2045': true, 'CP-2091': true, 'CP-2102': true, 'CP-2033': true, 'CP-2089': true },
      validated: {},
      confirmed: {},
    },
    me: { verified: false, anonDefault: false },
  });

  await batch.commit();
}
