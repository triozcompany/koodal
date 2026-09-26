import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { getState, getIssue, saveIssue, updateMeta, updateUserState } from '@/lib/firestore';
import type { Issue } from '@/lib/firestore';

export const dynamic = 'force-dynamic';

const H = 3600e3;
const D = 24 * H;

const CITY: Record<string, { corp: string; code: string; officers: string[] }> = {
  Chennai: { corp: 'Greater Chennai Corp.', code: 'CHN', officers: ['JE Priya Natarajan', 'JE Karthik Rajan', 'AE Farida Begum'] },
  Coimbatore: { corp: 'Coimbatore City Corp.', code: 'CBE', officers: ['JE Suresh Babu', 'JE Nithya Krishnan'] },
  Madurai: { corp: 'Madurai Corporation', code: 'MDU', officers: ['JE Muthu Pandian', 'JE Selvi Arumugam'] },
};
const VERIFIER = 'AE R. Ganesan';
const ME = { name: 'Divya Raghavan', short: 'DR' };

function corp(i: Issue) { return CITY[i.city].corp; }

function ev(i: Issue, title: string, sub: string, icon: string, kind: string, photo = '') {
  i.events.push({ ts: Date.now(), title, sub, icon, kind, photo });
}

function bump(i: Issue, n: number, my: Record<string, boolean>): boolean {
  const before = i.conf;
  i.conf = Math.max(5, Math.min(97, i.conf + n));
  if (i.stage === 'reported' && i.sup >= 5) i.stage = 'community';
  if (before < 80 && i.conf >= 80 && (i.stage === 'community' || i.stage === 'reported')) {
    i.stage = 'review';
    ev(i, `Community verified · ${i.conf}%`, `Sent to ${corp(i)} for verification`, 'ph-shield-check', 'community');
    return true;
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, args } = body as { action: string; args: unknown[] };

    const state = await getState();
    const { my, me, seq, caseSeq } = state;
    let newSeq = seq;
    let newCaseSeq = caseSeq;

    const mySupport = { ...my.support };
    const myValidated = { ...my.validated };
    const myConfirmed = { ...my.confirmed };

    const find = (id: string) => state.issues.find(x => x.id === id);
    const initials = () => (me.anonDefault ? 'AN' : ME.short);

    let result: unknown = {};

    if (action === 'support') {
      const [id] = args as [string];
      if (mySupport[id]) return NextResponse.json({});
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      mySupport[id] = true;
      i.sup++;
      const crossed = bump(i, 2, mySupport);
      await Promise.all([saveIssue(i), updateUserState({ support: mySupport })]);
      result = { crossed };
    } else if (action === 'unsupport') {
      const [id] = args as [string];
      const i = find(id);
      if (!i || !mySupport[id] || i.mine) return NextResponse.json({});
      delete mySupport[id];
      i.sup--;
      await Promise.all([saveIssue(i), updateUserState({ support: mySupport })]);
      result = {};
    } else if (action === 'evidence') {
      const [id] = args as [string];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      let crossed = false;
      if (!mySupport[id]) { mySupport[id] = true; i.sup++; crossed = bump(i, 2, mySupport); }
      i.evidence.push({ by: initials(), ts: Date.now() });
      crossed = bump(i, 2, mySupport) || crossed;
      ev(i, 'New photo evidence', me.anonDefault ? 'From Anonymous' : `From ${ME.name}`, 'ph-image', 'citizen');
      await Promise.all([saveIssue(i), updateUserState({ support: mySupport })]);
      result = { crossed };
    } else if (action === 'validate') {
      const [id, yes] = args as [string, boolean];
      const i = find(id);
      if (!i || myValidated[id]) return NextResponse.json({});
      myValidated[id] = yes ? 1 : -1;
      let crossed = false;
      if (yes) { i.valYes++; crossed = bump(i, 1, mySupport); }
      else { i.valNo++; i.conf = Math.max(5, i.conf - 3); }
      await Promise.all([saveIssue(i), updateUserState({ validated: myValidated })]);
      result = { crossed, conf: i.conf };
    } else if (action === 'report') {
      const [{ scene, anon, joinId, analyzeResult }] = args as [{ scene: string; anon: boolean; joinId?: string; analyzeResult: { cat: string; sev: string; dept: string; title: string; summary: string; street: string; voice?: { lang: string; text: string; en: string }; x: number; y: number; matches?: Array<{ id: string; score: number }> } }];
      const a = analyzeResult;
      const who = anon ? 'Anonymous' : ME.name;

      if (joinId) {
        const i = find(joinId);
        if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        i.merged.push({ by: who, h: 0, text: a.voice ? a.voice.text : a.summary, sim: (a.matches?.find(m => m.id === joinId) || { score: 90 }).score, me: true });
        let crossed = false;
        if (!mySupport[joinId]) { mySupport[joinId] = true; i.sup++; crossed = bump(i, 2, mySupport); }
        i.evidence.push({ by: anon ? 'AN' : ME.short, ts: Date.now() });
        crossed = bump(i, 2, mySupport) || crossed;
        ev(i, `${who} joined with a photo`, 'AI merged a duplicate report', 'ph-intersect', 'citizen');
        await Promise.all([saveIssue(i), updateUserState({ support: mySupport })]);
        result = { id: joinId, crossed };
      } else {
        const id = `CP-${newSeq++}`;
        const now = Date.now();
        const newIssue: Issue = {
          id, cat: a.cat, sev: a.sev, city: 'Chennai', area: 'Velachery', street: a.street || 'Velachery Main Rd',
          title: a.title, stage: 'reported', sup: 1, conf: 24, created: now, x: a.x || 50, y: a.y || 50,
          km: 0.1, anon: !!anon, mine: true, by: who, dept: a.dept, summary: a.summary,
          voice: a.voice || null, merged: [], history: '', caseId: null, assignee: null, prio: null, due: null,
          confirms: 0, needed: 25, valYes: 0, valNo: 0,
          evidence: [{ by: anon ? 'AN' : ME.short, ts: now }],
          events: [{ ts: now, title: `${anon ? 'Anonymous' : 'You'} reported it`, sub: `AI: ${a.title} · ${a.sev}`, icon: 'ph-camera', kind: 'citizen', photo: '' }],
          reject: null,
        };
        mySupport[id] = true;
        await Promise.all([saveIssue(newIssue), updateMeta({ seq: newSeq }), updateUserState({ support: mySupport })]);
        result = { id, crossed: false };
      }
    } else if (action === 'verify') {
      const [id, { assignee, prio }] = args as [string, { assignee: string; prio: string }];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const days: Record<string, number> = { P1: 5, P2: 10, P3: 21 };
      i.caseId = `CP-${CITY[i.city].code}-${newCaseSeq++}`;
      i.prio = prio;
      i.assignee = assignee;
      i.due = Date.now() + (days[prio] || 5) * D;
      i.stage = 'assigned';
      ev(i, `Verified by ${corp(i)}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov');
      ev(i, `Official case ${i.caseId}`, `${i.dept} · ${days[prio] || 5}-day SLA`, 'ph-bank', 'gov');
      ev(i, `Assigned to ${assignee}`, '', 'ph-user-circle-check', 'gov');
      await Promise.all([saveIssue(i), updateMeta({ caseSeq: newCaseSeq })]);
      result = i.caseId;
    } else if (action === 'reject') {
      const [id, reason] = args as [string, string];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      i.stage = 'rejected';
      i.reject = reason;
      ev(i, `Not accepted by ${corp(i)}`, `Reason: ${reason}`, 'ph-x-circle', 'gov');
      await saveIssue(i);
      result = {};
    } else if (action === 'inspect') {
      const [id] = args as [string];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      ev(i, 'Field inspection scheduled', 'Within 24 hours', 'ph-binoculars', 'gov');
      await saveIssue(i);
      result = {};
    } else if (action === 'note') {
      const [id, title, sub] = args as [string, string, string];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      ev(i, title, sub || '', 'ph-megaphone', 'gov');
      await saveIssue(i);
      result = {};
    } else if (action === 'setStatus') {
      const [id, st] = args as [string, string];
      const i = find(id);
      if (!i || i.stage === st) return NextResponse.json({});
      i.stage = st;
      if (st === 'assigned') ev(i, `Assigned to ${i.assignee || CITY[i.city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
      if (st === 'progress') ev(i, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
      if (st === 'resolved') { i.confirms = Math.max(i.confirms, Math.round(i.needed * 0.7)); ev(i, 'Marked fixed by department', 'Proof photo attached · citizens asked to confirm', 'ph-check', 'fix', 'after photo'); }
      if (st === 'closed') ev(i, 'Case closed', `${i.confirms} of ${i.needed} citizens confirmed`, 'ph-seal-check', 'fix');
      if (st === 'verified') ev(i, 'Moved back to verified', '', 'ph-arrow-counter-clockwise', 'gov');
      await saveIssue(i);
      result = {};
    } else if (action === 'confirm') {
      const [id, fixed, reason] = args as [string, boolean, string];
      const i = find(id);
      if (!i || myConfirmed[id]) return NextResponse.json({});
      myConfirmed[id] = fixed ? 1 : -1;
      if (fixed) {
        i.confirms++;
        ev(i, 'A citizen confirmed the fix', `${i.confirms} of ${i.needed}`, 'ph-thumbs-up', 'citizen');
        if (i.confirms >= i.needed) { i.stage = 'closed'; ev(i, 'Case closed', `${i.confirms} of ${i.needed} citizens confirmed`, 'ph-seal-check', 'fix'); }
      } else {
        ev(i, 'Citizen says: not fixed', reason || '', 'ph-thumbs-down', 'citizen');
      }
      await Promise.all([saveIssue(i), updateUserState({ confirmed: myConfirmed })]);
      result = { closed: i.stage === 'closed' };
    } else if (action === 'govAdvance') {
      const [id] = args as [string];
      const i = find(id);
      if (!i) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const nextMap: Record<string, string> = { reported: 'community', community: 'review', review: 'verify', verified: 'assigned', assigned: 'progress', progress: 'resolved' };
      const next = nextMap[i.stage];
      if (!next) return NextResponse.json({ stage: i.stage });
      if (next === 'community') { i.sup = Math.max(i.sup, 6); i.stage = 'community'; i.conf = Math.max(i.conf, 60); ev(i, 'Neighbours joined', '', 'ph-users-three', 'community'); await saveIssue(i); }
      else if (next === 'review') { i.conf = 79; bump(i, 1, mySupport); await saveIssue(i); }
      else if (next === 'verify') {
        const days: Record<string, number> = { P1: 5, P2: 10, P3: 21 };
        const prio = i.sev === 'critical' || i.sev === 'high' ? 'P1' : 'P2';
        i.caseId = `CP-${CITY[i.city].code}-${newCaseSeq++}`;
        i.prio = prio;
        i.assignee = CITY[i.city].officers[0];
        i.due = Date.now() + (days[prio] || 5) * D;
        i.stage = 'assigned';
        ev(i, `Verified by ${corp(i)}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov');
        ev(i, `Official case ${i.caseId}`, `${i.dept} · ${days[prio]}-day SLA`, 'ph-bank', 'gov');
        ev(i, `Assigned to ${i.assignee}`, '', 'ph-user-circle-check', 'gov');
        await Promise.all([saveIssue(i), updateMeta({ caseSeq: newCaseSeq })]);
      } else {
        i.stage = next;
        if (next === 'assigned') ev(i, `Assigned to ${i.assignee || CITY[i.city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
        if (next === 'progress') ev(i, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
        if (next === 'resolved') { i.confirms = Math.max(i.confirms, Math.round(i.needed * 0.7)); ev(i, 'Marked fixed by department', 'Proof photo attached · citizens asked to confirm', 'ph-check', 'fix', 'after photo'); }
        await saveIssue(i);
      }
      result = { stage: i.stage };
    } else if (action === 'setMe') {
      const [p] = args as [Record<string, unknown>];
      await updateUserState({}, p as Record<string, string>);
      result = {};
    } else {
      return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('POST /api/act', err);
    return NextResponse.json({ error: 'Action failed' }, { status: 500 });
  }
}
