import type { Category, Issue, IssueEvent, ProofPhoto, Severity, Stage } from '@/lib/domain/types';
import { CATS, CITY, D, H } from '@/lib/domain/constants';
import { projectToFakeMap } from '@/lib/domain/geo';
import { TEST_CITIZENS, citizenUid } from './accounts';

// Seed data for demoing every flow end to end. Scenario issues (CP-S*) have fixed IDs the demo guide
// (docs/DEMO_GUIDE.md) refers to; their supporter counts assume the default thresholds
// (5 supporters or 80%, +8% per support). Everything carries `seed: true` so reset can find it,
// and a reporter uid, so the Console treats it as real (no Demo tag) — see isDemo in derive.ts.

export type SeedIssue = Issue & { seed: true; lat: number; lng: number };

/** Velachery — LocationPicker's fallback centre, where a new report lands when GPS is unavailable. */
export const HOME = { lat: 12.975, lng: 80.2206 };

const P: Record<string, [string, number, number]> = {
  // Chennai
  velachery: ['Velachery', 12.975, 80.2206], adyar: ['Adyar', 13.0012, 80.2565], tnagar: ['T. Nagar', 13.0418, 80.2341],
  mylapore: ['Mylapore', 13.0339, 80.2619], annanagar: ['Anna Nagar', 13.085, 80.2101], guindy: ['Guindy', 13.0067, 80.2206],
  madipakkam: ['Madipakkam', 12.9647, 80.1961], besant: ['Besant Nagar', 13.0003, 80.2667], saidapet: ['Saidapet', 13.0213, 80.2231],
  perungudi: ['Perungudi', 12.9654, 80.2461], pallikaranai: ['Pallikaranai', 12.9349, 80.2137], tambaram: ['Tambaram', 12.9249, 80.1],
  // Madurai
  goripalayam: ['Goripalayam', 9.9312, 78.1265], mduanna: ['Anna Nagar', 9.9195, 78.145], kknagar: ['KK Nagar', 9.9336, 78.14],
  periyar: ['Periyar Bus Stand', 9.916, 78.115], simmakkal: ['Simmakkal', 9.925, 78.1225], tallakulam: ['Tallakulam', 9.938, 78.135],
  // Coimbatore
  rspuram: ['RS Puram', 11.009, 76.95], gandhipuram: ['Gandhipuram', 11.0183, 76.9674], peelamedu: ['Peelamedu', 11.03, 77.027],
  saibaba: ['Saibaba Colony', 11.024, 76.942], ukkadam: ['Ukkadam', 10.988, 76.961],
};
const CITY_OF = (k: string) => (['goripalayam', 'mduanna', 'kknagar', 'periyar', 'simmakkal', 'tallakulam'].includes(k) ? 'Madurai'
  : ['rspuram', 'gandhipuram', 'peelamedu', 'saibaba', 'ukkadam'].includes(k) ? 'Coimbatore' : 'Chennai');

const PHOTOS: Record<Category, string[]> = {
  road: ['road1', 'road2', 'road4', 'road5'], drain: ['drain1', 'drain2', 'drain3', 'drain4'], garbage: ['garb1', 'garb2', 'garb5'],
  light: ['light3', 'light1', 'light2'], water: ['sew1', 'sew3', 'sew4', 'sew5'], tree: ['tree3', 'tree1', 'tree2'], footpath: ['foot1', 'foot2', 'foot4', 'foot3', 'foot5'],
};
const AFTER: Record<Category, string> = { road: 'fix2', drain: 'fix5', garbage: 'fix4', light: 'fix1', water: 'fix5', tree: 'fix4', footpath: 'fix4' };
const img = (k: string) => `/seed/${k}.webp`;

const TEXT: Record<Category, string> = {
  road: 'Getting worse every day. Two-wheelers are swerving into traffic to avoid it.',
  drain: 'Water has been standing for two days after the rain. Mosquitoes everywhere now.',
  garbage: 'Not collected for days. Stray dogs are spreading it across the road.',
  light: 'The whole stretch is pitch dark after 7 PM. Feels unsafe walking back from the bus stop.',
  water: 'The smell is unbearable and it keeps coming back after every rain.',
  tree: 'Blocking the road — people have to walk around it into traffic.',
  footpath: 'Senior citizens and kids are forced to walk on the main road.',
};
const TAGS: Record<Category, string[]> = {
  road: ['pothole', 'road-safety'], drain: ['waterlogging', 'monsoon'], garbage: ['garbage', 'swachh'], light: ['streetlight', 'night-safety'],
  water: ['sewage', 'health-hazard'], tree: ['tree-fall', 'road-block'], footpath: ['walkability', 'footpath'],
};
const NEIGHBOURS = ['Senthil R', 'Revathi P', 'Farhan A', 'Anitha J', 'Vignesh B', 'Suresh T', 'Nithya K', 'Ramesh V'];
const TEAM: Record<string, string> = {
  'Roads & Bridges': 'Roads Team', 'Storm Water Drains': 'Water & Drainage Team', 'Water & Sewerage': 'Water & Drainage Team',
  'Metrowater (CMWSSB)': 'Water & Drainage Team', 'Solid Waste Mgmt': 'Sanitation Team', Electrical: 'Streetlights Team', 'Parks & Trees': 'Parks & Trees Team',
};
const STAFF = { id: 'GCC-2041', name: 'Priya Natarajan' };

const deptOf = (cat: Category, city: string) => (cat === 'water' ? CITY[city]?.water ?? CATS.water.dept : CATS[cat].dept);
const ini = (n: string) => n.split(' ').map((w) => w[0]).join('');

// Deterministic PRNG so every reseed produces the same data (the guide's screenshots stay valid).
function rng(seed: number) { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; }

interface Spec {
  id: string; cat: Category; sev: Severity; place: string; street: string; title: string; stage: Stage;
  /** Test citizen index (TEST_CITIZENS) or a neighbour name for the reporter. */
  by: number | string;
  /** Test citizens (by index) who already supported it; they get a matching users/{uid}.votes entry. */
  voters?: number[];
  /** Extra supporters who are not test accounts. */
  extra?: number;
  conf: number;
  /** Hours ago it was reported. */
  ageH: number;
  /** Offset in metres from the place centre (east, north). */
  off?: [number, number];
  caseId?: string; crossedH?: number; assignedH?: number; progressH?: number; fixedH?: number; closedH?: number;
  dueInDays?: number; needed?: number; confirms?: number; reopened?: number; photos?: string[];
  reject?: { reason: string; note: string; photo: string; h: number };
  text?: string;
  comments?: [number | string, string][];
}

function build(s: Spec, now: number): SeedIssue {
  const [area, lat0, lng0] = P[s.place];
  const city = CITY_OF(s.place);
  const lat = lat0 + (s.off?.[1] ?? 0) / 111_000;
  const lng = lng0 + (s.off?.[0] ?? 0) / (111_000 * Math.cos((lat0 * Math.PI) / 180));
  const { x, y } = projectToFakeMap(lat, lng);
  const reporter = typeof s.by === 'number' ? TEST_CITIZENS[s.by] : null;
  const byName = reporter ? reporter.name : String(s.by);
  const uid = reporter ? citizenUid(reporter.phone) : `seed-${byName.toLowerCase().replace(/\W+/g, '-')}`;
  const voters = s.voters ?? [];
  const sup = 1 + voters.length + (s.extra ?? 0);
  const created = now - s.ageH * H;
  const at = (h?: number) => (h == null ? undefined : now - h * H);
  const dept = deptOf(s.cat, city);
  const corp = CITY[city].corp;
  const team = TEAM[dept] ?? 'Roads Team';
  // The issue page's photo grid has five tiles and draws labelled placeholders for missing ones, so
  // every issue gets five photos: its main shot plus four framings of the same scene (public/seed/*-vN),
  // as if taken by different neighbours. A scenario's second listed photo takes the third tile.
  const main = s.photos?.[0] ?? PHOTOS[s.cat][0];
  const photos = [main, `${main}-v1`, s.photos?.[1] ?? `${main}-v2`, `${main}-v3`, `${main}-v4`];

  const events: IssueEvent[] = [];
  const E = (ts: number | undefined, title: string, sub: string, icon: string, kind: string, photo = '', gov = false) => {
    if (ts != null) events.push({ ts, title, sub, icon, kind, photo, ...(gov ? { by: STAFF.name, byId: STAFF.id } : {}) });
  };
  E(created, `${byName} reported it`, `AI: ${CATS[s.cat].l} · ${s.sev}`, 'ph-camera', 'citizen');
  voters.forEach((v, k) => E(created + (k + 1) * ((now - created) / (voters.length + 3)), `${TEST_CITIZENS[v].name} joined`, 'Added support', 'ph-hand-pointing', 'support'));
  const crossed = at(s.crossedH);
  if (s.caseId && crossed) E(crossed, `Community verified · ${Math.min(s.conf, 84)}%`, `Sent to ${corp}`, 'ph-shield-check', 'community');
  const assigned = at(s.assignedH);
  const dueTs = s.dueInDays != null ? now + s.dueInDays * D : null;
  if (assigned) {
    const dd = dueTs ? new Date(dueTs).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '';
    E(assigned, `Verified by ${corp}`, `Reviewed by ${STAFF.name}`, 'ph-seal-check', 'gov', '', true);
    E(assigned + 1, `Official case ${s.caseId}`, `${dept} · target ${dd}`, 'ph-bank', 'gov', '', true);
    E(assigned + 2, `Assigned to ${team}`, `Target date ${dd}`, 'ph-users-three', 'gov', '', true);
  }
  E(at(s.progressH), 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', '', true);
  const fixed = at(s.fixedH);
  const fixProof: ProofPhoto[] | undefined = fixed ? [{ url: img(AFTER[s.cat]), by: STAFF.name, byId: STAFF.id, ts: fixed }] : undefined;
  E(fixed, 'Marked fixed by department', 'Proof photo attached · citizens asked to confirm', 'ph-check', 'fix', fixProof?.[0].url ?? '', true);
  if (s.reopened && fixed) E(fixed + 6 * H, 'Reopened by citizens', '3 citizens said not fixed', 'ph-arrow-counter-clockwise', 'citizen');
  E(at(s.closedH), 'Closed · confirmed by citizens', `${s.confirms ?? 0} of ${s.needed ?? 25} confirmed`, 'ph-seal-check', 'closed');
  const rejectTs = s.reject ? now - s.reject.h * H : undefined;
  const rejectProof: ProofPhoto[] | undefined = s.reject ? [{ url: img(s.reject.photo), by: STAFF.name, byId: STAFF.id, ts: rejectTs! }] : undefined;
  if (s.reject) E(rejectTs, `Not accepted by ${corp}`, `Reason: ${s.reject.reason}`, 'ph-x-circle', 'gov', rejectProof![0].url, true);
  events.sort((a, b) => a.ts - b.ts);

  // Photos come only from people who support the issue, so "added evidence" never exceeds supporters.
  const people = [{ name: byName, uid }, ...voters.map((v) => ({ name: TEST_CITIZENS[v].name, uid: citizenUid(TEST_CITIZENS[v].phone) })),
    ...Array.from({ length: s.extra ?? 0 }, (_, j) => ({ name: NEIGHBOURS[j % NEIGHBOURS.length], uid: `seed-n${j}` }))];
  const evidence = photos.map((p, k) => ({
    id: `${s.id}-e${k}`,
    by: ini(people[k % people.length].name),
    uid: people[k % people.length].uid,
    ts: created + k * H, kind: (k === 0 ? 'initial' : 'followup') as 'initial' | 'followup', url: img(p),
  }));
  const kmHome = city === 'Chennai' ? Math.hypot((lat - HOME.lat) * 111, (lng - HOME.lng) * 108) : 0;

  return {
    id: s.id, uid, cat: s.cat, sev: s.sev, city, area, street: s.street, title: s.title, stage: s.stage,
    sup, conf: s.conf, created, x, y, lat, lng, km: Math.round(kmHome * 10) / 10, anon: false, mine: false, by: byName, dept,
    summary: `${s.title} at ${s.street}, ${area}. AI rates it ${s.sev}; routed to ${dept}.`,
    voice: null, merged: [], history: '',
    caseId: s.caseId ?? null, assignee: assigned ? team : null, ...(assigned ? { team } : {}), prio: null, due: dueTs,
    confirms: s.confirms ?? 0, needed: s.needed ?? 25, valYes: s.confirms ?? 0, valNo: 0,
    evidence, events, reject: s.reject?.reason ?? null, opp: 0, shares: Math.round(sup / 3),
    comments: (s.comments ?? []).map(([w, text], k) => {
      const c = typeof w === 'number' ? TEST_CITIZENS[w] : null;
      return { id: `${s.id}-c${k}`, by: c ? c.name : String(w), uid: c ? citizenUid(c.phone) : `seed-n${k}`, text, ts: created + (k + 1) * 2 * H };
    }),
    text: s.text ?? TEXT[s.cat], tags: [...TAGS[s.cat], area.toLowerCase().replace(/[^a-z]+/g, '-')],
    ...(crossed ? { thresholdAt: crossed } : {}),
    ...(s.reopened ? { reopened: s.reopened } : {}),
    ...(fixProof ? { fixProof, fixNote: 'Work completed and site cleared.', fixedBy: STAFF } : {}),
    ...(assigned ? { decidedBy: STAFF, assignedBy: STAFF } : {}),
    ...(s.reject ? { rejectNote: s.reject.note, rejectProof, rejectRef: '', rejectedAt: rejectTs, decidedBy: STAFF, rejectedBy: STAFF } : {}),
    demo: false, seed: true,
  };
}

// Test citizen indexes: 0 Kavya (main), 1 Arjun, 2 Meena, 3 Karthik, 4 Lakshmi, 5 Sathish (Madurai).
const SCENARIOS: Spec[] = [
  // 1 · Join flow: a new pothole report at the Velachery default spot matches this (~60 m away).
  { id: 'CP-S1', cat: 'road', sev: 'high', place: 'velachery', off: [40, 45], street: 'Velachery Main Rd, near Vijayanagar bus stand', title: 'Deep pothole near Vijayanagar bus stand', stage: 'reported', by: 1, voters: [2], conf: 32, ageH: 20, photos: ['road1'],
    comments: [[2, 'Nearly skidded here on my scooter this morning.']] },
  // 2a · Already over the threshold: an official case waiting for the Console's decision.
  { id: 'CP-S2A', cat: 'drain', sev: 'critical', place: 'madipakkam', street: 'Madipakkam Main Rd junction', title: 'Rainwater stagnating at Madipakkam junction', stage: 'community', by: 3, voters: [1, 2, 4], extra: 3, conf: 72, ageH: 30, caseId: 'CP-CHN-24821', crossedH: 6, photos: ['drain1', 'drain3'] },
  // 2b · One support short on the supporter rule: 4 → 5 creates the case.
  { id: 'CP-S2B', cat: 'garbage', sev: 'high', place: 'adyar', street: 'LB Road, near Adyar depot', title: 'Garbage piling up near Adyar bus depot', stage: 'reported', by: 2, voters: [1, 3, 4], conf: 48, ageH: 26, photos: ['garb1', 'garb5'] },
  // 2b (variant) · Crosses on the confidence rule: 74% + 8 = 82% with only 4 supporters.
  { id: 'CP-S2C', cat: 'water', sev: 'critical', place: 'mylapore', street: 'Kutchery Rd, near the temple tank', title: 'Sewage overflowing on Kutchery Road', stage: 'reported', by: 1, voters: [2], extra: 1, conf: 74, ageH: 18, photos: ['sew3', 'sew1'] },
  // 2c · Still short after one more support: 2 → 3, 32% → 40%.
  { id: 'CP-S2D', cat: 'light', sev: 'medium', place: 'tnagar', street: 'Pondy Bazaar, 2nd lane', title: 'Streetlights dark on Pondy Bazaar 2nd lane', stage: 'reported', by: 4, voters: [3], conf: 32, ageH: 10, photos: ['light3'] },
  // 3 · Already supported by Kavya; the department has assigned it.
  { id: 'CP-S3', cat: 'drain', sev: 'high', place: 'perungudi', street: 'OMR, near Perungudi toll', title: 'Storm drain left open without barricade', stage: 'assigned', by: 1, voters: [0, 2, 3, 4], extra: 4, conf: 86, ageH: 96, caseId: 'CP-CHN-24822', crossedH: 80, assignedH: 60, dueInDays: 4, photos: ['drain4', 'drain2'] },
  // 4 · Completed: fixed with proof photo and confirmed by citizens.
  { id: 'CP-S4', cat: 'road', sev: 'high', place: 'guindy', street: 'Kathipara junction service road', title: 'Potholes on Kathipara service road', stage: 'closed', by: 2, voters: [0, 1, 3, 4], extra: 6, conf: 90, ageH: 400, caseId: 'CP-CHN-24812', crossedH: 380, assignedH: 360, progressH: 300, fixedH: 200, closedH: 150, dueInDays: -10, needed: 3, confirms: 3, photos: ['road4', 'road5'] },
  // 4 (variant) · Fixed, 2 of 3 confirmations: Kavya's confirmation closes it.
  { id: 'CP-S4B', cat: 'footpath', sev: 'medium', place: 'besant', street: "Elliot's Beach Rd", title: "Broken footpath tiles on Elliot's Beach Road", stage: 'resolved', by: 3, voters: [0, 1, 2], extra: 3, conf: 84, ageH: 240, caseId: 'CP-CHN-24818', crossedH: 220, assignedH: 200, progressH: 120, fixedH: 20, dueInDays: 2, needed: 3, confirms: 2, photos: ['foot1', 'foot2'] },
  // 5 · Live status update: GCC-2041 (Roads) starts work and marks it fixed while the citizen app watches.
  { id: 'CP-S5', cat: 'road', sev: 'critical', place: 'velachery', off: [-1500, -900], street: 'Taramani Link Rd, Phoenix signal', title: 'Road cave-in near Phoenix Mall signal', stage: 'assigned', by: 0, voters: [1, 2, 3, 4], extra: 2, conf: 88, ageH: 72, caseId: 'CP-CHN-24823', crossedH: 50, assignedH: 30, dueInDays: 3, photos: ['road2', 'road1'],
    comments: [[1, 'Buses are taking the other lane — traffic backs up to the bridge.'], [0, 'Barricades are up now, at least.']] },
  // Rejected: on private property, with the Console's proof photo.
  { id: 'CP-S6', cat: 'garbage', sev: 'medium', place: 'saidapet', street: 'Jones Rd, behind the market', title: 'Waste dumped inside a fenced plot', stage: 'rejected', by: 4, voters: [0, 1, 2, 3], extra: 1, conf: 81, ageH: 170, caseId: 'CP-CHN-24819', crossedH: 150, photos: ['garb2'],
    reject: { reason: 'On private property', note: 'The plot is privately owned and fenced. The owner has been served a notice to clear it within 7 days.', photo: 'garb3', h: 120 } },
];

// Madurai and Coimbatore: citizen-side backdrop (outside the Chennai Console's jurisdiction).
const BACKDROP: Spec[] = [
  { id: 'CP-M1', cat: 'road', sev: 'high', place: 'goripalayam', street: 'Goripalayam junction', title: 'Crater-size pothole at Goripalayam junction', stage: 'community', by: 5, extra: 12, conf: 76, ageH: 40, photos: ['road5', 'road2'] },
  { id: 'CP-M2', cat: 'drain', sev: 'medium', place: 'mduanna', street: '80 Feet Rd bus stop', title: 'Drain overflow near Anna Nagar bus stop', stage: 'reported', by: 'Muthu Kumar', extra: 3, conf: 48, ageH: 22, photos: ['drain2'] },
  { id: 'CP-M3', cat: 'garbage', sev: 'high', place: 'simmakkal', street: 'Vaigai riverbank', title: 'Waste dumped on the Vaigai riverbank', stage: 'progress', by: 'Selvi A', extra: 20, conf: 88, ageH: 150, caseId: 'CP-MDU-24760', crossedH: 130, assignedH: 110, progressH: 40, dueInDays: 2, photos: ['sew4', 'garb5'] },
  { id: 'CP-M4', cat: 'light', sev: 'medium', place: 'kknagar', street: 'KK Nagar main road', title: 'Streetlights out on KK Nagar main road', stage: 'reported', by: 5, extra: 2, conf: 40, ageH: 8, photos: ['light1'] },
  { id: 'CP-M5', cat: 'tree', sev: 'high', place: 'tallakulam', street: 'Alagar Kovil Rd', title: 'Tree leaning on a power line', stage: 'closed', by: 'Pandi R', extra: 14, conf: 86, ageH: 420, caseId: 'CP-MDU-24712', crossedH: 400, assignedH: 380, progressH: 330, fixedH: 300, closedH: 280, dueInDays: -14, confirms: 25, photos: ['tree1'] },
  { id: 'CP-M6', cat: 'water', sev: 'high', place: 'periyar', street: 'Periyar Bus Stand, bay 4', title: 'Drinking water pipe leaking at Periyar bus stand', stage: 'community', by: 'Karuppasamy M', extra: 9, conf: 70, ageH: 30, photos: ['sew1'] },
  { id: 'CP-C1', cat: 'road', sev: 'high', place: 'rspuram', street: 'DB Road, near head post office', title: 'Potholes along DB Road', stage: 'community', by: 'Suresh Babu', extra: 16, conf: 78, ageH: 36, photos: ['road4'] },
  { id: 'CP-C2', cat: 'garbage', sev: 'medium', place: 'gandhipuram', street: 'Cross Cut Rd, behind bus stand', title: 'Garbage piling behind Gandhipuram bus stand', stage: 'assigned', by: 'Nithya K', extra: 22, conf: 88, ageH: 130, caseId: 'CP-CBE-24744', crossedH: 110, assignedH: 90, dueInDays: 2, photos: ['garb1'] },
  { id: 'CP-C3', cat: 'light', sev: 'low', place: 'peelamedu', street: 'Avinashi Rd service lane', title: 'Streetlights flickering on Avinashi Rd service lane', stage: 'reported', by: 'Gokul P', extra: 4, conf: 44, ageH: 18, photos: ['light2'] },
  { id: 'CP-C4', cat: 'footpath', sev: 'medium', place: 'saibaba', street: 'NSR Road', title: 'Footpath blocked by construction rubble', stage: 'community', by: 'Divya S', extra: 7, conf: 62, ageH: 50, photos: ['foot2'] },
  { id: 'CP-C5', cat: 'drain', sev: 'high', place: 'ukkadam', street: 'Ukkadam lake bund road', title: 'Waterlogging on Ukkadam bund road', stage: 'resolved', by: 'Anand V', extra: 11, conf: 84, ageH: 260, caseId: 'CP-CBE-24790', crossedH: 240, assignedH: 220, progressH: 100, fixedH: 30, dueInDays: 1, confirms: 9, photos: ['drain3'] },
  // Chennai signals (not yet cases) so the Console's Signals list and the map are not empty.
  { id: 'CP-B1', cat: 'tree', sev: 'medium', place: 'annanagar', street: '2nd Avenue, near Tower Park', title: 'Fallen branch blocking 2nd Avenue', stage: 'reported', by: 'Revathi P', extra: 1, conf: 36, ageH: 5, photos: ['tree2'] },
  { id: 'CP-B2', cat: 'footpath', sev: 'low', place: 'tambaram', street: 'Mudichur Rd', title: 'Hawkers occupying the Mudichur Rd footpath', stage: 'reported', by: 'Vignesh B', extra: 2, conf: 40, ageH: 14, photos: ['foot3'] },
  { id: 'CP-B3', cat: 'water', sev: 'high', place: 'pallikaranai', street: '200 Feet Rd, marsh edge', title: 'Sewage mixing with the marsh canal', stage: 'reported', by: 'Farhan A', extra: 2, conf: 50, ageH: 28, photos: ['sew4'] },
];

// ~90 days of Chennai case history so Insights has trends, resolution times, on-time %, reopen and recurring data.
function history(): Spec[] {
  const r = rng(20260930);
  const places = ['velachery', 'adyar', 'tnagar', 'mylapore', 'annanagar', 'guindy', 'madipakkam', 'perungudi', 'saidapet', 'tambaram'];
  const cats: Category[] = ['road', 'drain', 'garbage', 'light', 'water', 'footpath', 'road', 'garbage', 'drain', 'tree'];
  const titles: Record<Category, string> = {
    road: 'Pothole on the main road', drain: 'Choked storm drain', garbage: 'Garbage not collected', light: 'Streetlight not working',
    water: 'Sewage leak on the street', tree: 'Tree branch hanging over the road', footpath: 'Damaged footpath slabs',
  };
  const sevs: Severity[] = ['high', 'medium', 'critical', 'low', 'high', 'medium'];
  const fixDays = [0.5, 2, 5, 10, 20, 1.5, 4, 8];
  const out: Spec[] = [];
  for (let k = 0; k < 32; k++) {
    // Areas repeat by design (only 10 of them) and categories cycle, so area+category pairs recur.
    const place = places[k % places.length];
    const cat = cats[(k * 3 + Math.floor(k / 10)) % cats.length];
    const crossedH = Math.round((3 + r() * 85) * 24);
    const fixGapH = fixDays[k % fixDays.length] * 24;
    const targetDays = [5, 7, 10, 14][k % 4];
    const assignedH = crossedH - Math.round(4 + r() * 30);
    const fixedH = assignedH - fixGapH;
    const bucket = k % 8;
    const base = { id: `CP-H${String(k + 1).padStart(2, '0')}`, cat, sev: sevs[k % sevs.length], place, off: [Math.round((r() - 0.5) * 1600), Math.round((r() - 0.5) * 1600)] as [number, number],
      street: `${P[place][0]} ${['Main Rd', '1st Cross St', 'Bazaar St', 'Link Rd', '4th Avenue'][k % 5]}`, title: titles[cat], by: NEIGHBOURS[k % NEIGHBOURS.length],
      extra: 4 + Math.round(r() * 30), conf: 80 + Math.round(r() * 14), ageH: crossedH + Math.round(10 + r() * 40), caseId: `CP-CHN-24${String(700 + k).padStart(3, '0')}`, crossedH, photos: [PHOTOS[cat][k % PHOTOS[cat].length]] };
    const dueInDays = (-assignedH / 24) + targetDays;
    if (fixedH > 2 && bucket < 6) {
      // Fixed and closed (most), or fixed and awaiting confirmation (recent ones).
      const closed = fixedH > 48;
      out.push({ ...base, stage: closed ? 'closed' : 'resolved', assignedH, progressH: assignedH - fixGapH / 2, fixedH, ...(closed ? { closedH: Math.max(1, fixedH - 30), confirms: 25 } : { confirms: 6 }),
        dueInDays, ...(k % 11 === 3 ? { reopened: 1 } : {}) });
    } else if (bucket === 6) {
      out.push({ ...base, stage: 'progress', assignedH, progressH: Math.round(assignedH / 2), dueInDays, ...(k % 3 === 0 ? { reopened: 1, fixedH: Math.round(assignedH / 3) } : {}) });
    } else {
      out.push({ ...base, stage: 'assigned', assignedH, dueInDays });
    }
  }
  return out;
}

export function buildSeed(now = Date.now()) {
  const issues = [...SCENARIOS, ...BACKDROP, ...history()].map((s) => build(s, now));
  // Each test citizen's votes must match the supporter lists above, or the app would let them support twice.
  const votes: Record<string, Record<string, 'up'>> = {};
  for (const s of [...SCENARIOS, ...BACKDROP]) for (const v of s.voters ?? []) (votes[citizenUid(TEST_CITIZENS[v].phone)] ??= {})[s.id] = 'up';
  const users = TEST_CITIZENS.filter((c) => c.seeded).map((c) => {
    const uid = citizenUid(c.phone);
    return { uid, phone: `+91 ${c.phone.slice(0, 5)} ${c.phone.slice(5)}`, name: c.name, area: c.area, anonDefault: false, verified: true, verifiedAt: now - 30 * D, createdAt: now - 30 * D, votes: votes[uid] ?? {}, seed: true };
  });
  return { issues, users, counters: { issue: { seq: 2200 }, case: { caseSeq: 24830 } } };
}
