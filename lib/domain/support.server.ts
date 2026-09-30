import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { spotScore } from '@/lib/domain/analyze';
import type { OrgConfig } from '@/lib/console/config';

/** How confident a match must be to auto-merge a newly-crossing issue into an
 * already-cased one instead of minting a brand-new case — the same "strong
 * match" bar analyze() uses to auto-suggest Join at report time, since this
 * merge is automatic (no human confirms it), so it should be at least as
 * confident as that. */
const CASE_MERGE_SCORE = 85;

/**
 * One more supporter on an issue — shared by an upvote (castVote) and a joined duplicate
 * report (joinIssue), so both move confidence and the community threshold the same way.
 * Runs inside the caller's transaction: it only reads (candidates, counter) and returns the
 * writes, except the case counter bump, so callers must have done their own reads first.
 * `sup` is the issue's supporter count after this support.
 */
export async function applySupport(
  tx: FirebaseFirestore.Transaction,
  id: string,
  data: FirebaseFirestore.DocumentData,
  sup: number,
  cfg: OrgConfig,
  now: number,
) {
  const updates: Record<string, unknown> = {};
  const events: Record<string, unknown>[] = [];
  let caseCreated = false;
  let caseId: string | undefined;
  let dupTargetRef: FirebaseFirestore.DocumentReference | null = null;
  let dupTargetUpdate: Record<string, unknown> | null = null;

  const newConf = Math.min(97, (data.conf ?? 24) + cfg.confPerSupport);
  updates.conf = newConf;
  const crossed = sup >= cfg.caseSupporters || newConf >= cfg.caseConfidence;
  if (data.stage === 'reported' && crossed) updates.stage = 'community';

  if (!data.caseId && crossed) {
    // Dedup guard — read BEFORE any writes, so this stays a valid transaction read: is there
    // already a nearby (same city+category), still-open, already-cased issue that's really
    // the same problem?
    const candidates = await tx.get(
      adminDb.collection('issues').where('city', '==', data.city).where('cat', '==', data.cat)
    );
    let dupTarget: { ref: FirebaseFirestore.DocumentReference; data: FirebaseFirestore.DocumentData; score: number } | null = null;
    for (const doc of candidates.docs) {
      if (doc.id === id) continue;
      const c = doc.data();
      if (!c.caseId || ['closed', 'rejected'].includes(c.stage)) continue;
      const { score } = spotScore(data as { x: number; y: number }, c as { x: number; y: number });
      if (score >= CASE_MERGE_SCORE && (!dupTarget || score > dupTarget.score)) {
        dupTarget = { ref: doc.ref, data: c, score };
      }
    }

    if (dupTarget) {
      // Fold into the existing case instead of minting a new one. Also take the primary's
      // stage — otherwise this issue's own stage pill would still read e.g. "Gathering
      // support" right next to an "OFFICIAL CASE" banner, since crossing the threshold only
      // ever advances a 'reported' stage to 'community', never further.
      caseId = dupTarget.data.caseId;
      caseCreated = true;
      updates.caseId = caseId;
      updates.thresholdAt = now;
      updates.stage = dupTarget.data.stage;
      updates.dept = dupTarget.data.dept;
      updates.assignee = dupTarget.data.assignee ?? null;
      updates.prio = dupTarget.data.prio ?? null;
      updates.due = dupTarget.data.due ?? null;
      updates.confirms = dupTarget.data.confirms ?? 0;
      updates.needed = dupTarget.data.needed ?? cfg.fixConfirmsNeeded;
      events.push({
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
      updates.thresholdAt = now;
      events.push({
        ts: now, title: `Community verified · ${newConf}%`, sub: 'Sent to Greater Chennai Corp.',
        icon: 'ph-shield-check', kind: 'community', photo: '',
      });
      caseCreated = true;
    }
  }

  return { updates, events, caseCreated, caseId, dupTargetRef, dupTargetUpdate };
}
