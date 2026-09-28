'use server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { CATS, CITY, TAGS } from '@/lib/domain/constants';

const SCENES = {
  sewage: { cat: 'water', sev: 'critical', label: 'Sewage overflow', title: 'Sewage overflowing onto the road', size: '~15 m stretch', risk: 'Health hazard · bus stop 30 m', street: '100 Feet Rd, Vijayanagar', x: 48, y: 47, dept: 'Water & Sewerage' },
  pothole: { cat: 'road', sev: 'high', label: 'Pothole', title: 'Deep pothole on the carriageway', size: '~1.1 × 0.7 m', risk: 'Two-wheeler route · signal 40 m', street: 'Taramani Link Rd', x: 58, y: 40, dept: 'Roads & Bridges' },
  garbage: { cat: 'garbage', sev: 'high', label: 'Garbage dump', title: 'Uncollected garbage heap', size: '~3 m² heap', risk: 'Near market · stray dogs', street: 'Velachery Main Rd', x: 41, y: 66, dept: 'Solid Waste Mgmt' },
  light: { cat: 'light', sev: 'medium', label: 'Streetlight out', title: 'Streetlights not working', size: '3 poles dark', risk: 'Women walk here after work', street: 'Balaji Nagar 2nd St', x: 74, y: 70, dept: 'Electrical' },
} as const;

type SceneKey = keyof typeof SCENES;

function ini(name: string) {
  return name.split(' ').map(s => s[0]).join('');
}

export async function submitReport(opts: {
  scene: SceneKey;
  anon: boolean;
  text: string;
  tags: string[];
  photos: number;
  by: string;
}) {
  const sc = SCENES[opts.scene];
  const now = Date.now();
  const who = opts.anon ? 'Anonymous' : opts.by;
  const initials = opts.anon ? 'AN' : ini(opts.by);
  const tags = opts.tags.length ? opts.tags : [...(TAGS[sc.cat as keyof typeof TAGS] ?? []).slice(0, 2), 'velachery'];
  const summary = `${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`;

  const counterRef = adminDb.doc('counters/issue');
  const issueRef = adminDb.collection('issues').doc();

  const id = await adminDb.runTransaction(async tx => {
    const snap = await tx.get(counterRef);
    const seq: number = (snap.exists ? snap.data()!.seq : 0) + 1;
    tx.set(counterRef, { seq }, { merge: true });

    const issueId = `CP-${seq}`;
    const issue = {
      id: issueId,
      cat: sc.cat,
      sev: sc.sev,
      city: 'Chennai',
      area: 'Velachery',
      street: sc.street,
      title: sc.title,
      stage: 'reported',
      sup: 1,
      conf: 24,
      created: now,
      x: sc.x,
      y: sc.y,
      km: 0.1,
      anon: opts.anon,
      mine: true,
      by: who,
      dept: sc.dept,
      summary,
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
      needed: 25,
      valYes: 0,
      valNo: 0,
      evidence: Array.from({ length: Math.max(1, opts.photos) }, (_, k) => ({
        by: initials,
        uid: 'me',
        ts: now + k,
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
  scene: SceneKey;
  anon: boolean;
  text: string;
  tags: string[];
  photos: number;
  by: string;
  score: number;
}) {
  const sc = SCENES[opts.scene];
  const now = Date.now();
  const who = opts.anon ? 'Anonymous' : opts.by;
  const initials = opts.anon ? 'AN' : ini(opts.by);
  const issueRef = adminDb.doc(`issues/${opts.joinId}`);

  await adminDb.runTransaction(async tx => {
    const snap = await tx.get(issueRef);
    if (!snap.exists) throw new Error('Issue not found');
    const data = snap.data()!;
    const newEvidence = Array.from({ length: Math.max(1, opts.photos) }, (_, k) => ({
      by: initials,
      uid: 'me',
      ts: now + k,
    }));
    const mergeEntry = {
      by: who,
      h: 0,
      text: opts.text || sc.label,
      sim: opts.score,
      me: true,
    };
    const newTags = [...new Set([...(data.tags ?? []), ...opts.tags])];
    const newConf = Math.min(97, (data.conf ?? 24) + 1);
    const newSup = (data.sup ?? 0) + 1;
    const newEvent = {
      ts: now,
      title: `${who} joined with a photo`,
      sub: 'AI merged a duplicate report',
      icon: 'ph-intersect',
      kind: 'citizen',
      photo: '',
    };
    tx.update(issueRef, {
      sup: newSup,
      conf: newConf,
      tags: newTags,
      evidence: FieldValue.arrayUnion(...newEvidence),
      merged: FieldValue.arrayUnion(mergeEntry),
      events: FieldValue.arrayUnion(newEvent),
    });
  });

  return { id: opts.joinId };
}
