import type { Issue } from '@/lib/domain/types';
import { D, H } from '@/lib/domain/constants';
import { crossedAt, deptName, evTs, fixTs, isCase } from './derive';

// One record per real case. The design pads the charts with generated history; we use real
// cases only, so the numbers here always agree with the Cases list.
export interface Rec {
  id: string; area: string; cat: string; dept: string;
  created: number; approved: boolean; fixed: number | null; closed: number | null; reopened: boolean; due: number | null;
}

export const toRecs = (issues: Issue[]): Rec[] =>
  issues.filter(isCase).map((i) => ({
    id: i.id, area: i.area, cat: i.cat, dept: deptName(i), created: crossedAt(i),
    // caseId is issued as soon as support crosses the threshold, so it does not mean "approved".
    approved: !['review', 'rejected'].includes(i.stage),
    fixed: fixTs(i),
    closed: i.stage === 'closed' ? evTs(i, /closed/i) ?? fixTs(i) : null,
    reopened: !!i.reopened, due: i.due,
  }));

export const sod = (t: number) => { const x = new Date(t); x.setHours(0, 0, 0, 0); return x.getTime(); };
export const isoD = (t: number) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export const parseD = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d).getTime(); };

export type RangeKey = 'today' | 'yday' | '7d' | '30d' | 'mtd' | '90d' | '12m' | 'custom';
export const RANGES: [RangeKey, string, number][] = [['today', 'Today', 0], ['yday', 'Yesterday', 1], ['7d', 'Last 7 days', 6], ['30d', 'Last 30 days', 29], ['mtd', 'This month', 0], ['90d', 'Last 90 days', 89], ['12m', 'Last 12 months', 364]];

export function resolveRange(key: RangeKey, from: string | null, to: string | null, now: number): [number, number] {
  if (key === 'custom') return [from ? parseD(from) : sod(now) - 29 * D, Math.min(now, to ? parseD(to) + D - 1 : now)];
  if (key === 'yday') return [sod(now) - D, sod(now) - 1];
  if (key === 'mtd') { const x = new Date(now); x.setDate(1); x.setHours(0, 0, 0, 0); return [x.getTime(), now]; }
  return [sod(now) - (RANGES.find((r) => r[0] === key)?.[2] ?? 29) * D, now];
}

const inR = (t: number | null, a: number, b: number) => !!t && t >= a && t <= b;

export function calc(recs: Rec[], a: number, b: number) {
  const op = recs.filter((r) => inR(r.created, a, b)), fx = recs.filter((r) => inR(r.fixed, a, b)), cl = recs.filter((r) => inR(r.closed, a, b));
  const onTime = fx.filter((r) => r.due && r.fixed! <= r.due).length, re = fx.filter((r) => r.reopened).length;
  return {
    op, fx, opened: op.length, fixed: fx.length, closed: cl.length, reopN: re,
    res: fx.length ? fx.reduce((x, r) => x + (r.fixed! - r.created), 0) / fx.length / D : null,
    sla: fx.length ? (onTime / fx.length) * 100 : null,
    reopen: fx.length ? (re / fx.length) * 100 : null,
  };
}
export type Calc = ReturnType<typeof calc>;

export type Gran = 'hour' | 'day' | 'week' | 'month';
export function buckets(r0: number, r1: number): { gran: Gran; list: { a: number; b: number }[] } {
  const len = Math.max(H, r1 - r0);
  const gran: Gran = len <= 1.6 * D ? 'hour' : len <= 45 * D ? 'day' : len <= 200 * D ? 'week' : 'month';
  const list: { a: number; b: number }[] = [];
  let t = sod(r0);
  if (gran === 'month') { const x = new Date(r0); x.setDate(1); x.setHours(0, 0, 0, 0); t = x.getTime(); }
  while (t <= r1 && list.length < 60) {
    let e: number;
    if (gran === 'hour') e = t + H; else if (gran === 'day') e = t + D; else if (gran === 'week') e = t + 7 * D;
    else { const x = new Date(t); x.setMonth(x.getMonth() + 1); e = x.getTime(); }
    list.push({ a: t, b: e - 1 });
    t = e;
  }
  return { gran, list };
}

export const nice = (v: number) => { const p = Math.pow(10, Math.floor(Math.log10(v))); const m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; };

export const RES_BINS: [string, number, number, string][] = [
  ['< 1 day', 0, 1, 'var(--cp-leaf)'], ['1–3 days', 1, 3, 'var(--cp-leaf)'], ['3–7 days', 3, 7, 'var(--cp-peacock)'],
  ['1–2 weeks', 7, 14, 'var(--cp-marigold)'], ['2+ weeks', 14, 1e9, 'var(--cp-pulse)'],
];
