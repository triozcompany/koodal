import type { Issue } from './types';
import { CATS, CITY, STAGES, SEVW, D, H } from './constants';

export function deptFor(cat: string, city: string): string {
  const c = CITY[city];
  return cat === 'water' && c?.water ? c.water : CATS[cat as keyof typeof CATS]?.dept ?? '';
}

export function corp(issue: Issue): string {
  return CITY[issue.city]?.corp ?? '';
}

export function bump(issue: Issue, n: number): boolean {
  const before = issue.conf;
  issue.conf = Math.max(5, Math.min(97, issue.conf + n));
  if (issue.stage === 'reported' && issue.sup >= 5) issue.stage = 'community';
  if (before < 80 && issue.conf >= 80 && (issue.stage === 'community' || issue.stage === 'reported')) {
    issue.stage = 'review';
    return true;
  }
  return false;
}

export function score(issue: Issue): number {
  return Math.min(99, Math.round(SEVW[issue.sev] + issue.conf * 0.4 + Math.min(issue.sup, 60) * 0.3));
}

export function slaLeft(issue: Issue): string {
  if (!issue.due) return '';
  const d = issue.due - Date.now();
  const a = Math.abs(d);
  const dd = Math.floor(a / D);
  const hh = Math.floor((a % D) / H);
  const s = dd ? `${dd}d ${hh}h` : `${hh}h`;
  return d < 0 ? `Overdue ${s}` : `${s} left`;
}

export function slaRisk(issue: Issue): 0 | 1 | 2 {
  if (!issue.due || ['resolved', 'closed'].includes(issue.stage)) return 0;
  const d = issue.due - Date.now();
  return d < 0 ? 2 : d < D ? 1 : 0;
}

export function step(stage: Issue['stage']): number {
  return STAGES[stage]?.step ?? 0;
}

export function ago(ts: number): string {
  const m = Math.max(1, Math.round((Date.now() - ts) / 60000));
  return m < 60 ? `${m}m` : m < 1440 ? `${Math.round(m / 60)}h` : `${Math.round(m / 1440)}d`;
}

export function stats(issue: Issue) {
  return {
    citizens: issue.sup,
    contributors: new Set(issue.evidence.map((e) => e.uid || e.by)).size,
    photos: issue.evidence.length,
  };
}
