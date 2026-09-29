import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Issue, IssueEvent, Evidence, Comment, Voice, MergedReport } from '../lib/domain/types';

const SERVICE_ACCOUNT_PATH = join(process.cwd(), 'secret', 'trioz-319df-firebase-adminsdk-fbsvc-9ed783fdc2.json');

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  try {
    return JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  } catch {
    return undefined; // falls back to ADC (gcloud auth application-default login)
  }
}

const H = 3600e3;
const D = 24 * H;

const CATS = {
  road:     { l: 'Roads',          icon: 'ph-road-horizon',       dept: 'Roads & Bridges' },
  drain:    { l: 'Drains',         icon: 'ph-waves',              dept: 'Storm Water Drains' },
  garbage:  { l: 'Garbage',        icon: 'ph-trash',              dept: 'Solid Waste Mgmt' },
  light:    { l: 'Streetlights',   icon: 'ph-lightbulb',          dept: 'Electrical' },
  water:    { l: 'Water & sewage', icon: 'ph-drop',               dept: 'Water & Sewerage' },
  tree:     { l: 'Trees',          icon: 'ph-tree',               dept: 'Parks & Trees' },
  footpath: { l: 'Footpaths',      icon: 'ph-person-simple-walk', dept: 'Roads & Bridges' },
} as const;

const CITY = {
  Chennai:    { corp: 'Greater Chennai Corp.',  code: 'CHN', water: 'Metrowater (CMWSSB)', officers: ['JE Priya Natarajan', 'JE Karthik Rajan', 'AE Farida Begum'] },
  Coimbatore: { corp: 'Coimbatore City Corp.', code: 'CBE', officers: ['JE Suresh Babu', 'JE Nithya Krishnan'] },
  Madurai:    { corp: 'Madurai Corporation',   code: 'MDU', officers: ['JE Muthu Pandian', 'JE Selvi Arumugam'] },
} as const;

const ORDER = ['reported', 'community', 'review', 'verified', 'assigned', 'progress', 'resolved', 'closed'];
const USERS = ['Karthik S', 'Priya M', 'Arun K', 'Meena V', 'Senthil R', 'Lakshmi N', 'Farhan A', 'Revathi P', 'Vignesh B', 'Anitha J', 'Suresh T', 'Kavya R'];
const ME = { name: 'Divya Raghavan', short: 'DR', area: 'Velachery, Chennai', phone: '+91 98401 23456' };
const VERIFIER = 'AE R. Ganesan';
const TAGS: Record<string, string[]> = {
  road: ['pothole', 'road-safety', 'two-wheeler'], drain: ['monsoon', 'waterlogging', 'drainage'],
  garbage: ['garbage', 'swachh', 'smell'], light: ['streetlight', 'night-safety', 'women-safety'],
  water: ['sewage', 'health-hazard', 'metrowater'], tree: ['tree-fall', 'footpath'],
  footpath: ['walkability', 'footpath', 'encroachment'],
};
const TEXT: Record<string, string> = {
  road: 'Getting worse every day. Two-wheelers are swerving into traffic to avoid it.',
  drain: 'Water has been standing for two days after the rain. Mosquitoes everywhere now.',
  garbage: 'Not collected for days. Stray dogs are spreading it across the road.',
  light: 'The whole stretch is pitch dark after 7 PM. Feels unsafe walking back from the bus stop.',
  water: 'The smell is unbearable and it keeps coming back after every rain.',
  tree: 'Blocking the footpath — people with prams have to walk on the road.',
  footpath: 'Senior citizens and kids are forced to walk on the main road.',
};
const CPOOL = ['Same issue near our street too.','Inga daily ippadi dhaan irukku, yaarum kandukala.','Reported this last month also. Hope it moves this time.','நேத்து ராத்திரி ஒரு பைக் இங்க விழுந்துச்சு.','Added a photo from this morning.','Councillor office-ku call panni sonnen, they said they will check.','Kids walk to school through here. Please prioritise.','Seriously dangerous at night.','Passed by it today, still the same.','Corporation van vandhuchu, but nothing done yet.'];

const ini = (n: string) => n.split(' ').map((s: string) => s[0]).join('');
const deptFor = (cat: string, city: string): string => {
  const c = CITY[city as keyof typeof CITY] as unknown as { corp: string; code: string; water?: string; officers: string[] };
  return cat === 'water' && c?.water ? c.water : CATS[cat as keyof typeof CATS]?.dept ?? '';
};
const corpOf = (city: string): string => CITY[city as keyof typeof CITY]?.corp ?? '';

function mkEvidence(sup: number, anon: boolean, name: string, by: number, created: number, h: number): Evidence[] {
  const people = Math.max(1, Math.round(sup * 0.28));
  const photos = Math.min(48, people + Math.round(people * 0.75));
  const out: Evidence[] = [];
  for (let k = 0; k < photos; k++) {
    const p = k < people ? k : (k * 7) % people;
    out.push({ by: p === 0 ? (anon ? 'AN' : ini(name)) : ini(USERS[(p * 3 + by + 12) % 12]), uid: p === 0 ? (by === -1 ? 'me' : 'r') : `u${p}`, ts: created + k * (h * H / (photos + 1)) });
  }
  return out;
}

function mkComments(id: string, created: number, h: number): Comment[] {
  const s = parseInt(id.slice(3)) || 0;
  const n = s % 4 + 1;
  const out: Comment[] = [];
  for (let k = 0; k < n; k++) out.push({ by: USERS[(k * 5 + s) % 12], text: CPOOL[(k * 3 + s) % CPOOL.length], ts: created + (k + 1) * (h * H / (n + 2)) });
  return out;
}

type RowExtra = {
  summary?: string; voice?: Voice; merged?: MergedReport[]; history?: string;
  caseId?: string; assignee?: string; prio?: string; due?: number; confirms?: number; needed?: number; text?: string; tags?: string[];
};
type Row = [string, string, string, string, string, string, string, string, number, number, number, number, boolean, number, number, number, RowExtra];

function build(r: Row, now: number): Issue {
  const [id, cat, sev, city, area, street, title, stage, sup, conf, h, by, anon, x, y, km, ex] = r;
  const created = now - h * H;
  const name = by === -1 ? ME.name : USERS[by % USERS.length];
  const at = ORDER.indexOf(stage);
  const span = h * H;
  const t = (f: number) => created + span * f;
  const events: IssueEvent[] = [];
  const E = (f: number, etitle: string, sub: string, icon: string, kind: string, photo = '') =>
    events.push({ ts: t(f), title: etitle, sub, icon, kind, photo });

  E(0, `${anon ? 'Anonymous' : name} reported it`, '', 'ph-camera', 'citizen');
  if (at >= 1) E(0.15, `${Math.max(4, Math.round(sup * 0.6))} neighbours joined`, `${mkEvidence(sup, anon, name, by, created, h).length} photos`, 'ph-users-three', 'community');
  if (at >= 2) E(0.3, `Community verified · ${Math.min(conf, 84)}%`, `Sent to ${corpOf(city)}`, 'ph-shield-check', 'community');
  if (at >= 3) { E(0.4, `Verified by ${corpOf(city)}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov'); E(0.41, `Official case ${ex.caseId}`, `${deptFor(cat, city)} · ${ex.prio}`, 'ph-bank', 'gov'); }
  if (at >= 4) E(0.5, `Assigned to ${ex.assignee}`, '', 'ph-user-circle-check', 'gov');
  if (at >= 5) E(0.65, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
  if (at >= 6) E(0.85, 'Marked fixed by department', 'Proof photo attached', 'ph-check', 'fix', 'after photo');
  if (at >= 7) E(0.97, 'Closed · confirmed by citizens', `${ex.confirms ?? 0} of ${ex.needed ?? 25} confirmed`, 'ph-seal-check', 'fix');

  const merged: MergedReport[] = ex.merged ?? (ex.caseId ? [
    { by: USERS[(Math.abs(by) + 3) % 12], h: Math.max(1, Math.round(h * 0.8)), text: TEXT[cat], sim: 92 },
    { by: 'Anonymous', h: Math.max(1, Math.round(h * 0.6)), text: CPOOL[(parseInt(id.slice(3)) || 0) % CPOOL.length], sim: 88 },
  ] : []);

  const summary = ex.summary || `${CATS[cat as keyof typeof CATS].l === 'Streetlights' ? 'Streetlights out' : title} at ${street}, ${area}. AI rates it ${sev}; routed to ${deptFor(cat, city)}.`;

  return {
    id, cat: cat as Issue['cat'], sev: sev as Issue['sev'], city, area, street, title,
    stage: stage as Issue['stage'], sup, conf, created, x, y, km, anon, mine: by === -1,
    by: anon ? 'Anonymous' : name, dept: deptFor(cat, city), summary,
    voice: ex.voice ?? null, merged, history: ex.history ?? '',
    caseId: ex.caseId ?? null, assignee: ex.assignee ?? null,
    prio: (ex.prio ?? null) as Issue['prio'],
    due: ex.due != null ? now + ex.due * D : null,
    confirms: ex.confirms ?? 0, needed: ex.needed ?? 25,
    valYes: Math.round(sup * 0.7), valNo: Math.max(1, Math.round(sup * 0.05)),
    evidence: mkEvidence(sup, anon, name, by, created, h),
    events, reject: null, opp: Math.round(sup * 0.06), shares: Math.round(sup * 0.4),
    comments: mkComments(id, created, h),
    text: ex.text ?? (ex.voice ? ex.voice.en : TEXT[cat]),
    tags: ex.tags ?? [...(TAGS[cat]?.slice(0, 2) ?? []), area.toLowerCase().replace(/[^a-z]+/g, '-').replace(/^-|-$/g, '')],
  };
}

const ROWS: Row[] = [
  ['CP-2107','water','critical','Chennai','Velachery','100 Feet Rd, near Vijayanagar bus stand','Sewage overflowing onto 100 Feet Road','community',41,76,30,0,false,49,46,0.2,{summary:'Sewage overflowing from a manhole across the carriageway near the bus stand. Health hazard; commuters wading through.',voice:{lang:'Tamil',text:'"ரோட்டுல முழுசா சாக்கடை தண்ணி ஓடுது, ஸ்மெல் தாங்க முடியல"',en:'Sewage is running all over the road, the smell is unbearable'},merged:[{by:'Anonymous',h:22,text:'"Drainage overflow aagudhu, bike la poga mudiyala"',sim:96},{by:'Meena V',h:9,text:'Manhole leaking dirty water on main road',sim:93},{by:'Arun K',h:4,text:'Bus stop flooded with drain water',sim:91}],history:'Same manhole desilted on 2 Jul 2026. Recurred in under 3 months — check the trunk sewer.'}],
  ['CP-2111','road','high','Chennai','Velachery','Taramani Link Rd, Phoenix signal','Deep pothole near the Phoenix signal','community',28,64,20,2,false,60,38,0.9,{voice:{lang:'Tanglish',text:'"Signal kitta periya pallam, night la theriyave illa"',en:"Big pit near the signal, you can't see it at night"}}],
  ['CP-2098','light','medium','Chennai','Velachery','Bharathi Nagar 3rd St','Four streetlights dark on Bharathi Nagar 3rd St','community',9,38,6,-1,false,34,28,0.6,{}],
  ['CP-2089','garbage','high','Chennai','Velachery','Velachery Main Rd, below MRTS','Garbage dumped below Velachery MRTS pillar','review',63,84,52,4,false,56,62,1.1,{voice:{lang:'Tanglish',text:'"Moonu naala garbage edukkala, naai ellam kizhikudhu"',en:'Garbage not collected for three days, dogs are tearing it apart'}}],
  ['CP-2045','drain','critical','Chennai','Velachery','Vijayanagar 4th Main Rd','Open manhole without cover on a school route','resolved',66,91,190,5,false,42,56,0.5,{caseId:'CP-CHN-24790',assignee:'JE Priya Natarajan',prio:'P1',due:-1,confirms:18,needed:25}],
  ['CP-2112','road','low','Chennai','Velachery','Dhandeeswaram Nagar Main Rd','Speed breaker paint faded, bikes skidding','reported',3,22,5,6,false,72,30,0.7,{}],
  ['CP-2109','water','medium','Chennai','Velachery','Ram Nagar North, 5th St','Low-pressure drinking water for a week','community',19,55,40,-1,true,30,64,0.8,{voice:{lang:'Tamil',text:'"ஒரு வாரமா தண்ணி சரியா வரல"',en:"Water hasn't come properly for a week"}}],
  ['CP-2091','footpath','medium','Chennai','Velachery','Velachery Bypass Rd','Encroached footpath, walkers forced onto road','community',17,44,70,7,false,78,52,1.2,{}],
  ['CP-2106','drain','high','Chennai','Madipakkam','Madipakkam Main Rd junction','Rainwater stagnating at Madipakkam junction','community',33,71,28,8,false,62,76,2.2,{}],
  ['CP-2064','drain','high','Chennai','Pallikaranai','200 Feet Rd, marsh edge','Storm drain choked with plastic','verified',52,88,120,9,false,82,72,3.4,{caseId:'CP-CHN-24802',assignee:'AE Farida Begum',prio:'P1',due:3}],
  ['CP-2051','road','medium','Chennai','Adyar','LB Road, near Adyar depot','Road cut left unpatched after Metrowater work','progress',47,86,260,10,false,22,22,4.2,{caseId:'CP-CHN-24755',assignee:'JE Karthik Rajan',prio:'P2',due:1}],
  ['CP-2033','tree','medium','Chennai','Adyar','Gandhi Nagar 2nd Main Rd','Fallen gulmohar branch blocking footpath','closed',31,83,400,11,false,14,40,4.6,{caseId:'CP-CHN-24711',assignee:'JE Karthik Rajan',prio:'P2',due:-6,confirms:25,needed:25}],
  ['CP-2102','footpath','medium','Chennai','T. Nagar','Pondy Bazaar pedestrian plaza','Broken footpath tiles, tripping hazard','community',22,58,33,1,false,10,14,8.1,{}],
  ['CP-2095','water','high','Chennai','Mylapore','Kutchery Rd, near the temple tank','Metrowater pipe leaking for 3 days','review',58,86,60,3,false,26,12,9.0,{voice:{lang:'Tanglish',text:'"Moonu naala pipe leak, thanni waste aagudhu"',en:'Pipe leaking for three days, water is being wasted'}}],
  ['CP-2080','garbage','medium','Chennai','Anna Nagar','2nd Avenue, near Tower Park','Overflowing bins near Tower Park','progress',39,84,150,2,false,20,8,14,{caseId:'CP-CHN-24766',assignee:'AE Farida Begum',prio:'P2',due:-1}],
  ['CP-2071','light','high','Chennai','Chromepet','GST Rd service lane','Service lane completely dark after 7 PM','review',44,82,44,5,false,40,88,11,{voice:{lang:'Tanglish',text:'"Street full-a dark, ladies nadakka bayapadranga"',en:'Street is fully dark, women are afraid to walk'}}],
  ['CP-2076','road','high','Chennai','Guindy','Kathipara junction underpass','Waterlogging and potholes under Kathipara underpass','assigned',71,90,110,6,false,16,30,5.1,{caseId:'CP-CHN-24781',assignee:'JE Karthik Rajan',prio:'P1',due:-2}],
  ['CP-2040','garbage','low','Chennai','Besant Nagar',"Elliot's Beach front","Broken bins along Elliot's Beach",'closed',24,81,500,7,false,30,20,6.5,{caseId:'CP-CHN-24690',assignee:'AE Farida Begum',prio:'P3',due:-10,confirms:20,needed:20}],
  ['CP-2085','light','critical','Chennai','Saidapet','Jones Rd junction box','Exposed live wire at junction box, Jones Road','review',37,90,3,9,false,12,34,6.0,{}],
  ['CP-2060','drain','high','Chennai','Perungudi','OMR, near Perungudi toll','Storm drain work left open without barricade','progress',45,85,96,10,false,70,82,3.0,{caseId:'CP-CHN-24770',assignee:'AE Farida Begum',prio:'P1',due:0.5}],
  ['CP-2104','water','high','Chennai','Tambaram','Mudichur Rd','Sewage mixing with stormwater canal','review',36,81,26,0,false,56,90,9.8,{}],
  ['CP-3021','road','high','Coimbatore','RS Puram','DB Road, near head post office','Potholes along DB Road','review',49,83,36,1,false,40,40,0,{}],
  ['CP-3017','garbage','medium','Coimbatore','Gandhipuram','Cross Cut Rd, behind bus stand','Garbage piling behind Gandhipuram bus stand','progress',57,88,130,2,false,56,30,0,{caseId:'CP-CBE-24744',assignee:'JE Suresh Babu',prio:'P2',due:2}],
  ['CP-3009','light','low','Coimbatore','Peelamedu','Avinashi Rd service lane','Streetlights flickering on Avinashi Rd service lane','community',14,48,18,3,false,72,46,0,{}],
  ['CP-3004','water','high','Coimbatore','Singanallur','Trichy Rd','Drinking water mixed with sewage','verified',38,87,80,4,false,78,66,0,{caseId:'CP-CBE-24799',assignee:'JE Nithya Krishnan',prio:'P1',due:4}],
  ['CP-4012','road','high','Madurai','Goripalayam','Goripalayam junction','Crater-size pothole at Goripalayam junction','review',61,88,30,5,false,46,40,0,{voice:{lang:'Tamil',text:'"ஜங்ஷன்ல பெரிய குழி, பஸ் கூட ஆடுது"',en:'Huge pit at the junction, even buses shake'}}],
  ['CP-4008','drain','medium','Madurai','Anna Nagar','80 Feet Rd bus stop','Drain overflow near Anna Nagar bus stop','community',26,66,22,6,false,64,56,0,{}],
  ['CP-4003','garbage','high','Madurai','Simmakkal','Vaigai riverbank','Waste dumped on the Vaigai riverbank','assigned',44,86,100,7,false,34,30,0,{caseId:'CP-MDU-24760',assignee:'JE Muthu Pandian',prio:'P1',due:-1}],
  ['CP-4001','tree','low','Madurai','Tallakulam','Alagar Kovil Rd','Tree leaning on a power line','resolved',22,82,170,8,false,58,20,0,{caseId:'CP-MDU-24712',assignee:'JE Selvi Arumugam',prio:'P2',due:-2,confirms:11,needed:20}],
];

async function main() {
  if (!getApps().length) {
    const sa = loadServiceAccount();
    initializeApp(sa ? { credential: cert(sa) } : { projectId: 'trioz-319df' });
  }

  const db = getFirestore();
  const now = Date.now();
  const issues = ROWS.map((r) => build(r, now));

  console.log('Deleting existing issues...');
  const existing = await db.collection('issues').listDocuments();
  for (let i = 0; i < existing.length; i += 400) {
    const batch = db.batch();
    existing.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
  console.log(`  Deleted ${existing.length} existing issue(s).`);

  console.log(`Seeding ${issues.length} issues...`);
  const BATCH_SIZE = 5;
  for (let i = 0; i < issues.length; i += BATCH_SIZE) {
    const batch = db.batch();
    issues.slice(i, i + BATCH_SIZE).forEach((issue) => {
      batch.set(db.doc(`issues/${issue.id}`), issue);
    });
    await batch.commit();
    console.log(`  Written ${Math.min(i + BATCH_SIZE, issues.length)}/${issues.length}`);
  }

  await db.doc('counters/issue').set({ seq: 2113 });
  await db.doc('counters/case').set({ caseSeq: 24817 });
  await db.doc('users/demo-citizen').set({
    name: ME.name, area: ME.area, phone: ME.phone,
    verified: true, anonDefault: false, verifiedAt: now - 40 * D,
    actions: {
      support: { 'CP-2051': true, 'CP-2045': true, 'CP-2091': true, 'CP-2102': true, 'CP-2033': true, 'CP-2089': true },
      opposed: { 'CP-2112': true },
      contrib: { 'CP-2098': true, 'CP-2109': true },
      validated: {}, confirmed: {},
    },
  });

  console.log('Seed complete.');
}

main().catch((e) => { console.error(e); process.exit(1); });
