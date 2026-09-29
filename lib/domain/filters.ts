import type { Issue } from './types';

export interface FilterState {
  region: string;
  cat: string[];
  stage: string[];
  sev: string[];
  tag: string | null;
}

export const DEFAULT_FILTER: FilterState = { region: 'near', cat: [], stage: [], sev: [], tag: null };

const STAGE_GROUPS: Record<string, string[]> = {
  new: ['reported'], gathering: ['community'], govt: ['review'],
  case: ['verified', 'assigned'], progress: ['progress'], fixed: ['resolved', 'closed'],
};

function matchesRegion(i: Issue, f: FilterState): boolean {
  // 'near' (the default) shows everything — there's no real per-viewer
  // distance tracked yet (every report is saved with a placeholder km), so
  // hardcoding a single city here just silently hid reports from anywhere
  // else. An explicit city/area pick still narrows normally.
  return f.region === 'near' ? true : (i.city === f.region || i.area === f.region);
}

/** Category/status/severity predicate, without the region check — Search has no
 * region-picker UI, so it narrows by this alone rather than forcing "near me". */
export function matchesFilter(i: Issue, f: FilterState): boolean {
  if (f.cat.length > 0 && !f.cat.includes(i.cat)) return false;
  if (f.sev.length > 0 && !f.sev.includes(i.sev)) return false;
  if (f.stage.length > 0) {
    const allowed = f.stage.flatMap(s => STAGE_GROUPS[s] ?? []);
    if (!allowed.includes(i.stage)) return false;
  }
  if (f.tag && !(i.tags ?? []).includes(f.tag)) return false;
  return true;
}

export function applyFilter(issues: Issue[], f: FilterState): Issue[] {
  return issues.filter(i => matchesRegion(i, f) && matchesFilter(i, f));
}

export function countActiveFilters(f: FilterState): number {
  return f.cat.length + f.stage.length + f.sev.length + (f.tag ? 1 : 0);
}
