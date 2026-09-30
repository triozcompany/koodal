'use server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { CATS, TAGS } from '@/lib/domain/constants';
import { CAT_MOCK, deptFor } from '@/lib/domain/analyze';
import { projectToFakeMap } from '@/lib/domain/geo';
import type { Category, Issue } from '@/lib/domain/types';
import { applySupport } from '@/lib/domain/support.server';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';

function ini(name: string) {
  return name.split(' ').map(s => s[0]).join('');
}

export async function submitReport(opts: {
  cat: Category;
  anon: boolean;
  text: string;
  tags: string[];
  photos: number;
  by: string;
  uid: string;
  photoUrls?: string[];
  icon?: string;
  title: string;
  lat: number;
  lng: number;
  address: string;
  city?: string;
  area?: string;
}) {
  const sc = CAT_MOCK[opts.cat];
  const now = Date.now();
  const who = opts.anon ? 'Anonymous' : opts.by;
  const initials = opts.anon ? 'AN' : ini(opts.by);
  const tags = opts.tags.length ? opts.tags : [...(TAGS[opts.cat] ?? []).slice(0, 2), 'velachery'];
  const { x, y } = projectToFakeMap(opts.lat, opts.lng);
  const city = opts.city || 'Chennai';
  const area = opts.area || 'Velachery';
  const summary = `${sc.label} at ${opts.address}. ${sc.risk}.`;

  const counterRef = adminDb.doc('counters/issue');

  const id = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    const seq: number = (snap.exists ? snap.data()!.seq : 0) + 1;
    tx.set(counterRef, { seq }, { merge: true });

    const issueId = `CP-${seq}`;
    const issueRef = adminDb.doc(`issues/${issueId}`);
    const issue: Issue = {
      id: issueId,
      uid: opts.uid,
      cat: opts.cat,
      // omit when unset — Firestore rejects undefined
      ...(opts.icon && opts.icon !== CATS[opts.cat].icon ? { icon: opts.icon } : {}),
      sev: sc.sev,
      city,
      area,
      street: opts.address,
      title: opts.title,
      stage: 'reported',
      sup: 1,
      conf: 24,
      created: now,
      x,
      y,
      lat: opts.lat,
      lng: opts.lng,
      km: 0.1,
      anon: opts.anon,
      mine: true,
      by: who,
      dept: deptFor(opts.cat),
      summary,
      voice: null,
      text: opts.text,
      tags,
      comments: [],
      opp: 0,
      shares: 0,
      merged: [],
      history: '',
      caseId: null,
      assignee: null,
      prio: null,
      due: null,
      confirms: 0,
      needed: (await loadOrgConfig()).fixConfirmsNeeded,
      valYes: 0,
      valNo: 0,
      evidence: Array.from({ length: Math.max(1, opts.photos) }, (_, k) => ({
        by: initials,
        uid: opts.uid,
        ts: now + k,
        kind: 'initial' as const,
        ...(opts.photoUrls?.[k] ? { url: opts.photoUrls[k] } : {}),
      })),
      events: [{
        ts: now,
        title: `${opts.anon ? 'Anonymous' : 'You'} reported it`,
        sub: `AI: ${sc.label} · ${sc.sev}`,
        icon: 'ph-camera',
        kind: 'citizen',
        photo: '',
      }],
      reject: null,
    };
    tx.set(issueRef, issue);
    return issueId;
  });

  return { id };
}

export async function joinIssue(opts: {
  joinId: string;
  cat: Category;
  anon: boolean;
  text: string;
  tags: string[];
  photos: number;
  by: string;
  score: number;
  uid: string;
  photoUrls?: string[];
}) {
  const sc = CAT_MOCK[opts.cat];
  const now = Date.now();
  const who = opts.anon ? 'Anonymous' : opts.by;
  const initials = opts.anon ? 'AN' : ini(opts.by);
  const issueRef = adminDb.doc(`issues/${opts.joinId}`);
  const userRef = adminDb.doc(`users/${opts.uid}`);
  const cfg = await loadOrgConfig();

  // Joining a duplicate is a support like any other, so it can cross the threshold too.
  const res = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    const newEvidence = Array.from({ length: Math.max(1, opts.photos) }, (_, k) => ({
      by: initials,
      uid: opts.uid,
      ts: now + k,
      kind: 'initial' as const,
      ...(opts.photoUrls?.[k] ? { url: opts.photoUrls[k] } : {}),
    }));
    const mergeEntry = {
      by: who,
      h: 0,
      text: opts.text || sc.label,
      sim: opts.score,
      me: true,
    };
    const newTags = [...new Set([...(data.tags ?? []), ...opts.tags])];
    const newSup = (data.sup ?? 0) + 1;
    const r = await applySupport(tx, opts.joinId, data, newSup, cfg, now);
    const newEvent = {
      ts: now,
      title: `${who} joined with a photo`,
      sub: 'AI merged a duplicate report',
      icon: 'ph-intersect',
      kind: 'citizen',
      photo: '',
    };
    tx.set(userRef, { votes: { [opts.joinId]: 'up' } }, { merge: true });
    tx.update(issueRef, {
      ...r.updates,
      sup: newSup,
      tags: newTags,
      evidence: FieldValue.arrayUnion(...newEvidence),
      merged: FieldValue.arrayUnion(mergeEntry),
      events: FieldValue.arrayUnion(newEvent, ...r.events),
    });
    if (r.dupTargetRef && r.dupTargetUpdate) tx.update(r.dupTargetRef, r.dupTargetUpdate);
    return { caseCreated: r.caseCreated, caseId: r.caseId };
  });

  return { id: opts.joinId, ...res };
}
