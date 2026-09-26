/* CivicPulse Firestore client — replaces civicpulse-data.js.
   Keeps the exact window.CP API surface. Local state for sync reads;
   Firestore persistence via /api/* routes in the background. */
(function () {
  const H = 3600e3, D = 24 * H;
  const CATS = {
    road: { l: 'Roads', icon: 'ph-road-horizon', dept: 'Roads & Bridges' },
    drain: { l: 'Drains', icon: 'ph-waves', dept: 'Storm Water Drains' },
    garbage: { l: 'Garbage', icon: 'ph-trash', dept: 'Solid Waste Mgmt' },
    light: { l: 'Streetlights', icon: 'ph-lightbulb', dept: 'Electrical' },
    water: { l: 'Water & sewage', icon: 'ph-drop', dept: 'Water & Sewerage' },
    tree: { l: 'Trees', icon: 'ph-tree', dept: 'Parks & Trees' },
    footpath: { l: 'Footpaths', icon: 'ph-person-simple-walk', dept: 'Roads & Bridges' },
  };
  const CITY = {
    Chennai: { corp: 'Greater Chennai Corp.', code: 'CHN', water: 'Metrowater (CMWSSB)', officers: ['JE Priya Natarajan', 'JE Karthik Rajan', 'AE Farida Begum'] },
    Coimbatore: { corp: 'Coimbatore City Corp.', code: 'CBE', officers: ['JE Suresh Babu', 'JE Nithya Krishnan'] },
    Madurai: { corp: 'Madurai Corporation', code: 'MDU', officers: ['JE Muthu Pandian', 'JE Selvi Arumugam'] },
  };
  const STAGES = {
    reported: { l: 'New', step: 0 }, community: { l: 'Gathering support', step: 1 }, review: { l: 'With govt', step: 1 },
    verified: { l: 'Official case', step: 2 }, assigned: { l: 'Assigned', step: 2 }, progress: { l: 'In progress', step: 3 },
    resolved: { l: 'Fixed · confirm', step: 4 }, closed: { l: 'Closed', step: 4 }, rejected: { l: 'Rejected', step: 0 },
  };
  const SEVW = { critical: 40, high: 30, medium: 20, low: 10 };
  const ORDER = ['reported', 'community', 'review', 'verified', 'assigned', 'progress', 'resolved', 'closed'];
  const ME = { name: 'Divya Raghavan', short: 'DR', area: 'Velachery, Chennai', phone: '+91 98401 23456' };
  const VERIFIER = 'AE R. Ganesan';
  const SCENES = {
    sewage: { cat: 'water', sev: 'critical', label: 'Sewage overflow', p: 95, title: 'Sewage overflowing onto the road', size: '~15 m stretch', risk: 'Health hazard · bus stop 30 m', street: '100 Feet Rd, Vijayanagar', x: 48, y: 47, voice: { lang: 'Tanglish', text: '"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"', en: 'Drainage overflowing near the bus stand, it has been like this for days' } },
    pothole: { cat: 'road', sev: 'high', label: 'Pothole', p: 96, title: 'Deep pothole on the carriageway', size: '~1.1 × 0.7 m', risk: 'Two-wheeler route · signal 40 m', street: 'Taramani Link Rd', x: 58, y: 40, voice: { lang: 'Tamil', text: '"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"', en: 'Very big pit, bikes fall at night' } },
    garbage: { cat: 'garbage', sev: 'high', label: 'Garbage dump', p: 93, title: 'Uncollected garbage heap', size: '~3 m² heap', risk: 'Near market · stray dogs', street: 'Velachery Main Rd', x: 41, y: 66, voice: { lang: 'Tanglish', text: '"Three days-a garbage edukkala, smell romba jaasthi"', en: 'Garbage not collected for three days, the smell is terrible' } },
    light: { cat: 'light', sev: 'medium', label: 'Streetlight out', p: 91, title: 'Streetlights not working', size: '3 poles dark', risk: 'Women walk here after work', street: 'Balaji Nagar 2nd St', x: 74, y: 70, voice: { lang: 'Tanglish', text: '"Street full-a dark, ladies nadakka bayapadranga"', en: 'The street is fully dark, women are afraid to walk' } },
  };

  let S = null;
  const subs = new Set();

  // --- API helpers ---
  const BASE = window.location.origin;

  async function loadFromAPI() {
    try {
      const resp = await fetch(BASE + '/api/issues');
      if (!resp.ok) return;
      S = await resp.json();
      subs.forEach(f => f(S));
    } catch (e) {
      console.warn('CivicPulse: failed to load from API', e);
    }
  }

  function persist(action, args) {
    fetch(BASE + '/api/act', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, args }),
    }).catch(e => console.warn('CivicPulse: persist failed', action, e));
  }

  // Load on init, then poll every 5 s for cross-tab sync
  loadFromAPI();
  setInterval(loadFromAPI, 5000);

  // --- Local helpers (mirror civicpulse-data.js exactly) ---
  const find = id => S && S.issues.find(x => x.id === id);
  const corp = i => CITY[i.city].corp;
  const ev = (i, title, sub, icon, kind, photo) => i.events.push({ ts: Date.now(), title, sub: sub || '', icon, kind, photo: photo || '' });
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

  function notifySave() {
    subs.forEach(f => f(S));
  }

  // --- Mock analyze (same as original) ---
  function analyze(scene) {
    const sc = SCENES[scene];
    if (!sc || !S) return { ...sc, scene, matches: [], strong: null };
    const dept = sc.cat === 'water' ? CITY.Chennai.water : CATS[sc.cat].dept;
    const matches = S.issues
      .filter(i => i.city === 'Chennai' && i.cat === sc.cat && !['closed', 'rejected'].includes(i.stage) && i.km < 3)
      .map(i => {
        const m = Math.hypot(i.x - sc.x, i.y - sc.y) * 30;
        return { id: i.id, title: i.title, dist: Math.round(m), score: Math.max(0, Math.round(98 - m / 20)), sup: i.sup, by: i.by, h: Math.round((Date.now() - i.created) / H), stage: i.stage };
      })
      .filter(m => m.dist < 700)
      .sort((a, b) => b.score - a.score);
    return {
      ...sc, scene, dept, corp: CITY.Chennai.corp, catLabel: CATS[sc.cat].l, icon: CATS[sc.cat].icon,
      summary: `${sc.label} at ${sc.street}, Velachery. ${sc.risk}.`,
      matches, strong: matches[0] && matches[0].score >= 85 ? matches[0] : null,
    };
  }

  // --- Actions (apply locally + persist) ---
  const A = {
    support(id) {
      if (!S || S.my.support[id]) return {};
      const i = find(id);
      if (!i) return {};
      S.my.support[id] = true;
      i.sup++;
      const crossed = bump(i, 2);
      notifySave();
      persist('support', [id]);
      return { crossed };
    },
    unsupport(id) {
      if (!S) return;
      const i = find(id);
      if (!i || !S.my.support[id] || i.mine) return;
      delete S.my.support[id];
      i.sup--;
      notifySave();
      persist('unsupport', [id]);
    },
    evidence(id) {
      if (!S) return {};
      const i = find(id);
      if (!i) return {};
      let crossed = false;
      if (!S.my.support[id]) { S.my.support[id] = true; i.sup++; crossed = bump(i, 2); }
      i.evidence.push({ by: initials(), ts: Date.now() });
      crossed = bump(i, 2) || crossed;
      ev(i, 'New photo evidence', S.me.anonDefault ? 'From Anonymous' : `From ${ME.name}`, 'ph-image', 'citizen');
      notifySave();
      persist('evidence', [id]);
      return { crossed };
    },
    validate(id, yes) {
      if (!S || S.my.validated[id]) return {};
      const i = find(id);
      if (!i) return {};
      S.my.validated[id] = yes ? 1 : -1;
      let crossed = false;
      if (yes) { i.valYes++; crossed = bump(i, 1); }
      else { i.valNo++; i.conf = Math.max(5, i.conf - 3); }
      notifySave();
      persist('validate', [id, yes]);
      return { crossed, conf: i.conf };
    },
    report({ scene, anon, joinId }) {
      if (!S) return {};
      const a = analyze(scene);
      const who = anon ? 'Anonymous' : ME.name;
      if (joinId) {
        const i = find(joinId);
        if (!i) return {};
        i.merged.push({ by: who, h: 0, text: a.voice ? a.voice.text : a.summary, sim: (a.matches.find(m => m.id === joinId) || {}).score || 90, me: true });
        let crossed = false;
        if (!S.my.support[joinId]) { S.my.support[joinId] = true; i.sup++; crossed = bump(i, 2); }
        i.evidence.push({ by: anon ? 'AN' : ME.short, ts: Date.now() });
        crossed = bump(i, 2) || crossed;
        ev(i, `${who} joined with a photo`, 'AI merged a duplicate report', 'ph-intersect', 'citizen');
        notifySave();
        persist('report', [{ scene, anon, joinId, analyzeResult: a }]);
        return { id: joinId, crossed };
      }
      const id = 'CP-' + (S.seq++);
      const now = Date.now();
      const newIssue = {
        id, cat: a.cat, sev: a.sev, city: 'Chennai', area: 'Velachery', street: a.street,
        title: a.title, stage: 'reported', sup: 1, conf: 24, created: now, x: a.x, y: a.y,
        km: 0.1, anon: !!anon, mine: true, by: who, dept: a.dept, summary: a.summary,
        voice: a.voice || null, merged: [], history: '', caseId: null, assignee: null, prio: null, due: null,
        confirms: 0, needed: 25, valYes: 0, valNo: 0,
        evidence: [{ by: anon ? 'AN' : ME.short, ts: now }],
        events: [{ ts: now, title: `${anon ? 'Anonymous' : 'You'} reported it`, sub: `AI: ${a.label} · ${a.sev}`, icon: 'ph-camera', kind: 'citizen', photo: '' }],
        reject: null,
      };
      S.issues.unshift(newIssue);
      S.my.support[id] = true;
      notifySave();
      persist('report', [{ scene, anon, joinId: null, analyzeResult: a }]);
      return { id, crossed: false };
    },
    verify(id, { assignee, prio }) {
      if (!S) return null;
      const i = find(id);
      if (!i) return null;
      const days = { P1: 5, P2: 10, P3: 21 }[prio] || 5;
      i.caseId = `CP-${CITY[i.city].code}-${S.caseSeq++}`;
      i.prio = prio;
      i.assignee = assignee;
      i.due = Date.now() + days * D;
      i.stage = 'assigned';
      ev(i, `Verified by ${corp(i)}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov');
      ev(i, `Official case ${i.caseId}`, `${i.dept} · ${days}-day SLA`, 'ph-bank', 'gov');
      ev(i, `Assigned to ${assignee}`, '', 'ph-user-circle-check', 'gov');
      notifySave();
      persist('verify', [id, { assignee, prio }]);
      return i.caseId;
    },
    reject(id, reason) {
      if (!S) return;
      const i = find(id);
      if (!i) return;
      i.stage = 'rejected';
      i.reject = reason;
      ev(i, 'Not accepted by ' + corp(i), `Reason: ${reason}`, 'ph-x-circle', 'gov');
      notifySave();
      persist('reject', [id, reason]);
    },
    inspect(id) {
      if (!S) return;
      const i = find(id);
      if (!i) return;
      ev(i, 'Field inspection scheduled', 'Within 24 hours', 'ph-binoculars', 'gov');
      notifySave();
      persist('inspect', [id]);
    },
    note(id, title, sub) {
      if (!S) return;
      const i = find(id);
      if (!i) return;
      ev(i, title, sub || '', 'ph-megaphone', 'gov');
      notifySave();
      persist('note', [id, title, sub]);
    },
    setStatus(id, st) {
      if (!S) return;
      const i = find(id);
      if (!i || i.stage === st) return;
      i.stage = st;
      if (st === 'assigned') ev(i, `Assigned to ${i.assignee || CITY[i.city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
      if (st === 'progress') ev(i, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
      if (st === 'resolved') { i.confirms = Math.max(i.confirms, Math.round(i.needed * 0.7)); ev(i, 'Marked fixed by department', 'Proof photo attached · citizens asked to confirm', 'ph-check', 'fix', 'after photo'); }
      if (st === 'closed') ev(i, 'Case closed', `${i.confirms} of ${i.needed} citizens confirmed`, 'ph-seal-check', 'fix');
      if (st === 'verified') ev(i, 'Moved back to verified', '', 'ph-arrow-counter-clockwise', 'gov');
      notifySave();
      persist('setStatus', [id, st]);
    },
    confirm(id, fixed, reason) {
      if (!S || S.my.confirmed[id]) return {};
      const i = find(id);
      if (!i) return {};
      S.my.confirmed[id] = fixed ? 1 : -1;
      if (fixed) {
        i.confirms++;
        ev(i, 'A citizen confirmed the fix', `${i.confirms} of ${i.needed}`, 'ph-thumbs-up', 'citizen');
        if (i.confirms >= i.needed) { i.stage = 'closed'; ev(i, 'Case closed', `${i.confirms} of ${i.needed} citizens confirmed`, 'ph-seal-check', 'fix'); }
      } else {
        ev(i, 'Citizen says: not fixed', reason || '', 'ph-thumbs-down', 'citizen');
      }
      notifySave();
      persist('confirm', [id, fixed, reason]);
      return { closed: i.stage === 'closed' };
    },
    govAdvance(id) {
      if (!S) return null;
      const i = find(id);
      if (!i) return null;
      const nextMap = { reported: 'community', community: 'review', review: 'verify', verified: 'assigned', assigned: 'progress', progress: 'resolved' };
      const next = nextMap[i.stage];
      if (!next) return null;
      if (next === 'community') { i.sup = Math.max(i.sup, 6); i.stage = 'community'; i.conf = Math.max(i.conf, 60); ev(i, 'Neighbours joined', '', 'ph-users-three', 'community'); }
      else if (next === 'review') { i.conf = 79; bump(i, 1); }
      else if (next === 'verify') {
        const prio = (i.sev === 'critical' || i.sev === 'high') ? 'P1' : 'P2';
        const days = { P1: 5, P2: 10, P3: 21 }[prio] || 5;
        i.caseId = `CP-${CITY[i.city].code}-${S.caseSeq++}`;
        i.prio = prio;
        i.assignee = CITY[i.city].officers[0];
        i.due = Date.now() + days * D;
        i.stage = 'assigned';
        ev(i, `Verified by ${corp(i)}`, `Inspected by ${VERIFIER}`, 'ph-seal-check', 'gov');
        ev(i, `Official case ${i.caseId}`, `${i.dept} · ${days}-day SLA`, 'ph-bank', 'gov');
        ev(i, `Assigned to ${i.assignee}`, '', 'ph-user-circle-check', 'gov');
      } else {
        i.stage = next;
        if (next === 'assigned') ev(i, `Assigned to ${i.assignee || CITY[i.city].officers[0]}`, '', 'ph-user-circle-check', 'gov');
        if (next === 'progress') ev(i, 'Work started on site', 'Crew deployed', 'ph-hard-hat', 'gov', 'crew on site');
        if (next === 'resolved') { i.confirms = Math.max(i.confirms, Math.round(i.needed * 0.7)); ev(i, 'Marked fixed by department', 'Proof photo attached · citizens asked to confirm', 'ph-check', 'fix', 'after photo'); }
      }
      notifySave();
      persist('govAdvance', [id]);
      return find(id).stage;
    },
    setMe(p) {
      if (!S) return;
      Object.assign(S.me, p);
      notifySave();
      persist('setMe', [p]);
    },
    reset() {
      fetch(BASE + '/api/seed', { method: 'POST' })
        .then(() => loadFromAPI())
        .catch(e => console.warn('CivicPulse: reset failed', e));
    },
  };

  window.CP = {
    get: () => S,
    find,
    act: (n, ...a) => A[n](...a),
    subscribe: f => { subs.add(f); return () => subs.delete(f); },
    analyze,
    CATS, CITY, STAGES, SCENES, ME, VERIFIER, SEVW, ORDER, H, D,
    step: st => STAGES[st] ? STAGES[st].step : 0,
    score: i => Math.min(99, Math.round(SEVW[i.sev] + i.conf * 0.4 + Math.min(i.sup, 60) * 0.3)),
    ago(ts) { const m = Math.max(1, Math.round((Date.now() - ts) / 60000)); return m < 60 ? m + 'm' : m < 1440 ? Math.round(m / 60) + 'h' : Math.round(m / 1440) + 'd'; },
    date(ts) { return new Date(ts).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).toUpperCase().replace(',', ' ·'); },
    slaLeft(i) { if (!i.due) return ''; const d = i.due - Date.now(), a = Math.abs(d), dd = Math.floor(a / D), hh = Math.floor((a % D) / H); const s = dd ? `${dd}d ${hh}h` : `${hh}h`; return d < 0 ? `Overdue ${s}` : `${s} left`; },
    slaRisk(i) { if (!i.due || ['resolved', 'closed'].includes(i.stage)) return 0; const d = i.due - Date.now(); return d < 0 ? 2 : d < D ? 1 : 0; },
    corp,
  };
})();
