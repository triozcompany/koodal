'use client';
import { useCallback, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import type { Issue } from '@/lib/domain/types';
import { DEFAULT_FILTER, applyFilter, countActiveFilters, type FilterState } from '@/lib/domain/filters';

function parseFilters(params: URLSearchParams): FilterState {
  return {
    region: params.get('region') ?? DEFAULT_FILTER.region,
    cat: params.get('cat')?.split(',').filter(Boolean) ?? [],
    stage: params.get('stage')?.split(',').filter(Boolean) ?? [],
    sev: params.get('sev')?.split(',').filter(Boolean) ?? [],
    tag: params.get('tag'),
  };
}

function serializeFilters(f: FilterState): string {
  const params = new URLSearchParams();
  if (f.region !== DEFAULT_FILTER.region) params.set('region', f.region);
  if (f.cat.length) params.set('cat', f.cat.join(','));
  if (f.stage.length) params.set('stage', f.stage.join(','));
  if (f.sev.length) params.set('sev', f.sev.join(','));
  if (f.tag) params.set('tag', f.tag);
  return params.toString();
}

/** Filter state lives in the URL (shareable, survives back/forward) instead of component state. */
export function useFilters(issues: Issue[]) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const f = useMemo(() => parseFilters(searchParams), [searchParams]);

  const setF = useCallback((next: FilterState) => {
    const qs = serializeFilters(next);
    // Native history API: Next syncs useSearchParams with it, and unlike router.replace it makes no server round trip.
    window.history.replaceState(null, '', qs ? `${pathname}?${qs}` : pathname);
  }, [pathname]);

  const filtered = useMemo(() => applyFilter(issues, f), [issues, f]);
  const fCount = countActiveFilters(f);

  return { f, setF, filtered, fCount };
}
