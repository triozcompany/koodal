'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { currentOrg } from '@/lib/console/org';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';
import { getConfig } from '@/lib/console/config';
import { deptName, isPendingDecision, isSignal } from '@/lib/console/derive';
import type { Actor, Issue, ProofPhoto } from '@/lib/domain/types';

const CORP = currentOrg.short;

type Allow = (i: Issue) => boolean;
const inStages = (...st: Issue['stage'][]): Allow => (i) => st.includes(i.stage);

/** Every Console write starts here: the caller must present a Firebase ID token carrying the
 * `staff` claim (minted in signInStaff), and may only touch cases in their departments.
 * Returns the acting staff member so every event and stage change can be attributed. */
async function staffCase(idToken: string, id: string, allow: Allow) {
  const t = await adminAuth.verifyIdToken(idToken);
  if (!t.staff) throw new Error('Not authorised');
  await loadOrgConfig(); // department names (and so the scope check below) come from orgs/gcc
  const ref = adminDb.doc(`issues/${id}`);
  const snap = await ref.get();
  if (!snap.exists) throw new Error('Case not found');
  const issue = { id, ...snap.data() } as Issue;
  const depts = (t.depts as string[] | undefined) ?? [];
  if (depts.length && !depts.includes(deptName(issue))) throw new Error('This case is outside your departments');
  if (!allow(issue)) throw new Error('This case has already moved on. Refresh and try again.');
  // Older sessions were signed in before `staffId` became a claim; their uid is `staff_<id>`.
  const actor: Actor = { id: (t.staffId as string | undefined) ?? t.uid.replace(/^staff_/, ''), name: (t.staffName as string | undefined) ?? 'Staff' };
  return { ref, issue, actor };
}

const gov = (a: Actor, title: string, sub: string, icon: string, photo = '', kind = 'gov') => ({ ts: Date.now(), title, sub, icon, kind, photo, by: a.name, byId: a.id });

/** Proof photos must be Cloudinary uploads from this project (the Console uploads them
 * client-side, compressed to WebP, before calling us). Anything else is dropped. */
function cleanProof(input: { url: string; publicId?: string }[], a: Actor): ProofPhoto[] {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const prefix = `https://res.cloudinary.com/${cloud}/`;
  const now = Date.now();
  const out = (input ?? [])
    .filter((p) => typeof p?.url === 'string' && !!cloud && p.url.startsWith(prefix))
    .slice(0, 6)
    .map((p) => ({ url: p.url, publicId: p.publicId, by: a.name, byId: a.id, ts: now }));
  if (!out.length) throw new Error('Attach at least one photo');
  return out;
}

/** `early` = staff take a report up before the community threshold (no caseId yet). */
export async function approveCase(idToken: string, id: string, p: { dept: string; team: string; due: number; note: string }, opts: { early?: boolean } = {}) {
  const { ref, issue, actor } = await staffCase(idToken, id, opts.early ? isSignal : isPendingDecision);
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
    ...(opts.early ? [gov(actor, `Taken up early by ${CORP}`, `Before the community threshold · ${issue.sup} supporters`, 'ph-lightning')] : []),
    gov(actor, `Verified by ${CORP}`, `Reviewed by ${actor.name}`, 'ph-seal-check'),
    gov(actor, `Official case ${caseId}`, `${p.dept} · target ${dd}`, 'ph-bank'),
    gov(actor, `Assigned to ${p.team}`, `Target date ${dd}`, 'ph-users-three'),
    ...(p.note.trim() ? [gov(actor, `Update from ${CORP}`, p.note.trim(), 'ph-megaphone')] : []),
  ];
  await ref.update({
    ...(opts.early || !issue.thresholdAt ? { thresholdAt: Date.now() } : {}),
    stage: 'assigned', caseId, dept: p.dept, team: p.team, assignee: p.team, due: p.due, prio: null,
    decidedBy: actor, assignedBy: actor, events: FieldValue.arrayUnion(...events),
  });
  return { caseId };
}

export async function rejectCase(idToken: string, id: string, p: { reason: string; note: string; proof: { url: string; publicId?: string }[]; ref: string }) {
  const { ref, actor } = await staffCase(idToken, id, isPendingDecision);
  if (!p.reason || p.note.trim().length < 15) throw new Error('Reason and explanation are required');
  if (!getConfig().rejectReasons.some((r) => r.label === p.reason)) throw new Error('Choose one of the listed reasons');
  const proof = cleanProof(p.proof, actor);
  await ref.update({
    stage: 'rejected', reject: p.reason, rejectNote: p.note.trim(), rejectProof: proof, rejectRef: p.ref.trim(), rejectedAt: Date.now(),
    decidedBy: actor, rejectedBy: actor,
    events: FieldValue.arrayUnion(gov(actor, `Not accepted by ${CORP}`, `Reason: ${p.reason}`, 'ph-x-circle', proof[0].url)),
  });
}

export async function scheduleInspection(idToken: string, id: string) {
  const { ref, actor } = await staffCase(idToken, id, isPendingDecision);
  await ref.update({ events: FieldValue.arrayUnion(gov(actor, 'Field inspection scheduled', 'Within 24 hours', 'ph-binoculars')) });
}

const OPEN: Issue['stage'][] = ['assigned', 'verified', 'progress'];

export async function startWork(idToken: string, id: string) {
  const { ref, actor } = await staffCase(idToken, id, inStages('assigned', 'verified'));
  await ref.update({ stage: 'progress', events: FieldValue.arrayUnion(gov(actor, 'Work started on site', 'Crew deployed', 'ph-hard-hat')) });
}

export async function editAssignment(idToken: string, id: string, p: { dept: string; team: string; due: number }) {
  const { ref, issue, actor } = await staffCase(idToken, id, inStages(...OPEN));
  const moved = issue.team !== p.team || deptName(issue) !== p.dept;
  const dd = new Date(p.due).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  await ref.update({
    dept: p.dept, team: p.team, assignee: p.team, due: p.due, assignedBy: actor,
    events: FieldValue.arrayUnion(gov(actor, moved ? `Moved to ${p.team}` : 'Target date updated', `${p.dept} · target ${dd}`, 'ph-calendar-check')),
  });
}

export async function postUpdate(idToken: string, id: string, note: string) {
  const { ref, actor } = await staffCase(idToken, id, inStages(...OPEN));
  if (note.trim().length < 5) throw new Error('Write a short message first');
  await ref.update({ events: FieldValue.arrayUnion(gov(actor, `Update from ${CORP}`, note.trim(), 'ph-megaphone')) });
}

/** Sends the case to citizens for confirmation. Counters restart so a re-fix after a reopen
 * is judged on its own votes; validateFix (issue.ts) closes or reopens from here. */
export async function markFixed(idToken: string, id: string, p: { note: string; proof: { url: string; publicId?: string }[] }) {
  const { ref, actor } = await staffCase(idToken, id, inStages('progress'));
  const proof = cleanProof(p.proof, actor);
  const needed = getConfig().fixConfirmsNeeded;
  await ref.update({
    stage: 'resolved', fixProof: proof, fixNote: p.note.trim(), confirms: 0, disputes: 0, needed, fixedBy: actor,
    events: FieldValue.arrayUnion(gov(actor, 'Marked fixed by department', p.note.trim() || 'Proof photo attached · citizens asked to confirm', 'ph-check', proof[0].url, 'fix')),
  });
  return { needed };
}
