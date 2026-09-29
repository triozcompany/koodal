import type { Issue } from './types';
import { CATS, CITY, STAGES, SEVW, D, H } from './constants';
import { SLA_PILL } from './stage-style';

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

export function topTags(issues: Issue[], limit = 8): { t: string; n: number }[] {
  const map: Record<string, number> = {};
  issues.forEach(i => (i.tags ?? []).forEach(t => { map[t] = (map[t] ?? 0) + 1; }));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t, n]) => ({ t, n }));
}

/** Cases-list badge — stage-aware: resolved shows citizen-confirmation
 * progress, closed/rejected show a plain label, everything else shows SLA. */
export function caseBadge(issue: Issue): { label: string; bg: string; fg: string } {
  if (issue.stage === 'closed') return { label: 'Closed', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink-2)' };
  if (issue.stage === 'rejected') return { label: 'Not accepted', bg: 'var(--cp-surface-2)', fg: 'var(--cp-ink-3)' };
  if (issue.stage === 'resolved') return { label: `${issue.confirms}/${issue.needed} confirmed`, bg: 'var(--cp-leaf-soft)', fg: 'var(--cp-ink)' };
  const [bg, fg] = SLA_PILL[slaRisk(issue)];
  return { label: slaLeft(issue) || 'On track', bg, fg };
}

/** Two independent duplicate reports can each cross the case threshold and end
 * up sharing one caseId (see castVote's dedup-merge guard) — collapse them to
 * one row per real case here, keeping whichever issue was created first (the
 * original case-creator; a later-merged issue is always chronologically after
 * it, by construction). */
export function dedupeCases(issues: Issue[]): Issue[] {
  const byCase = new Map<string, Issue>();
  for (const i of issues) {
    if (!i.caseId) continue;
    const existing = byCase.get(i.caseId);
    if (!existing || i.created < existing.created) byCase.set(i.caseId, i);
  }
  return Array.from(byCase.values());
}
