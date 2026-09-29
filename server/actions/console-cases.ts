'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { deptName } from '@/lib/console/derive';
import type { Issue } from '@/lib/domain/types';

const CORP = 'Greater Chennai Corp.';

/** Every Console write starts here: the caller must present a Firebase ID token carrying the
 * `staff` claim (minted in signInStaff), and may only touch cases in their departments. */
async function staffCase(idToken: string, id: string, allowedStages: Issue['stage'][]) {
  const t = await adminAuth.verifyIdToken(idToken);
  if (!t.staff) throw new Error('Not authorised');
  const ref = adminDb.doc(`issues/${id}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Case not found');
  const issue = { id, ...snap.data() } as Issue;
  const depts = (t.depts as string[] | undefined) ?? [];
  if (depts.length && !depts.includes(deptName(issue))) throw new Error('This case is outside your departments');
  if (!allowedStages.includes(issue.stage)) throw new Error('This case has already moved on. Refresh and try again.');
  return { ref, issue, staffName: (t.staffName as string) ?? 'Staff' };
}

const gov = (title: string, sub: string, icon: string, photo = '', kind = 'gov') => ({ ts: Date.now(), title, sub, icon, kind, photo });

export async function approveCase(idToken: string, id: string, p: { dept: string; team: string; due: number; note: string }) {
  const { ref, issue, staffName } = await staffCase(idToken, id, ['review']);
  // Some cases already carry an official ID from crossing the community threshold (see castVote).
  let caseId = issue.caseId;
  if (!caseId) {
    caseId = await adminDb.runTransaction(async (tx) => {
      const c = adminDb.doc('counters/case');
      const snap = await tx.get(c);
      const seq: number = (snap.exists ? snap.data()!.caseSeq : 24800) + 1;
      tx.set(c, { caseSeq: seq }, { merge: true });
      return `CP-CHN-${seq}`;
    });
  }
  const dd = new Date(p.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const events = [
    gov(`Verified by ${CORP}`, `Reviewed by ${staffName}`, 'ph-seal-check'),
    gov(`Official case ${caseId}`, `${p.dept} · target ${dd}`, 'ph-bank'),
    gov(`Assigned to ${p.team}`, `Target date ${dd}`, 'ph-users-three'),
    ...(p.note.trim() ? [gov(`Update from ${CORP}`, p.note.trim(), 'ph-megaphone')] : []),
  ];
  await ref.update({ stage: 'assigned', caseId, dept: p.dept, team: p.team, assignee: p.team, due: p.due, prio: null, events: FieldValue.arrayUnion(...events) });
  return { caseId };
}

export async function rejectCase(idToken: string, id: string, p: { reason: string; note: string; proof: string[]; ref: string }) {
  const { ref } = await staffCase(idToken, id, ['review']);
  if (!p.reason || p.note.trim().length < 15 || !p.proof.length) throw new Error('Reason, explanation and proof are required');
  await ref.update({
    stage: 'rejected', reject: p.reason, rejectNote: p.note.trim(), rejectProof: p.proof, rejectRef: p.ref.trim(), rejectedAt: Date.now(),
    events: FieldValue.arrayUnion(gov(`Not accepted by ${CORP}`, `Reason: ${p.reason}`, 'ph-x-circle')),
  });
}

export async function scheduleInspection(idToken: string, id: string) {
  const { ref } = await staffCase(idToken, id, ['review']);
  await ref.update({ events: FieldValue.arrayUnion(gov('Field inspection scheduled', 'Within 24 hours', 'ph-binoculars')) });
}

const OPEN: Issue['stage'][] = ['assigned', 'verified', 'progress'];

export async function startWork(idToken: string, id: string) {
  const { ref } = await staffCase(idToken, id, ['assigned', 'verified']);
  await ref.update({ stage: 'progress', events: FieldValue.arrayUnion(gov('Work started on site', 'Crew deployed', 'ph-hard-hat', 'crew on site')) });
}

export async function editAssignment(idToken: string, id: string, p: { dept: string; team: string; due: number }) {
  const { ref, issue } = await staffCase(idToken, id, OPEN);
  const moved = issue.team !== p.team || deptName(issue) !== p.dept;
  const dd = new Date(p.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  await ref.update({
    dept: p.dept, team: p.team, assignee: p.team, due: p.due,
    events: FieldValue.arrayUnion(gov(moved ? `Moved to ${p.team}` : 'Target date updated', `${p.dept} · target ${dd}`, 'ph-calendar-check')),
  });
}

export async function postUpdate(idToken: string, id: string, note: string) {
  const { ref } = await staffCase(idToken, id, OPEN);
  if (note.trim().length < 5) throw new Error('Write a short message first');
  await ref.update({ events: FieldValue.arrayUnion(gov(`Update from ${CORP}`, note.trim(), 'ph-megaphone')) });
}

/** Sends the case to citizens for confirmation. Counters restart so a re-fix after a reopen
 * is judged on its own votes; validateFix (issue.ts) closes or reopens from here. */
export async function markFixed(idToken: string, id: string, p: { note: string; proof: string[] }) {
  const { ref } = await staffCase(idToken, id, ['progress']);
  if (!p.proof.length) throw new Error('Attach at least one after photo');
  await ref.update({
    stage: 'resolved', fixProof: p.proof, fixNote: p.note.trim(), confirms: 0, disputes: 0,
    events: FieldValue.arrayUnion(gov('Marked fixed by department', p.note.trim() || 'Proof photo attached · citizens asked to confirm', 'ph-check', 'after photo', 'fix')),
  });
  return { needed: (await ref.get()).data()?.needed ?? 25 };
}
