/* CivicPulse — Firebase client
   ES module. Loaded with <script type="module">.
   Uses Firebase Auth (email/password) + Firestore (real-time onSnapshot).
   Exposes window.CP with the same API surface as civicpulse-data.js. */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js';
import {
  getFirestore, collection, query, orderBy, onSnapshot,
  doc, getDoc, setDoc, writeBatch, getDocs, deleteDoc,
} from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

// ── Firebase init ─────────────────────────────────────────────────────────────
const FBC = {
  apiKey: 'AIzaSyBDoU8OWUHUXgLdgfORQnXM78vaNL-phnw',
  authDomain: 'trioz-319df.firebaseapp.com',
  projectId: 'trioz-319df',
  storageBucket: 'trioz-319df.firebasestorage.app',
  messagingSenderId: '452203492219',
  appId: '1:452203492219:web:b388215df13d09287e83de',
};

const app = initializeApp(FBC, 'civicpulse');
const auth = getAuth(app);
const db = getFirestore(app);

// ── Constants (mirror civicpulse-data.js) ─────────────────────────────────────
const H = 3600e3, D = 24 * H;
const CATS = {
  road:     { l: 'Roads',          icon: 'ph-road-horizon',         dept: 'Roads & Bridges'   },
  drain:    { l: 'Drains',         icon: 'ph-waves',                dept: 'Storm Water Drains' },
  garbage:  { l: 'Garbage',        icon: 'ph-trash',                dept: 'Solid Waste Mgmt'  },
  light:    { l: 'Streetlights',   icon: 'ph-lightbulb',            dept: 'Electrical'        },
  water:    { l: 'Water & sewage', icon: 'ph-drop',                 dept: 'Water & Sewerage'  },
  tree:     { l: 'Trees',          icon: 'ph-tree',                 dept: 'Parks & Trees'     },
  footpath: { l: 'Footpaths',      icon: 'ph-person-simple-walk',   dept: 'Roads & Bridges'   },
};
const CITY = {
  Chennai:    { corp: 'Greater Chennai Corp.',    code: 'CHN', water: 'Metrowater (CMWSSB)', officers: ['JE Priya Natarajan','JE Karthik Rajan','AE Farida Begum'] },
  Coimbatore: { corp: 'Coimbatore City Corp.',   code: 'CBE', officers: ['JE Suresh Babu','JE Nithya Krishnan'] },
  Madurai:    { corp: 'Madurai Corporation',     code: 'MDU', officers: ['JE Muthu Pandian','JE Selvi Arumugam'] },
};
const STAGES = {
  reported:  { l: 'New',              step: 0 },
  community: { l: 'Gathering support',step: 1 },
  review:    { l: 'With govt',        step: 1 },
  verified:  { l: 'Official case',    step: 2 },
  assigned:  { l: 'Assigned',         step: 2 },
  progress:  { l: 'In progress',      step: 3 },
  resolved:  { l: 'Fixed · confirm',  step: 4 },
  closed:    { l: 'Closed',           step: 4 },
  rejected:  { l: 'Rejected',         step: 0 },
};
const SEVW  = { critical: 40, high: 30, medium: 20, low: 10 };
const ORDER = ['reported','community','review','verified','assigned','progress','resolved','closed'];
const ME       = { name: 'Divya Raghavan', short: 'DR', area: 'Velachery, Chennai', phone: '+91 98401 23456' };
const VERIFIER = 'AE R. Ganesan';
const SCENES = {
  sewage:  { cat:'water',   sev:'critical', label:'Sewage overflow',    p:95, title:'Sewage overflowing onto the road',   size:'~15 m stretch',    risk:'Health hazard · bus stop 30 m',    street:'100 Feet Rd, Vijayanagar',  x:48, y:47, voice:{lang:'Tanglish', text:'"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"',      en:'Drainage overflowing near the bus stand, it has been like this for days'} },
  pothole: { cat:'road',    sev:'high',     label:'Pothole',            p:96, title:'Deep pothole on the carriageway',    size:'~1.1 × 0.7 m',     risk:'Two-wheeler route · signal 40 m',  street:'Taramani Link Rd',          x:58, y:40, voice:{lang:'Tamil',    text:'"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"',                                   en:'Very big pit, bikes fall at night'} },
  garbage: { cat:'garbage', sev:'high',     label:'Garbage dump',       p:93, title:'Uncollected garbage heap',           size:'~3 m² heap',        risk:'Near market · stray dogs',         street:'Velachery Main Rd',         x:41, y:66, voice:{lang:'Tanglish', text:'"Three days-a garbage edukkala, smell romba jaasthi"',                            en:'Garbage not collected for three days, the smell is terrible'} },
  light:   { cat:'light',   sev:'medium',   label:'Streetlight out',    p:91, title:'Streetlights not working',           size:'3 poles dark',      risk:'Women walk here after work',       street:'Balaji Nagar 2nd St',       x:74, y:70, voice:{lang:'Tanglish', text:'"Street full-a dark, ladies nadakka bayapadranga"',                             en:'The street is fully dark, women are afraid to walk'} },
};

// ── State ──────────────────────────────────────────────────────────────────────
let S = null;
let currentUser = null;
const subs = new Set();

// ── Auth overlay ──────────────────────────────────────────────────────────────
const isGov = window.location.pathname.includes('government');

function renderLoginOverlay() {
  if (document.getElementById('cp-auth')) return;
  const el = document.createElement('div');
  el.id = 'cp-auth';
  el.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;display:flex;align-items:center;justify-content:center;font-family:Geist,Inter,sans-serif';
  el.innerHTML = `
    <div style="width:320px;padding:32px 24px;text-align:center">
      <div style="font:800 24px/1 'Bricolage Grotesque',sans-serif;letter-spacing:-.02em;color:#111">civicpulse</div>
      <div style="font:500 11px/1 'Geist Mono',monospace;color:#9ca3af;letter-spacing:.08em;margin-top:5px;text-transform:uppercase">${isGov ? 'GOV · TAMIL NADU' : 'CITIZEN · TAMIL NADU'}</div>
      <div style="height:1px;background:#f3f4f6;margin:24px 0"></div>
      <div style="font:600 16px/1.3 Geist,sans-serif;color:#111;margin-bottom:18px">${isGov ? 'Government Sign In' : 'Sign in'}</div>
      <input id="cp-email" type="email" autocomplete="email" placeholder="Email address"
        style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font:400 14px/1 Geist,sans-serif;color:#111;box-sizing:border-box;outline:none;margin-bottom:9px">
      <input id="cp-pass" type="password" autocomplete="current-password" placeholder="Password"
        style="width:100%;padding:11px 14px;border:1.5px solid #e5e7eb;border-radius:10px;font:400 14px/1 Geist,sans-serif;color:#111;box-sizing:border-box;outline:none;margin-bottom:14px">
      <div id="cp-err" style="font:400 12px Geist,sans-serif;color:oklch(0.58 0.2 32);min-height:14px;margin-bottom:10px"></div>
      <button id="cp-login"
        style="width:100%;padding:13px;border:none;border-radius:10px;background:oklch(0.58 0.2 32);color:#fff;cursor:pointer;font:600 14px Geist,sans-serif;letter-spacing:-.01em">
        Sign in
      </button>
      <div style="font:400 11px Geist,sans-serif;color:#d1d5db;margin-top:18px;line-height:1.5">
        Demo · ${isGov ? 'gov' : 'citizen'}@civicpulse.in<br>civicpulse2026
      </div>
    </div>`;
  document.body.appendChild(el);

  const emailEl = el.querySelector('#cp-email');
  const passEl  = el.querySelector('#cp-pass');
  const errEl   = el.querySelector('#cp-err');
  const btn     = el.querySelector('#cp-login');

  async function login() {
    const email = emailEl.value.trim();
    const pass  = passEl.value;
    if (!email || !pass) { errEl.textContent = 'Enter email and password.'; return; }
    btn.textContent = 'Signing in…';
    btn.disabled = true;
    errEl.textContent = '';
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      errEl.textContent = e.message.replace('Firebase: ','').replace(/ \(auth\/.*?\)\.?/,'');
      btn.textContent = 'Sign in';
      btn.disabled = false;
    }
  }

  btn.addEventListener('click', login);
  passEl.addEventListener('keydown', e => { if (e.key === 'Enter') login(); });
}

// ── Firestore helpers ─────────────────────────────────────────────────────────
let unsubIssues = null;

async function initState() {
  const uid = currentUser.uid;
  const [metaSnap, userSnap] = await Promise.all([
    getDoc(doc(db, 'meta', 'state')),
    getDoc(doc(db, 'users', uid)),
  ]);
  const meta  = metaSnap.exists()  ? metaSnap.data()  : { seq: 2113, caseSeq: 24817 };
  const udata = userSnap.exists()  ? userSnap.data()  : { my: { support:{}, validated:{}, confirmed:{} }, me:{ verified:false, anonDefault:false } };

  S = { v: 2, issues: [], my: udata.my, me: udata.me, seq: meta.seq, caseSeq: meta.caseSeq };

  if (unsubIssues) unsubIssues();
  unsubIssues = onSnapshot(
    query(collection(db, 'issues'), orderBy('created', 'desc')),
    snap => {
      if (!S) return;
      S.issues = snap.docs.map(d => d.data());
      subs.forEach(f => f(S));
    },
    err => console.warn('CivicPulse: Firestore listener error', err),
  );
}

function persist(issue) {
  if (issue) setDoc(doc(db, 'issues', issue.id), issue).catch(console.warn);
}

function persistUser() {
  if (!currentUser || !S) return;
  setDoc(doc(db, 'users', currentUser.uid), { my: S.my, me: S.me }, { merge: true }).catch(console.warn);
}

function persistMeta() {
  if (!S) return;
  setDoc(doc(db, 'meta', 'state'), { seq: S.seq, caseSeq: S.caseSeq }, { merge: true }).catch(console.warn);
}

function notify(issue, userChanged) {
  subs.forEach(f => f(S));
  if (issue) persist(issue);
  if (userChanged) persistUser();
}

// ── Auth state ────────────────────────────────────────────────────────────────
onAuthStateChanged(auth, async user => {
  if (user) {
    currentUser = user;
    document.getElementById('cp-auth')?.remove();
    await initState();
  } else {
    currentUser = null;
    S = null;
    if (unsubIssues) { unsubIssues(); unsubIssues = null; }
    renderLoginOverlay();
  }
});

// ── Local helpers ─────────────────────────────────────────────────────────────
const find    = id => S && S.issues.find(x => x.id === id);
const corp    = i  => CITY[i.city].corp;
const ev      = (i, title, sub, icon, kind, photo) => i.events.push({ ts: Date.now(), title, sub: sub||'', icon, kind, photo: photo||'' });
const initials = () => (S && S.me.anonDefault ? 'AN' : ME.short);

function bump(i, n) {
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

// ── Mock analyze ──────────────────────────────────────────────────────────────
function analyze(scene) {
  const sc = SCENES[scene];
  if (!sc || !S) return { ...(sc||{}), scene, matches: [], strong: null };
  const dept = sc.cat === 'water' ? CITY.Chennai.water : CATS[sc.cat].dept;
  const matches = S.issues
    .filter(i => i.city === 'Chennai' && i.cat === sc.cat && !['closed','rejected'].includes(i.stage) && i.km < 3)
    .map(i => {
      const m = Math.hypot(i.x - sc.x, i.y - sc.y) * 30;
      return { id: i.id, title: i.title, dist: Math.round(m), score: Math.max(0, Math.round(98 - m/20)), sup: i.sup, by: i.by, h: Math.round((Date.now() - i.created) / H), stage: i.stage };
    })
    .filter(m => m.dist < 700)
    .sort((a, b) => b.score - a.score);
  return { ...sc, scene, dept, corp: CITY.Chennai.corp, catLabel: CATS[sc.cat].l, icon: CATS[sc.cat].icon,
    summary: `${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`, matches,
    strong: matches[0] && matches[0].score >= 85 ? matches[0] : null };
}

// ── Seed data ─────────────────────────────────────────────────────────────────
const USERS = ['Karthik S','Priya M','Arun K','Meena V','Senthil R','Lakshmi N','Farhan A','Revathi P','Vignesh B','Anitha J','Suresh T','Kavya R'];
const STAGE_ORDER = ['reported','community','review','verified','assigned','progress','resolved','closed'];

function buildIssue(r, now) {
  const [id,cat,sev,city,area,street,title,stage,sup,conf,h,by,anon,x,y,km,ex] = r;
  const created = now - h*H;
  const name = by === -1 ? ME.name : USERS[by % USERS.length];
  const dept = (cat === 'water' && CITY[city].water) ? CITY[city].water : CATS[cat].dept;
  const summary = ex.summary || `${CATS[cat].l === 'Streetlights' ? 'Streetlights out' : title} at ${street}, ${area}. AI rates it ${sev}; routed to ${dept}.`;
  const at = STAGE_ORDER.indexOf(stage), span = h*H;
  const t  = f => created + span*f;
  const events = [];
  const E = (f, etitle, sub, icon, kind, photo='') => events.push({ ts:t(f), title:etitle, sub, icon, kind, photo });
  E(0, `${anon ? 'Anonymous' : name} reported it`, '', 'ph-camera', 'citizen');
  if (at>=1) E(.15, `${Math.max(4,Math.round(sup*.6))} neighbours joined`, `${Math.min(6,2+Math.round(sup/12))} photos · ${Math.round(sup*.7)} validations`, 'ph-users-three', 'community');
  if (at>=2) E(.3,  `Community verified · ${Math.min(conf,84)}%`, `Sent to ${CITY[city].corp}`, 'ph-shield-check', 'community');
  if (at>=3) { E(.4, `Verified by ${CITY[city].corp}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov'); E(.41, `Official case ${ex.caseId||''}`, `${dept} · ${ex.prio||'P1'}`, 'ph-bank', 'gov'); }
  if (at>=4) E(.5,  `Assigned to ${ex.assignee||CITY[city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
  if (at>=5) E(.65, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
  if (at>=6) E(.85, 'Marked fixed by department', 'Proof photo attached', 'ph-check', 'fix', 'after photo');
  if (at>=7) E(.97, 'Closed · confirmed by citizens', `${ex.confirms||0} of ${ex.needed||25} confirmed`, 'ph-seal-check', 'fix');
  const ec = Math.min(6, 2+Math.round(sup/12));
  const evidence = Array.from({length:ec}, (_,k) => ({ by: k===0 ? (anon?'AN':name.split(' ').map(s=>s[0]).join('')) : USERS[(k*3+by+12)%12].split(' ').map(s=>s[0]).join(''), ts: created+k*((h*H)/7) }));
  return { id,cat,sev,city,area,street,title,stage,sup,conf,created,x,y,km,anon,mine:by===-1,
    by:anon?'Anonymous':name, dept,summary, voice:ex.voice||null, merged:ex.merged||[], history:ex.history||'',
    caseId:ex.caseId||null, assignee:ex.assignee||null, prio:ex.prio||null,
    due:ex.due!=null?now+ex.due:null, confirms:ex.confirms||0, needed:ex.needed||25,
    valYes:Math.round(sup*.7), valNo:Math.max(1,Math.round(sup*.05)), evidence, events, reject:null };
}

const SEED_ROWS = [
  ['CP-2107','water','critical','Chennai','Velachery','100 Feet Rd, near Vijayanagar bus stand','Sewage overflowing onto 100 Feet Road','community',41,76,30,0,false,49,46,0.2,{summary:'Sewage overflowing from a manhole across the carriageway near the bus stand. Health hazard; commuters wading through.',voice:{lang:'Tamil',text:'"ரோட்டுல முழுசா சாக்கடை தண்ணி ஓடுது, ஸ்மெல் தாங்க முடியல"',en:'Sewage is running all over the road, the smell is unbearable'},merged:[{by:'Anonymous',h:22,text:'"Drainage overflow aagudhu, bike la poga mudiyala"',sim:96},{by:'Meena V',h:9,text:'Manhole leaking dirty water on main road',sim:93},{by:'Arun K',h:4,text:'Bus stop flooded with drain water',sim:91}],history:'Same manhole desilted on 2 Jul 2026. Recurred in under 3 months — check the trunk sewer.'}],
  ['CP-2111','road','high','Chennai','Velachery','Taramani Link Rd, Phoenix signal','Deep pothole near the Phoenix signal','community',28,64,20,2,false,60,38,0.9,{voice:{lang:'Tanglish',text:'"Signal kitta periya pallam, night la theriyave illa"',en:"Big pit near the signal, you can't see it at night"}}],
  ['CP-2098','light','medium','Chennai','Velachery','Bharathi Nagar 3rd St','Four streetlights dark on Bharathi Nagar 3rd St','community',9,38,6,-1,false,34,28,0.6,{}],
  ['CP-2089','garbage','high','Chennai','Velachery','Velachery Main Rd, below MRTS','Garbage dumped below Velachery MRTS pillar','review',63,84,52,4,false,56,62,1.1,{voice:{lang:'Tanglish',text:'"Moonu naala garbage edukkala, naai ellam kizhikudhu"',en:'Garbage not collected for three days, dogs are tearing it apart'}}],
  ['CP-2045','drain','critical','Chennai','Velachery','Vijayanagar 4th Main Rd','Open manhole without cover on a school route','resolved',66,91,190,5,false,42,56,0.5,{caseId:'CP-CHN-24790',assignee:'JE Priya Natarajan',prio:'P1',due:-1*D,confirms:18,needed:25}],
  ['CP-2112','road','low','Chennai','Velachery','Dhandeeswaram Nagar Main Rd','Speed breaker paint faded, bikes skidding','reported',3,22,5,6,false,72,30,0.7,{}],
  ['CP-2109','water','medium','Chennai','Velachery','Ram Nagar North, 5th St','Low-pressure drinking water for a week','community',19,55,40,-1,true,30,64,0.8,{voice:{lang:'Tamil',text:'"ஒரு வாரமா தண்ணி சரியா வரல"',en:"Water hasn't come properly for a week"}}],
  ['CP-2091','footpath','medium','Chennai','Velachery','Velachery Bypass Rd','Encroached footpath, walkers forced onto road','community',17,44,70,7,false,78,52,1.2,{}],
  ['CP-2106','drain','high','Chennai','Madipakkam','Madipakkam Main Rd junction','Rainwater stagnating at Madipakkam junction','community',33,71,28,8,false,62,76,2.2,{}],
  ['CP-2064','drain','high','Chennai','Pallikaranai','200 Feet Rd, marsh edge','Storm drain choked with plastic','verified',52,88,120,9,false,82,72,3.4,{caseId:'CP-CHN-24802',assignee:'AE Farida Begum',prio:'P1',due:3*D}],
  ['CP-2051','road','medium','Chennai','Adyar','LB Road, near Adyar depot','Road cut left unpatched after Metrowater work','progress',47,86,260,10,false,22,22,4.2,{caseId:'CP-CHN-24755',assignee:'JE Karthik Rajan',prio:'P2',due:1*D}],
  ['CP-2033','tree','medium','Chennai','Adyar','Gandhi Nagar 2nd Main Rd','Fallen gulmohar branch blocking footpath','closed',31,83,400,11,false,14,40,4.6,{caseId:'CP-CHN-24711',assignee:'JE Karthik Rajan',prio:'P2',due:-6*D,confirms:25,needed:25}],
  ['CP-2102','footpath','medium','Chennai','T. Nagar','Pondy Bazaar pedestrian plaza','Broken footpath tiles, tripping hazard','community',22,58,33,1,false,10,14,8.1,{}],
  ['CP-2095','water','high','Chennai','Mylapore','Kutchery Rd, near the temple tank','Metrowater pipe leaking for 3 days','review',58,86,60,3,false,26,12,9.0,{voice:{lang:'Tanglish',text:'"Moonu naala pipe leak, thanni waste aagudhu"',en:'Pipe leaking for three days, water is being wasted'}}],
  ['CP-2080','garbage','medium','Chennai','Anna Nagar','2nd Avenue, near Tower Park','Overflowing bins near Tower Park','progress',39,84,150,2,false,20,8,14,{caseId:'CP-CHN-24766',assignee:'AE Farida Begum',prio:'P2',due:-1*D}],
  ['CP-2071','light','high','Chennai','Chromepet','GST Rd service lane','Service lane completely dark after 7 PM','review',44,82,44,5,false,40,88,11,{voice:{lang:'Tanglish',text:'"Street full-a dark, ladies nadakka bayapadranga"',en:'Street is fully dark, women are afraid to walk'}}],
  ['CP-2076','road','high','Chennai','Guindy','Kathipara junction underpass','Waterlogging and potholes under Kathipara underpass','assigned',71,90,110,6,false,16,30,5.1,{caseId:'CP-CHN-24781',assignee:'JE Karthik Rajan',prio:'P1',due:-2*D}],
  ['CP-2040','garbage','low','Chennai','Besant Nagar',"Elliot's Beach front","Broken bins along Elliot's Beach",'closed',24,81,500,7,false,30,20,6.5,{caseId:'CP-CHN-24690',assignee:'AE Farida Begum',prio:'P3',due:-10*D,confirms:20,needed:20}],
  ['CP-2085','light','critical','Chennai','Saidapet','Jones Rd junction box','Exposed live wire at junction box, Jones Road','review',37,90,3,9,false,12,34,6.0,{}],
  ['CP-2060','drain','high','Chennai','Perungudi','OMR, near Perungudi toll','Storm drain work left open without barricade','progress',45,85,96,10,false,70,82,3.0,{caseId:'CP-CHN-24770',assignee:'AE Farida Begum',prio:'P1',due:0.5*D}],
  ['CP-2104','water','high','Chennai','Tambaram','Mudichur Rd','Sewage mixing with stormwater canal','review',36,81,26,0,false,56,90,9.8,{}],
  ['CP-3021','road','high','Coimbatore','RS Puram','DB Road, near head post office','Potholes along DB Road','review',49,83,36,1,false,40,40,0,{}],
  ['CP-3017','garbage','medium','Coimbatore','Gandhipuram','Cross Cut Rd, behind bus stand','Garbage piling behind Gandhipuram bus stand','progress',57,88,130,2,false,56,30,0,{caseId:'CP-CBE-24744',assignee:'JE Suresh Babu',prio:'P2',due:2*D}],
  ['CP-3009','light','low','Coimbatore','Peelamedu','Avinashi Rd service lane','Streetlights flickering on Avinashi Rd service lane','community',14,48,18,3,false,72,46,0,{}],
  ['CP-3004','water','high','Coimbatore','Singanallur','Trichy Rd','Drinking water mixed with sewage','verified',38,87,80,4,false,78,66,0,{caseId:'CP-CBE-24799',assignee:'JE Nithya Krishnan',prio:'P1',due:4*D}],
  ['CP-4012','road','high','Madurai','Goripalayam','Goripalayam junction','Crater-size pothole at Goripalayam junction','review',61,88,30,5,false,46,40,0,{voice:{lang:'Tamil',text:'"ஜங்ஷன்ல பெரிய குழி, பஸ் கூட ஆடுது"',en:'Huge pit at the junction, even buses shake'}}],
  ['CP-4008','drain','medium','Madurai','Anna Nagar','80 Feet Rd bus stop','Drain overflow near Anna Nagar bus stop','community',26,66,22,6,false,64,56,0,{}],
  ['CP-4003','garbage','high','Madurai','Simmakkal','Vaigai riverbank','Waste dumped on the Vaigai riverbank','assigned',44,86,100,7,false,34,30,0,{caseId:'CP-MDU-24760',assignee:'JE Muthu Pandian',prio:'P1',due:-1*D}],
  ['CP-4001','tree','low','Madurai','Tallakulam','Alagar Kovil Rd','Tree leaning on a power line','resolved',22,82,170,8,false,58,20,0,{caseId:'CP-MDU-24712',assignee:'JE Selvi Arumugam',prio:'P2',due:-2*D,confirms:11,needed:20}],
];

function buildSeedIssues(now) { return SEED_ROWS.map(r => buildIssue(r, now)); }

const SEED_MY = { support:{'CP-2051':true,'CP-2045':true,'CP-2091':true,'CP-2102':true,'CP-2033':true,'CP-2089':true}, validated:{}, confirmed:{} };

async function seedFirestore(now) {
  const issues = buildSeedIssues(now);

  // Delete all existing issues first
  const snap = await getDocs(collection(db, 'issues'));
  const toDelete = snap.docs.map(d => d.ref);
  for (let i = 0; i < toDelete.length; i += 400) {
    const batch = writeBatch(db);
    toDelete.slice(i, i+400).forEach(ref => batch.delete(ref));
    await batch.commit();
  }

  // Write seed issues + meta
  for (let i = 0; i < issues.length; i += 400) {
    const batch = writeBatch(db);
    issues.slice(i, i+400).forEach(issue => batch.set(doc(db, 'issues', issue.id), issue));
    if (i === 0) {
      batch.set(doc(db, 'meta', 'state'), { seq: 2113, caseSeq: 24817 });
      if (currentUser) batch.set(doc(db, 'users', currentUser.uid), { my: SEED_MY, me:{ verified:false, anonDefault:false } });
    }
    await batch.commit();
  }

  return issues;
}

// ── Actions ────────────────────────────────────────────────────────────────────
const A = {
  support(id) {
    if (!S || S.my.support[id]) return {};
    const i = find(id); if (!i) return {};
    S.my.support[id] = true; i.sup++;
    const crossed = bump(i, 2);
    notify(i, true); return { crossed };
  },
  unsupport(id) {
    if (!S) return; const i = find(id); if (!i || !S.my.support[id] || i.mine) return;
    delete S.my.support[id]; i.sup--;
    notify(i, true);
  },
  evidence(id) {
    if (!S) return {}; const i = find(id); if (!i) return {};
    let crossed = false;
    if (!S.my.support[id]) { S.my.support[id]=true; i.sup++; crossed=bump(i,2); }
    i.evidence.push({ by: initials(), ts: Date.now() });
    crossed = bump(i, 2) || crossed;
    ev(i, 'New photo evidence', S.me.anonDefault?'From Anonymous':`From ${ME.name}`, 'ph-image', 'citizen');
    notify(i, true); return { crossed };
  },
  validate(id, yes) {
    if (!S || S.my.validated[id]) return {}; const i = find(id); if (!i) return {};
    S.my.validated[id] = yes ? 1 : -1;
    let crossed = false;
    if (yes) { i.valYes++; crossed = bump(i,1); } else { i.valNo++; i.conf=Math.max(5,i.conf-3); }
    notify(i, true); return { crossed, conf: i.conf };
  },
  report({ scene, anon, joinId }) {
    if (!S) return {}; const a = analyze(scene); const who = anon?'Anonymous':ME.name;
    if (joinId) {
      const i = find(joinId); if (!i) return {};
      i.merged.push({ by:who, h:0, text:a.voice?a.voice.text:a.summary, sim:(a.matches.find(m=>m.id===joinId)||{}).score||90, me:true });
      let crossed = false;
      if (!S.my.support[joinId]) { S.my.support[joinId]=true; i.sup++; crossed=bump(i,2); }
      i.evidence.push({ by:anon?'AN':ME.short, ts:Date.now() });
      crossed = bump(i,2)||crossed;
      ev(i, `${who} joined with a photo`, 'AI merged a duplicate report', 'ph-intersect', 'citizen');
      notify(i, true); return { id:joinId, crossed };
    }
    const id = 'CP-'+(S.seq++); const now = Date.now();
    const newIssue = {
      id, cat:a.cat, sev:a.sev, city:'Chennai', area:'Velachery', street:a.street,
      title:a.title, stage:'reported', sup:1, conf:24, created:now, x:a.x, y:a.y,
      km:0.1, anon:!!anon, mine:true, by:who, dept:a.dept, summary:a.summary,
      voice:a.voice||null, merged:[], history:'', caseId:null, assignee:null, prio:null, due:null,
      confirms:0, needed:25, valYes:0, valNo:0,
      evidence:[{ by:anon?'AN':ME.short, ts:now }],
      events:[{ ts:now, title:`${anon?'Anonymous':'You'} reported it`, sub:`AI: ${a.label} · ${a.sev}`, icon:'ph-camera', kind:'citizen', photo:'' }],
      reject:null,
    };
    S.issues.unshift(newIssue); S.my.support[id]=true;
    notify(newIssue, true); persistMeta(); return { id, crossed:false };
  },
  verify(id, { assignee, prio }) {
    if (!S) return null; const i = find(id); if (!i) return null;
    const days = {P1:5,P2:10,P3:21}[prio]||5;
    i.caseId = `CP-${CITY[i.city].code}-${S.caseSeq++}`;
    i.prio=prio; i.assignee=assignee; i.due=Date.now()+days*D; i.stage='assigned';
    ev(i,`Verified by ${corp(i)}`,`Inspected by ${VERIFIER}`,'ph-seal-check','gov');
    ev(i,`Official case ${i.caseId}`,`${i.dept} · ${days}-day SLA`,'ph-bank','gov');
    ev(i,`Assigned to ${assignee}`,'','ph-user-circle-check','gov');
    notify(i, false); persistMeta(); return i.caseId;
  },
  reject(id, reason) {
    if (!S) return; const i = find(id); if (!i) return;
    i.stage='rejected'; i.reject=reason;
    ev(i,'Not accepted by '+corp(i),`Reason: ${reason}`,'ph-x-circle','gov');
    notify(i, false);
  },
  inspect(id) {
    if (!S) return; const i = find(id); if (!i) return;
    ev(i,'Field inspection scheduled','Within 24 hours','ph-binoculars','gov');
    notify(i, false);
  },
  note(id, title, sub) {
    if (!S) return; const i = find(id); if (!i) return;
    ev(i, title, sub||'', 'ph-megaphone', 'gov');
    notify(i, false);
  },
  setStatus(id, st) {
    if (!S) return; const i = find(id); if (!i || i.stage===st) return;
    i.stage = st;
    if (st==='assigned')  ev(i,`Assigned to ${i.assignee||CITY[i.city].officers[0]}`,'','ph-user-circle-check','gov');
    if (st==='progress')  ev(i,'Work started on site','Crew deployed','ph-hard-hat','gov','crew on site');
    if (st==='resolved')  { i.confirms=Math.max(i.confirms,Math.round(i.needed*.7)); ev(i,'Marked fixed by department','Proof photo attached · citizens asked to confirm','ph-check','fix','after photo'); }
    if (st==='closed')    ev(i,'Case closed',`${i.confirms} of ${i.needed} citizens confirmed`,'ph-seal-check','fix');
    if (st==='verified')  ev(i,'Moved back to verified','','ph-arrow-counter-clockwise','gov');
    notify(i, false);
  },
  confirm(id, fixed, reason) {
    if (!S || S.my.confirmed[id]) return {}; const i = find(id); if (!i) return {};
    S.my.confirmed[id] = fixed ? 1 : -1;
    if (fixed) {
      i.confirms++;
      ev(i,'A citizen confirmed the fix',`${i.confirms} of ${i.needed}`,'ph-thumbs-up','citizen');
      if (i.confirms>=i.needed) { i.stage='closed'; ev(i,'Case closed',`${i.confirms} of ${i.needed} citizens confirmed`,'ph-seal-check','fix'); }
    } else {
      ev(i,'Citizen says: not fixed',reason||'','ph-thumbs-down','citizen');
    }
    notify(i, true); return { closed: i.stage==='closed' };
  },
  govAdvance(id) {
    if (!S) return null; const i = find(id); if (!i) return null;
    const nextMap = { reported:'community', community:'review', review:'verify', verified:'assigned', assigned:'progress', progress:'resolved' };
    const next = nextMap[i.stage]; if (!next) return null;
    if (next==='community') { i.sup=Math.max(i.sup,6); i.stage='community'; i.conf=Math.max(i.conf,60); ev(i,'Neighbours joined','','ph-users-three','community'); }
    else if (next==='review') { i.conf=79; bump(i,1); }
    else if (next==='verify') {
      const prio = (i.sev==='critical'||i.sev==='high')?'P1':'P2';
      const days = {P1:5,P2:10,P3:21}[prio];
      i.caseId=`CP-${CITY[i.city].code}-${S.caseSeq++}`; i.prio=prio;
      i.assignee=CITY[i.city].officers[0]; i.due=Date.now()+days*D; i.stage='assigned';
      ev(i,`Verified by ${corp(i)}`,`Inspected by ${VERIFIER}`,'ph-seal-check','gov');
      ev(i,`Official case ${i.caseId}`,`${i.dept} · ${days}-day SLA`,'ph-bank','gov');
      ev(i,`Assigned to ${i.assignee}`,'','ph-user-circle-check','gov');
      persistMeta();
    } else {
      i.stage=next;
      if (next==='assigned') ev(i,`Assigned to ${i.assignee||CITY[i.city].officers[0]}`,'','ph-user-circle-check','gov');
      if (next==='progress') ev(i,'Work started on site','Crew deployed','ph-hard-hat','gov','crew on site');
      if (next==='resolved') { i.confirms=Math.max(i.confirms,Math.round(i.needed*.7)); ev(i,'Marked fixed by department','Proof photo attached · citizens asked to confirm','ph-check','fix','after photo'); }
    }
    notify(i, false); return find(id).stage;
  },
  setMe(p) {
    if (!S) return; Object.assign(S.me, p); persistUser();
  },
  reset() {
    const now = Date.now();
    // Optimistic local update
    const issues = buildSeedIssues(now);
    if (S) { S.issues=issues; S.seq=2113; S.caseSeq=24817; S.my={...SEED_MY}; S.me={verified:false,anonDefault:false}; subs.forEach(f=>f(S)); }
    // Persist to Firestore
    seedFirestore(now).catch(console.warn);
  },
};

// ── window.CP ─────────────────────────────────────────────────────────────────
window.CP = {
  get: () => S,
  find,
  act: (n, ...a) => A[n](...a),
  subscribe: f => {
    subs.add(f);
    if (S) f(S); // fire immediately if data already loaded
    return () => subs.delete(f);
  },
  analyze,
  CATS, CITY, STAGES, SCENES, ME, VERIFIER, SEVW, ORDER, H, D,
  step:  st => STAGES[st]?.step ?? 0,
  score: i  => Math.min(99, Math.round(SEVW[i.sev] + i.conf*0.4 + Math.min(i.sup,60)*0.3)),
  ago(ts)  { const m=Math.max(1,Math.round((Date.now()-ts)/60000)); return m<60?m+'m':m<1440?Math.round(m/60)+'h':Math.round(m/1440)+'d'; },
  date(ts) { return new Date(ts).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',hour12:false}).toUpperCase().replace(',',' ·'); },
  slaLeft(i)  { if(!i.due)return''; const d=i.due-Date.now(),a=Math.abs(d),dd=Math.floor(a/D),hh=Math.floor((a%D)/H); const s=dd?`${dd}d ${hh}h`:`${hh}h`; return d<0?`Overdue ${s}`:`${s} left`; },
  slaRisk(i)  { if(!i.due||['resolved','closed'].includes(i.stage))return 0; const d=i.due-Date.now(); return d<0?2:d<D?1:0; },
  corp,
  signOut: () => signOut(auth),
};
