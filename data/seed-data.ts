import type { Issue } from '@/lib/firestore';

const H = 3600e3;
const D = 24 * H;

const CATS: Record<string, { l: string; icon: string; dept: string }> = {
  road: { l: 'Roads', icon: 'ph-road-horizon', dept: 'Roads & Bridges' },
  drain: { l: 'Drains', icon: 'ph-waves', dept: 'Storm Water Drains' },
  garbage: { l: 'Garbage', icon: 'ph-trash', dept: 'Solid Waste Mgmt' },
  light: { l: 'Streetlights', icon: 'ph-lightbulb', dept: 'Electrical' },
  water: { l: 'Water & sewage', icon: 'ph-drop', dept: 'Water & Sewerage' },
  tree: { l: 'Trees', icon: 'ph-tree', dept: 'Parks & Trees' },
  footpath: { l: 'Footpaths', icon: 'ph-person-simple-walk', dept: 'Roads & Bridges' },
};

const CITY: Record<string, { corp: string; code: string; water?: string; officers: string[] }> = {
  Chennai: { corp: 'Greater Chennai Corp.', code: 'CHN', water: 'Metrowater (CMWSSB)', officers: ['JE Priya Natarajan', 'JE Karthik Rajan', 'AE Farida Begum'] },
  Coimbatore: { corp: 'Coimbatore City Corp.', code: 'CBE', officers: ['JE Suresh Babu', 'JE Nithya Krishnan'] },
  Madurai: { corp: 'Madurai Corporation', code: 'MDU', officers: ['JE Muthu Pandian', 'JE Selvi Arumugam'] },
};

const STAGES = ['reported', 'community', 'review', 'verified', 'assigned', 'progress', 'resolved', 'closed'];

const USERS = ['Karthik S', 'Priya M', 'Arun K', 'Meena V', 'Senthil R', 'Lakshmi N', 'Farhan A', 'Revathi P', 'Vignesh B', 'Anitha J', 'Suresh T', 'Kavya R'];
const ME = { name: 'Divya Raghavan', short: 'DR', area: 'Velachery, Chennai', phone: '+91 98401 23456' };
const VERIFIER = 'AE R. Ganesan';
const SEVW: Record<string, number> = { critical: 40, high: 30, medium: 20, low: 10 };

function deptFor(cat: string, city: string): string {
  return cat === 'water' && CITY[city].water ? CITY[city].water! : CATS[cat].dept;
}

type Extra = {
  summary?: string;
  voice?: { lang: string; text: string; en: string };
  merged?: Array<{ by: string; h: number; text: string; sim: number }>;
  history?: string;
  caseId?: string;
  assignee?: string;
  prio?: string;
  due?: number;
  confirms?: number;
  needed?: number;
};

function build(r: [string, string, string, string, string, string, string, string, number, number, number, number, boolean, number, number, number, Extra], now: number): Issue {
  const [id, cat, sev, city, area, street, title, stage, sup, conf, hoursAgo, by, anon, x, y, km, ex] = r;
  const created = now - hoursAgo * H;
  const name = by === -1 ? ME.name : USERS[((by as number) % USERS.length)];

  const dept = deptFor(cat, city);
  const summary = ex.summary || `${CATS[cat].l === 'Streetlights' ? 'Streetlights out' : title} at ${street}, ${area}. AI rates it ${sev}; routed to ${dept}.`;
  const caseId = ex.caseId || null;
  const at = STAGES.indexOf(stage);
  const span = hoursAgo * H;
  const t = (f: number) => created + span * f;

  const events: Issue['events'] = [];
  const E = (f: number, etitle: string, sub: string, icon: string, kind: string, photo = '') =>
    events.push({ ts: t(f), title: etitle, sub, icon, kind, photo });

  E(0, `${anon ? 'Anonymous' : name} reported it`, '', 'ph-camera', 'citizen');
  if (at >= 1) E(0.15, `${Math.max(4, Math.round(sup * 0.6))} neighbours joined`, `${Math.min(6, 2 + Math.round(sup / 12))} photos · ${Math.round(sup * 0.7)} validations`, 'ph-users-three', 'community');
  if (at >= 2) E(0.3, `Community verified · ${Math.min(conf, 84)}%`, `Sent to ${CITY[city].corp}`, 'ph-shield-check', 'community');
  if (at >= 3) {
    E(0.4, `Verified by ${CITY[city].corp}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov');
    E(0.41, `Official case ${caseId}`, `${dept} · ${ex.prio || 'P1'}`, 'ph-bank', 'gov');
  }
  if (at >= 4) E(0.5, `Assigned to ${ex.assignee || CITY[city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
  if (at >= 5) E(0.65, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
  if (at >= 6) E(0.85, 'Marked fixed by department', 'Proof photo attached', 'ph-check', 'fix', 'after photo');
  if (at >= 7) E(0.97, 'Closed · confirmed by citizens', `${ex.confirms || 0} of ${ex.needed || 25} confirmed`, 'ph-seal-check', 'fix');

  const evidenceCount = Math.min(6, 2 + Math.round(sup / 12));
  const evidence = Array.from({ length: evidenceCount }, (_, k) => ({
    by: k === 0 ? (anon ? 'AN' : name.split(' ').map(s => s[0]).join('')) : USERS[(k * 3 + (by as number) + 12) % 12].split(' ').map(s => s[0]).join(''),
    ts: created + k * ((hoursAgo * H) / 7),
  }));

  return {
    id, cat, sev, city, area, street, title, stage, sup, conf, created, x, y, km, anon, mine: by === -1,
    by: anon ? 'Anonymous' : name, dept, summary, voice: ex.voice || null,
    merged: ex.merged || [], history: ex.history || '', caseId,
    assignee: ex.assignee || null, prio: ex.prio || null,
    due: ex.due != null ? now + ex.due : null,
    confirms: ex.confirms || 0, needed: ex.needed || 25,
    valYes: Math.round(sup * 0.7), valNo: Math.max(1, Math.round(sup * 0.05)),
    evidence, events, reject: null,
  };
}

export function buildSeedIssues(now: number): Issue[] {
  const ROWS: [string, string, string, string, string, string, string, string, number, number, number, number, boolean, number, number, number, Extra][] = [
    ['CP-2107', 'water', 'critical', 'Chennai', 'Velachery', '100 Feet Rd, near Vijayanagar bus stand', 'Sewage overflowing onto 100 Feet Road', 'community', 41, 76, 30, 0, false, 49, 46, 0.2, {
      summary: 'Sewage overflowing from a manhole across the carriageway near the bus stand. Health hazard; commuters wading through.',
      voice: { lang: 'Tamil', text: '"ரோட்டுல முழுசா சாக்கடை தண்ணி ஓடுது, ஸ்மெல் தாங்க முடியல"', en: 'Sewage is running all over the road, the smell is unbearable' },
      merged: [{ by: 'Anonymous', h: 22, text: '"Drainage overflow aagudhu, bike la poga mudiyala"', sim: 96 }, { by: 'Meena V', h: 9, text: 'Manhole leaking dirty water on main road', sim: 93 }, { by: 'Arun K', h: 4, text: 'Bus stop flooded with drain water', sim: 91 }],
      history: 'Same manhole desilted on 2 Jul 2026. Recurred in under 3 months — check the trunk sewer.',
    }],
    ['CP-2111', 'road', 'high', 'Chennai', 'Velachery', 'Taramani Link Rd, Phoenix signal', 'Deep pothole near the Phoenix signal', 'community', 28, 64, 20, 2, false, 60, 38, 0.9, { voice: { lang: 'Tanglish', text: '"Signal kitta periya pallam, night la theriyave illa"', en: "Big pit near the signal, you can't see it at night" } }],
    ['CP-2098', 'light', 'medium', 'Chennai', 'Velachery', 'Bharathi Nagar 3rd St', 'Four streetlights dark on Bharathi Nagar 3rd St', 'community', 9, 38, 6, -1, false, 34, 28, 0.6, {}],
    ['CP-2089', 'garbage', 'high', 'Chennai', 'Velachery', 'Velachery Main Rd, below MRTS', 'Garbage dumped below Velachery MRTS pillar', 'review', 63, 84, 52, 4, false, 56, 62, 1.1, { voice: { lang: 'Tanglish', text: '"Moonu naala garbage edukkala, naai ellam kizhikudhu"', en: 'Garbage not collected for three days, dogs are tearing it apart' } }],
    ['CP-2045', 'drain', 'critical', 'Chennai', 'Velachery', 'Vijayanagar 4th Main Rd', 'Open manhole without cover on a school route', 'resolved', 66, 91, 190, 5, false, 42, 56, 0.5, { caseId: 'CP-CHN-24790', assignee: 'JE Priya Natarajan', prio: 'P1', due: -1 * D, confirms: 18, needed: 25 }],
    ['CP-2112', 'road', 'low', 'Chennai', 'Velachery', 'Dhandeeswaram Nagar Main Rd', 'Speed breaker paint faded, bikes skidding', 'reported', 3, 22, 5, 6, false, 72, 30, 0.7, {}],
    ['CP-2109', 'water', 'medium', 'Chennai', 'Velachery', 'Ram Nagar North, 5th St', 'Low-pressure drinking water for a week', 'community', 19, 55, 40, -1, true, 30, 64, 0.8, { voice: { lang: 'Tamil', text: '"ஒரு வாரமா தண்ணி சரியா வரல"', en: "Water hasn't come properly for a week" } }],
    ['CP-2091', 'footpath', 'medium', 'Chennai', 'Velachery', 'Velachery Bypass Rd', 'Encroached footpath, walkers forced onto road', 'community', 17, 44, 70, 7, false, 78, 52, 1.2, {}],
    ['CP-2106', 'drain', 'high', 'Chennai', 'Madipakkam', 'Madipakkam Main Rd junction', 'Rainwater stagnating at Madipakkam junction', 'community', 33, 71, 28, 8, false, 62, 76, 2.2, {}],
    ['CP-2064', 'drain', 'high', 'Chennai', 'Pallikaranai', '200 Feet Rd, marsh edge', 'Storm drain choked with plastic', 'verified', 52, 88, 120, 9, false, 82, 72, 3.4, { caseId: 'CP-CHN-24802', assignee: 'AE Farida Begum', prio: 'P1', due: 3 * D }],
    ['CP-2051', 'road', 'medium', 'Chennai', 'Adyar', 'LB Road, near Adyar depot', 'Road cut left unpatched after Metrowater work', 'progress', 47, 86, 260, 10, false, 22, 22, 4.2, { caseId: 'CP-CHN-24755', assignee: 'JE Karthik Rajan', prio: 'P2', due: 1 * D }],
    ['CP-2033', 'tree', 'medium', 'Chennai', 'Adyar', 'Gandhi Nagar 2nd Main Rd', 'Fallen gulmohar branch blocking footpath', 'closed', 31, 83, 400, 11, false, 14, 40, 4.6, { caseId: 'CP-CHN-24711', assignee: 'JE Karthik Rajan', prio: 'P2', due: -6 * D, confirms: 25, needed: 25 }],
    ['CP-2102', 'footpath', 'medium', 'Chennai', 'T. Nagar', 'Pondy Bazaar pedestrian plaza', 'Broken footpath tiles, tripping hazard', 'community', 22, 58, 33, 1, false, 10, 14, 8.1, {}],
    ['CP-2095', 'water', 'high', 'Chennai', 'Mylapore', 'Kutchery Rd, near the temple tank', 'Metrowater pipe leaking for 3 days', 'review', 58, 86, 60, 3, false, 26, 12, 9.0, { voice: { lang: 'Tanglish', text: '"Moonu naala pipe leak, thanni waste aagudhu"', en: 'Pipe leaking for three days, water is being wasted' } }],
    ['CP-2080', 'garbage', 'medium', 'Chennai', 'Anna Nagar', '2nd Avenue, near Tower Park', 'Overflowing bins near Tower Park', 'progress', 39, 84, 150, 2, false, 20, 8, 14, { caseId: 'CP-CHN-24766', assignee: 'AE Farida Begum', prio: 'P2', due: -1 * D }],
    ['CP-2071', 'light', 'high', 'Chennai', 'Chromepet', 'GST Rd service lane', 'Service lane completely dark after 7 PM', 'review', 44, 82, 44, 5, false, 40, 88, 11, { voice: { lang: 'Tanglish', text: '"Street full-a dark, ladies nadakka bayapadranga"', en: 'Street is fully dark, women are afraid to walk' } }],
    ['CP-2076', 'road', 'high', 'Chennai', 'Guindy', 'Kathipara junction underpass', 'Waterlogging and potholes under Kathipara underpass', 'assigned', 71, 90, 110, 6, false, 16, 30, 5.1, { caseId: 'CP-CHN-24781', assignee: 'JE Karthik Rajan', prio: 'P1', due: -2 * D }],
    ['CP-2040', 'garbage', 'low', 'Chennai', "Besant Nagar", "Elliot's Beach front", "Broken bins along Elliot's Beach", 'closed', 24, 81, 500, 7, false, 30, 20, 6.5, { caseId: 'CP-CHN-24690', assignee: 'AE Farida Begum', prio: 'P3', due: -10 * D, confirms: 20, needed: 20 }],
    ['CP-2085', 'light', 'critical', 'Chennai', 'Saidapet', 'Jones Rd junction box', 'Exposed live wire at junction box, Jones Road', 'review', 37, 90, 3, 9, false, 12, 34, 6.0, {}],
    ['CP-2060', 'drain', 'high', 'Chennai', 'Perungudi', 'OMR, near Perungudi toll', 'Storm drain work left open without barricade', 'progress', 45, 85, 96, 10, false, 70, 82, 3.0, { caseId: 'CP-CHN-24770', assignee: 'AE Farida Begum', prio: 'P1', due: 0.5 * D }],
    ['CP-2104', 'water', 'high', 'Chennai', 'Tambaram', 'Mudichur Rd', 'Sewage mixing with stormwater canal', 'review', 36, 81, 26, 0, false, 56, 90, 9.8, {}],
    ['CP-3021', 'road', 'high', 'Coimbatore', 'RS Puram', 'DB Road, near head post office', 'Potholes along DB Road', 'review', 49, 83, 36, 1, false, 40, 40, 0, {}],
    ['CP-3017', 'garbage', 'medium', 'Coimbatore', 'Gandhipuram', 'Cross Cut Rd, behind bus stand', 'Garbage piling behind Gandhipuram bus stand', 'progress', 57, 88, 130, 2, false, 56, 30, 0, { caseId: 'CP-CBE-24744', assignee: 'JE Suresh Babu', prio: 'P2', due: 2 * D }],
    ['CP-3009', 'light', 'low', 'Coimbatore', 'Peelamedu', 'Avinashi Rd service lane', 'Streetlights flickering on Avinashi Rd service lane', 'community', 14, 48, 18, 3, false, 72, 46, 0, {}],
    ['CP-3004', 'water', 'high', 'Coimbatore', 'Singanallur', 'Trichy Rd', 'Drinking water mixed with sewage', 'verified', 38, 87, 80, 4, false, 78, 66, 0, { caseId: 'CP-CBE-24799', assignee: 'JE Nithya Krishnan', prio: 'P1', due: 4 * D }],
    ['CP-4012', 'road', 'high', 'Madurai', 'Goripalayam', 'Goripalayam junction', 'Crater-size pothole at Goripalayam junction', 'review', 61, 88, 30, 5, false, 46, 40, 0, { voice: { lang: 'Tamil', text: '"ஜங்ஷன்ல பெரிய குழி, பஸ் கூட ஆடுது"', en: 'Huge pit at the junction, even buses shake' } }],
    ['CP-4008', 'drain', 'medium', 'Madurai', 'Anna Nagar', '80 Feet Rd bus stop', 'Drain overflow near Anna Nagar bus stop', 'community', 26, 66, 22, 6, false, 64, 56, 0, {}],
    ['CP-4003', 'garbage', 'high', 'Madurai', 'Simmakkal', 'Vaigai riverbank', 'Waste dumped on the Vaigai riverbank', 'assigned', 44, 86, 100, 7, false, 34, 30, 0, { caseId: 'CP-MDU-24760', assignee: 'JE Muthu Pandian', prio: 'P1', due: -1 * D }],
    ['CP-4001', 'tree', 'low', 'Madurai', 'Tallakulam', 'Alagar Kovil Rd', 'Tree leaning on a power line', 'resolved', 22, 82, 170, 8, false, 58, 20, 0, { caseId: 'CP-MDU-24712', assignee: 'JE Selvi Arumugam', prio: 'P2', due: -2 * D, confirms: 11, needed: 20 }],
  ];

  return ROWS.map(r => build(r as Parameters<typeof build>[0], now));
}

export const SEED_SEQ = 2113;
export const SEED_CASE_SEQ = 24817;
