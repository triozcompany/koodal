'use server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { matchScore } from '@/lib/domain/analyze';

/** How confident a match must be to auto-merge a newly-crossing issue into an
 * already-cased one instead of minting a brand-new case — the same "strong
 * match" bar analyze() uses to auto-suggest Join at report time, since this
 * merge is automatic (no human confirms it), so it should be at least as
 * confident as that. */
const CASE_MERGE_SCORE = 85;

/**
 * Casts one citizen's up/down vote, replacing whichever direction (if any) they
 * had cast before — never both at once, never counted twice. On an upvote that
 * crosses the existing community threshold, also assigns a caseId (in the same
 * transaction, using its own post-increment values — not a stale pre-vote read)
 * so "this became an official case" is a real, atomic transition.
 */
export async function castVote(id: string, dir: 'up' | 'down', prevDir: 'up' | 'down' | null, by: string) {
  const now = Date.now();
  const issueRef = adminDb.doc(`issues/${id}`);

  return adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;

    let sup = data.sup ?? 0;
    let opp = data.opp ?? 0;
    if (prevDir === 'up') sup = Math.max(0, sup - 1);
    if (prevDir === 'down') opp = Math.max(0, opp - 1);
    if (dir === 'up') sup += 1; else opp += 1;

    const updates: Record<string, unknown> = { sup, opp };
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
      const newConf = Math.min(97, (data.conf ?? 24) + 8);
      updates.conf = newConf;
      const crossed = sup >= 5 || newConf >= 80;
      if (data.stage === 'reported' && crossed) updates.stage = 'community';

      if (!data.caseId && crossed) {
        // Dedup guard — read BEFORE any writes below, so this stays a valid
        // transaction read: is there already a nearby (same city+category),
        // still-open, already-cased issue that's really the same problem?
        const candidates = await tx.get(
          adminDb.collection('issues').where('city', '==', data.city).where('cat', '==', data.cat)
        );
        let dupTarget: { ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData; score: number } | null = null;
        for (const doc of candidates.docs) {
          if (doc.id === id) continue;
          const c = doc.data();
          if (!c.caseId || ['closed', 'rejected'].includes(c.stage)) continue;
          const { score } = matchScore(data.x, data.y, c.x, c.y);
          if (score >= CASE_MERGE_SCORE && (!dupTarget || score > dupTarget.score)) {
            dupTarget = { ref: doc.ref, data: c, score };
          }
        }

        if (dupTarget) {
          // Fold into the existing case instead of minting a new one. Also take
          // the primary's stage — otherwise this issue's own stage pill would
          // still read e.g. "Gathering support" right next to an "OFFICIAL
          // CASE" banner, since crossing the threshold only ever advances a
          // 'reported' stage to 'community', never further.
          caseId = dupTarget.data.caseId;
          caseCreated = true;
          updates.caseId = caseId;
          updates.stage = dupTarget.data.stage;
          updates.dept = dupTarget.data.dept;
          updates.assignee = dupTarget.data.assignee ?? null;
          updates.prio = dupTarget.data.prio ?? null;
          updates.due = dupTarget.data.due ?? null;
          updates.confirms = dupTarget.data.confirms ?? 0;
          updates.needed = dupTarget.data.needed ?? 25;
          newEvents.push({
            ts: now, title: `Merged into official case ${caseId}`, sub: dupTarget.data.dept ?? '',
            icon: 'ph-intersect', kind: 'case', photo: '',
          });
          dupTargetRef = dupTarget.ref;
          dupTargetUpdate = {
            sup: FieldValue.increment(sup),
            merged: FieldValue.arrayUnion({
              id, by: data.by, h: Math.round((now - data.created) / 3600000),
              text: data.text || data.title, sim: dupTarget.score,
            }),
            events: FieldValue.arrayUnion({
              ts: now, title: `${data.by}'s report joined this case`, sub: `${sup} supporters folded in`,
              icon: 'ph-intersect', kind: 'case', photo: '',
            }),
          };
        } else {
          const counterRef = adminDb.doc('counters/case');
          const cSnap = await tx.get(counterRef);
          const caseSeq: number = (cSnap.exists ? cSnap.data()!.caseSeq : 24800) + 1;
          tx.set(counterRef, { caseSeq }, { merge: true });
          caseId = `CP-CHN-${caseSeq}`;
          updates.caseId = caseId;
          caseCreated = true;
        }
      }
    }

    updates.events = FieldValue.arrayUnion(...newEvents);

    tx.update(issueRef, updates);
    if (dupTargetRef && dupTargetUpdate) tx.update(dupTargetRef, dupTargetUpdate);
    return { caseCreated, caseId };
  });
}

export async function addEvidence(id: string, by: string) {
  const now = Date.now();
  await adminDb.doc(`issues/${id}`).update({
    evidence: FieldValue.arrayUnion({ id: crypto.randomUUID(), by, uid: 'me', ts: now, kind: 'followup' }),
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

export async function addComment(id: string, by: string, text: string) {
  await adminDb.doc(`issues/${id}`).update({
    comments: FieldValue.arrayUnion({ id: crypto.randomUUID(), by, uid: 'me', text, ts: Date.now() }),
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

export async function validateFix(id: string, yes: boolean, by: string) {
  const field = yes ? 'valYes' : 'valNo';
  const now   = Date.now();
  const issueRef = adminDb.doc(`issues/${id}`);
  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    const next = (data[field] ?? 0) + 1;
    const updates: Record<string, unknown> = {
      [field]: next,
      events: FieldValue.arrayUnion({
        ts: now,
        title: yes ? `${by} confirmed fixed` : `${by} disputed the fix`,
        sub: '',
        icon: yes ? 'ph-seal-check' : 'ph-x-circle',
        kind: yes ? 'closed' : 'reject',
        photo: '',
      }),
    };
    if (yes && next >= (data.needed ?? 25)) {
      updates.stage = 'closed';
    }
    tx.update(issueRef, updates);
  });
}
