'use server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { applySupport } from '@/lib/domain/support.server';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';

/**
 * Casts one citizen's up/down vote, replacing whichever direction (if any) they
 * had cast before — never both at once, never counted twice. An upvote goes through
 * applySupport, which may cross the community threshold and assign a caseId in the
 * same transaction, so "this became an official case" is a real, atomic transition.
 */
export async function castVote(id: string, dir: 'up' | 'down', prevDir: 'up' | 'down' | null, by: string, uid: string) {
  const now = Date.now();
  const issueRef = adminDb.doc(`issues/${id}`);
  const userRef = adminDb.doc(`users/${uid}`);
  const cfg = await loadOrgConfig();

  return adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;

    let sup = data.sup ?? 0;
    let opp = data.opp ?? 0;
    if (prevDir === 'up') sup = Math.max(0, sup - 1);
    if (prevDir === 'down') opp = Math.max(0, opp - 1);
    if (dir === 'up') sup += 1; else opp += 1;

    let updates: Record<string, unknown> = { sup, opp };
    let caseCreated = false;
    let caseId: string | undefined;
    let dupTargetRef: FirebaseFirestore.DocumentReference | null = null;
    let dupTargetUpdate: Record<string, unknown> | null = null;

    const newEvents: Record<string, unknown>[] = [{
      ts: now,
      title: prevDir ? `${by} switched their vote` : dir === 'up' ? `${by} joined` : `${by} raised a concern`,
      sub: dir === 'up' ? 'Added support' : 'Flagged as disputed',
      icon: dir === 'up' ? 'ph-hand-pointing' : 'ph-thumbs-down',
      kind: dir === 'up' ? 'support' : 'oppose',
      photo: '',
    }];

    if (dir === 'up') {
      const r = await applySupport(tx, id, data, sup, cfg, now);
      updates = { ...updates, ...r.updates };
      newEvents.push(...r.events);
      ({ caseCreated, caseId, dupTargetRef, dupTargetUpdate } = r);
    }

    updates.events = FieldValue.arrayUnion(...newEvents);

    tx.update(issueRef, updates);
    tx.set(userRef, { votes: { [id]: dir } }, { merge: true });
    if (dupTargetRef && dupTargetUpdate) tx.update(dupTargetRef, dupTargetUpdate);
    return { caseCreated, caseId };
  });
}

export async function addEvidence(id: string, by: string, uid: string, url?: string) {
  const now = Date.now();
  await adminDb.doc(`issues/${id}`).update({
    evidence: FieldValue.arrayUnion({ id: crypto.randomUUID(), by, uid, ts: now, kind: 'followup', ...(url ? { url } : {}) }),
    conf: FieldValue.increment(5),
    events: FieldValue.arrayUnion({
      ts: now,
      title: `${by} added a photo`,
      sub: 'Evidence added',
      icon: 'ph-image',
      kind: 'evidence',
      photo: '',
    }),
  });
}

/** Removes one of the current citizen's own evidence photos. Read-modify-write
 * (not arrayRemove) because we're matching by id, not the whole stored object. */
export async function deleteEvidence(id: string, evidenceId: string) {
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    const evidence = (data.evidence ?? []).filter((e: { id?: string }) => e.id !== evidenceId);
    tx.update(issueRef, { evidence });
  });
}

export async function addComment(id: string, by: string, uid: string, text: string) {
  await adminDb.doc(`issues/${id}`).update({
    comments: FieldValue.arrayUnion({ id: crypto.randomUUID(), by, uid, text, ts: Date.now() }),
  });
}

/** Editing/deleting a comment is only offered client-side while the issue has
 * no caseId yet; re-checked here so a stale UI can't slip a write through
 * after the case lock actually took effect. */
export async function editComment(id: string, commentId: string, text: string) {
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    if (data.caseId) throw new Error('Cannot edit — already an official case');
    const comments = (data.comments ?? []).map((c: { id?: string }) =>
      c.id === commentId ? { ...c, text, edited: true } : c
    );
    tx.update(issueRef, { comments });
  });
}

export async function deleteComment(id: string, commentId: string) {
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    if (data.caseId) throw new Error('Cannot delete — already an official case');
    const comments = (data.comments ?? []).filter((c: { id?: string }) => c.id !== commentId);
    tx.update(issueRef, { comments });
  });
}

/** Editing is only offered client-side to the report's own author, before it
 * has become an official case — re-checked here so a stale UI (or someone
 * poking the action directly) can't slip a write through either guard. */
export async function editReport(id: string, uid: string, title: string, text: string, tags: string[]) {
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    if (data.uid !== uid) throw new Error('Not your report');
    if (data.caseId) throw new Error('Cannot edit — already an official case');
    tx.update(issueRef, { title, text, tags });
  });
}

export async function deleteReport(id: string, uid: string) {
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    if (data.uid !== uid) throw new Error('Not your report');
    if (data.caseId) throw new Error('Cannot delete — already an official case');
    tx.delete(issueRef);
  });
}

export async function validateFix(id: string, yes: boolean, by: string) {
  const field = yes ? 'valYes' : 'valNo';
  const now   = Date.now();
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    const next = (data[field] ?? 0) + 1;
    const needed = data.needed ?? (await loadOrgConfig()).fixConfirmsNeeded;
    const events: Record<string, unknown>[] = [{
      ts: now,
      title: yes ? `${by} confirmed fixed` : `${by} disputed the fix`,
      sub: '',
      icon: yes ? 'ph-seal-check' : 'ph-x-circle',
      kind: yes ? 'closed' : 'reject',
      photo: '',
    }];
    const updates: Record<string, unknown> = { [field]: next };
    // The Console reads `confirms`/`disputes` for the awaiting-confirmation card and the
    // citizen list badge, so keep them in step with valYes/valNo. Both counters reset when
    // the department marks a case fixed again (see markFixed in console-cases.ts).
    if (data.stage === 'resolved') {
      if (yes) {
        const confirms = (data.confirms ?? 0) + 1;
        updates.confirms = confirms;
        if (confirms >= needed) updates.stage = 'closed';
      } else {
        const disputes = (data.disputes ?? 0) + 1;
        updates.disputes = disputes;
        if (disputes >= 3) {
          updates.stage = 'progress';
          updates.reopened = (data.reopened ?? 0) + 1;
          events.push({ ts: now, title: 'Reopened by citizens', sub: `${disputes} citizens said not fixed`, icon: 'ph-arrow-counter-clockwise', kind: 'citizen', photo: '' });
        }
      }
    } else if (yes && next >= needed) {
      updates.stage = 'closed';
    }
    updates.events = FieldValue.arrayUnion(...events);
    tx.update(issueRef, updates);
  });
}
