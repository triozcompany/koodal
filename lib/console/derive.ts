import type { Issue } from '@/lib/domain/types';
import { CATS, D, H } from '@/lib/domain/constants';
import { GS, SEVL } from '@/lib/domain/stage-style';
import { score, slaLeft, slaRisk } from '@/lib/domain/rules';

export const DECISION_SLA_H = 48; // handoff default; configurable 24/48/72h later

// The design shows staff-facing department names, not the raw per-category ones.
const DEPT_DISPLAY: Record<string, string> = {
  'Roads & Bridges': 'Roads', 'Storm Water Drains': 'Water & Drainage', 'Water & Sewerage': 'Water & Drainage',
  'Metrowater (CMWSSB)': 'Water & Drainage', 'Solid Waste Mgmt': 'Sanitation', Electrical: 'Streetlights', 'Parks & Trees': 'Parks & Trees',
};
export const deptName = (i: Issue) => DEPT_DISPLAY[i.dept] ?? i.dept;

export type GovStage = 'pending' | 'assigned' | 'progress' | 'reopened' | 'fixed' | 'closed' | 'rejected';

export const isCase = (i: Issue) => !['reported', 'community'].includes(i.stage);
export const govStage = (i: Issue): GovStage =>
  i.stage === 'review' ? 'pending' : i.stage === 'rejected' ? 'rejected' : i.stage === 'closed' ? 'closed' : i.stage === 'resolved' ? 'fixed'
    : i.reopened ? 'reopened' : i.stage === 'progress' ? 'progress' : 'assigned';
export const isOverdue = (i: Issue) => !!i.due && i.due < Date.now() && ['verified', 'assigned', 'progress'].includes(i.stage);

export const evTs = (i: Issue, re: RegExp) => { const e = i.events.filter((x) => re.test(x.title)); return e.length ? e[e.length - 1].ts : null; };
export const crossedAt = (i: Issue) => evTs(i, /^Community verified/) ?? i.created;
export const fixTs = (i: Issue) => evTs(i, /^Marked fixed/);

export const dur = (ms: number) => { const h = ms / H; return h < 48 ? `${Math.round(h)}h` : `${(h / 24).toFixed(1).replace('.0', '')}d`; };
export const sdate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
export const byScore = (a: Issue, b: Issue) => score(b) - score(a);

export interface CaseRow {
  id: string; ref: string; title: string; meta: string; icon: string; sup: number; conf: number; dept: string; assignee: string;
  sla: string; slaBg: string; slaFg: string; sevL: string; sevBg: string; sevFg: string;
  stageIcon: string; stageBg: string; stageFg: string; riskL: string;
  stageLabel: string; stageShort: string; bar: string; ang: string; photoN: number; photoUrl?: string; confW: string; target: string;
  segs: { c: string }[];
}

const SHORT: Record<GovStage, string> = { pending: 'Pending', assigned: 'Assigned', progress: 'In progress', reopened: 'Reopened', fixed: 'Fixed', closed: 'Closed', rejected: 'Rejected' };
const LIFE_AT: Record<GovStage, number> = { pending: 1, rejected: 1, assigned: 2, progress: 3, reopened: 3, fixed: 4, closed: 5 };
const SEG = ['var(--cp-marigold)', 'var(--cp-marigold)', 'var(--cp-peacock)', 'var(--cp-pulse)', 'var(--cp-leaf)', 'var(--cp-leaf)'];

export function caseRow(i: Issue): CaseRow {
  const g = govStage(i), G = GS[g], c = CATS[i.cat], sv = SEVL[i.sev], now = Date.now();
  let sla = '—', slaBg = 'var(--cp-surface-2)', slaFg = 'var(--cp-ink-2)';
  if (g === 'pending') {
    const left = crossedAt(i) + DECISION_SLA_H * H - now;
    sla = left < 0 ? `Decision late ${dur(-left)}` : `Decide in ${dur(left)}`;
    if (left < 0) { slaBg = 'var(--cp-pulse)'; slaFg = '#fff'; } else if (left < 12 * H) slaBg = 'var(--cp-marigold-soft)';
  } else if (['assigned', 'progress', 'reopened'].includes(g)) {
    sla = slaLeft(i);
    if (isOverdue(i)) { slaBg = 'var(--cp-pulse)'; slaFg = '#fff'; } else if (slaRisk(i) === 1) slaBg = 'var(--cp-marigold-soft)';
  } else if (g === 'fixed') { sla = `${i.confirms}/${i.needed} confirmed`; slaBg = 'var(--cp-leaf-soft)'; slaFg = 'var(--cp-ink)'; }
  else if (g === 'closed') sla = 'Met';
  return {
    id: i.id, ref: i.caseId || i.id, title: i.title, meta: `${i.area} · ${c.l}`, icon: c.icon, sup: i.sup, conf: i.conf, dept: deptName(i),
    assignee: i.caseId ? (i.team || i.assignee || '—') : 'Not assigned', sla, slaBg, slaFg,
    sevL: sv[2], sevBg: sv[0], sevFg: sv[1], stageIcon: G[3], stageBg: G[1], stageFg: G[2], riskL: g === 'reopened' ? 'Reopened' : sla,
    stageLabel: G[0], stageShort: SHORT[g],
    bar: isOverdue(i) || g === 'reopened' ? 'var(--cp-pulse)' : g === 'pending' ? 'var(--cp-marigold)' : 'transparent',
    ang: `${135 + (i.id.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0) % 4) * 20}deg`,
    photoN: i.evidence.length, photoUrl: i.evidence.find((e) => e.url)?.url, confW: `${i.conf}%`,
    target: i.due ? `Target ${sdate(i.due)}` : 'Target set on approval',
    segs: SEG.map((c, k) => ({ c: k <= LIFE_AT[g] ? (g === 'rejected' && k === 1 ? 'var(--cp-ink-3)' : c) : 'var(--cp-line)' })),
  };
}

export function homeData(issues: Issue[]) {
  const now = Date.now();
  const cases = issues.filter(isCase);
  const by = (g: GovStage) => cases.filter((i) => govStage(i) === g);
  const pend = by('pending'), reop = by('reopened'), od = cases.filter(isOverdue), fixed = by('fixed');
  const active = cases.filter((i) => ['assigned', 'progress', 'reopened'].includes(govStage(i)));
  const res = cases.filter((i) => fixTs(i)).map((i) => fixTs(i)! - crossedAt(i));
  const avgRes = res.length ? res.reduce((a, b) => a + b, 0) / res.length : 0;
  const risk = [...reop, ...od.filter((i) => !i.reopened)].sort((a, b) => (a.due || 0) - (b.due || 0));

  const weeks = Array.from({ length: 12 }, (_, k) => {
    const end = now - (11 - k) * 7 * D, start = end - 7 * D;
    return {
      l: sdate(start),
      n: cases.filter((i) => { const t = crossedAt(i); return t > start && t <= end; }).length,
      c: cases.filter((i) => { const t = fixTs(i); return t != null && t > start && t <= end; }).length,
    };
  });

  const areas: Record<string, { area: string; n: number; open: number; sup: number; xs: number; ys: number; cats: Record<string, number> }> = {};
  cases.forEach((i) => {
    const a = (areas[i.area] ??= { area: i.area, n: 0, open: 0, sup: 0, xs: 0, ys: 0, cats: {} });
    a.n++; if (!['closed', 'rejected'].includes(i.stage)) a.open++;
    a.sup += i.sup; a.xs += i.x; a.ys += i.y; a.cats[i.cat] = (a.cats[i.cat] || 0) + 1;
  });
  const emerging: Record<string, number> = {};
  issues.filter((i) => ['reported', 'community'].includes(i.stage)).forEach((i) => { emerging[i.area] = (emerging[i.area] || 0) + 1; });
  const hot = Object.values(areas).filter((a) => a.open > 0).map((a) => {
    const tc = Object.entries(a.cats).sort((x, y) => y[1] - x[1])[0][0] as keyof typeof CATS;
    return { ...a, x: a.xs / a.n, y: a.ys / a.n, top: CATS[tc].l, score: a.open * 10 + a.sup / 4 + (emerging[a.area] || 0) * 3 };
  }).sort((a, b) => b.score - a.score);

  const activity = cases.flatMap((i) => i.events.filter((e) => !/reported it$|joined|New evidence|Evidence withdrawn|neighbours joined/.test(e.title)).map((e) => ({ e, i })))
    .sort((a, b) => b.e.ts - a.e.ts).slice(0, 6);

  return { pend, reop, od, fixed, active, avgRes, risk, weeks, hot, activity };
}

export const STATUS_OPTS: [string, string][] = [['pending', 'Pending approval'], ['assigned', 'Assigned'], ['progress', 'In progress'], ['reopened', 'Reopened'], ['overdue', 'Overdue'], ['fixed', 'Fixed · confirming'], ['closed', 'Closed'], ['rejected', 'Rejected']];
export const SORTS: [string, string, string][] = [['score', 'Priority score', 'ph-lightning'], ['newest', 'Newest', 'ph-clock'], ['sla', 'Target date', 'ph-calendar-check'], ['support', 'Most support', 'ph-users-three']];
export const statusMatches = (i: Issue, k: string) => (k === 'overdue' ? isOverdue(i) : govStage(i) === k);
export const SORT_FN: Record<string, (a: Issue, b: Issue) => number> = {
  score: byScore,
  newest: (a, b) => crossedAt(b) - crossedAt(a),
  sla: (a, b) => (a.due || crossedAt(a) + DECISION_SLA_H * H) - (b.due || crossedAt(b) + DECISION_SLA_H * H),
  support: (a, b) => b.sup - a.sup,
};

// Staff-facing departments and their default teams (from the design's GOVD list).
export const GOV_DEPTS: { dept: string; team: string; icon: string }[] = [
  { dept: 'Roads', team: 'Roads Team', icon: 'ph-road-horizon' },
  { dept: 'Water & Drainage', team: 'Water & Drainage Team', icon: 'ph-drop' },
  { dept: 'Sanitation', team: 'Sanitation Team', icon: 'ph-trash' },
  { dept: 'Streetlights', team: 'Streetlights Team', icon: 'ph-lightbulb' },
  { dept: 'Parks & Trees', team: 'Parks & Trees Team', icon: 'ph-tree' },
];
export const REJECT_REASONS: [string, string][] = [
  ['Duplicate of an existing case', 'ph-copy'], ['Outside our jurisdiction', 'ph-map-trifold'], ['On private property', 'ph-house-line'],
  ['Already resolved on inspection', 'ph-check-square'], ['Not a civic issue', 'ph-prohibit'], ['Evidence does not match site', 'ph-image-broken'],
];
export const fdate = (ts: number) => new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
export const fdatetime = (ts: number) => new Date(ts).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
export const decisionDeadline = (i: Issue) => crossedAt(i) + DECISION_SLA_H * H;

export const PIN_COLOR: Record<GovStage, string> = {
  pending: 'var(--cp-marigold)', assigned: 'var(--cp-peacock)', progress: 'var(--cp-pulse)', reopened: 'var(--cp-pulse-deep)',
  fixed: 'var(--cp-leaf)', closed: 'var(--cp-leaf)', rejected: 'var(--cp-ink-3)',
};

// One matcher for every search box (Search page, Cases, Map): every word must appear somewhere
// in the case's id, title, place, department, team, category, stage, "overdue" or tags.
export const searchTokens = (q: string) => q.trim().toLowerCase().split(/\s+/).filter(Boolean);
export function caseMatches(i: Issue, tokens: string[]): boolean {
  if (!tokens.length) return true;
  const hay = [i.id, i.caseId, i.title, i.street, i.area, i.city, deptName(i), i.team, CATS[i.cat].l, GS[govStage(i)][0], isOverdue(i) ? 'overdue' : '', ...(i.tags ?? [])].join(' ').toLowerCase();
  return tokens.every((t) => hay.includes(t));
}
