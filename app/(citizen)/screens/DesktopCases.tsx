'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { matchesFilter, type FilterState } from '@/lib/domain/filters';
import { dedupeCases } from '@/lib/domain/rules';
import { STG_OPTS, SEV_OPTS } from '../components/FilterPanel';
import { searchIssues, CaseCard } from './SearchScreen';
import { CaseRow, CASE_SORT_OPTS, sortCases, type CaseSortMode } from './CasesScreen';

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  onOpen: (caseId: string) => void;
  onFilter: () => void;
  onConfirmFix?: (id: string) => void;
  f: FilterState;
  onFilterChange: (f: FilterState) => void;
  fCount?: number;
}

export function DesktopCases({ issues, supported, onOpen, onFilter, onConfirmFix, f, onFilterChange, fCount = 0 }: Props) {
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'following' | 'all'>('following');
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [sortMode, setSortMode] = useState<CaseSortMode>('latest');
  const [sortOpen, setSortOpen] = useState(false);
  const sortBtnRef = useRef<HTMLButtonElement>(null);
  const [sortMenuPos, setSortMenuPos] = useState<{ top: number; left: number } | null>(null);

  function toggleSort() {
    if (!sortOpen) {
      const r = sortBtnRef.current?.getBoundingClientRect();
      if (r) setSortMenuPos({ top: r.bottom + 2, left: r.left });
    }
    setSortOpen(v => !v);
  }

  const allCases = dedupeCases(issues.filter(i => !!i.caseId));
  const following = allCases.filter(i => i.mine || supported[i.id]);
  const base = tab === 'following' ? following : allCases;
  const filtered = base.filter(i => matchesFilter(i, f));
  const searched = q.trim() ? searchIssues(filtered, q) : filtered;
  const sorted = sortCases(searched, sortMode);

  const baseEmpty = base.length === 0;
  const casesEmptyTxt = tab === 'following'
    ? "Support a report — when it becomes an official case, you'll follow it here."
    : 'No official cases in this region yet.';
  const narrowedEmpty = !baseEmpty && sorted.length === 0;

  const sortL = CASE_SORT_OPTS.find(([k]) => k === sortMode)?.[2] ?? 'Recent';

  const openCardById = (id: string) => {
    const iss = sorted.find(x => x.id === id);
    if (iss?.caseId) onOpen(iss.caseId);
  };

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...f.cat.map(c => ({ key: `cat-${c}`, label: CATS[c as keyof typeof CATS]?.l ?? c, remove: () => onFilterChange({ ...f, cat: f.cat.filter(x => x !== c) }) })),
    ...f.stage.map(s => ({ key: `stage-${s}`, label: STG_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange({ ...f, stage: f.stage.filter(x => x !== s) }) })),
    ...f.sev.map(s => ({ key: `sev-${s}`, label: SEV_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange({ ...f, sev: f.sev.filter(x => x !== s) }) })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Header — full width, matching Feed/Search's un-capped top bar */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap', padding: '22px 32px 0' }}>
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: "400 32px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Cases</span>
          <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Official cases opened after community support crossed 80%.</span>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--cp-surface-2)' }}>
          {([['following', 'Following', following.length], ['all', 'All in Chennai', allCases.length]] as const).map(([k, l, n]) => {
            const on = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)} style={{ height: 38, padding: '0 14px', borderRadius: 999, border: 'none', background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}>
                {l}<span style={{ font: '700 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{n}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--cp-surface-2)' }}>
          {([['list', 'List', 'ph-rows'], ['grid', 'Grid', 'ph-squares-four']] as const).map(([k, l, icon]) => {
            const on = view === k;
            return (
              <button key={k} onClick={() => setView(k)} title={l} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 14px', borderRadius: 999, border: 'none', background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none' }}>
                <i className={`ph-bold ${icon}`} style={{ fontSize: 16 }} />{l}
              </button>
            );
          })}
        </div>
      </div>

      {/* Body — capped at 1240px like Feed/Search's non-sidebar content */}
      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '16px 32px 64px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 18 }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Case ID, street, area, department" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }} />
            {q && (
              <button onClick={() => setQ('')} style={{ border: 'none', background: 'var(--cp-surface-2)', width: 26, height: 26, borderRadius: '50%', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-x" style={{ fontSize: 11 }} />
              </button>
            )}
          </div>

          <button onClick={onFilter} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 18px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)' }}>
            <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />
            Filters
            {fCount > 0 && <span style={{ minWidth: 18, height: 18, padding: '0 5px', boxSizing: 'border-box', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 10.5px/18px Outfit,sans-serif', textAlign: 'center' }}>{fCount}</span>}
          </button>

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button ref={sortBtnRef} onClick={toggleSort} style={{ display: 'flex', alignItems: 'center', gap: 7, height: 48, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink-2)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <i className="ph-bold ph-arrows-down-up" style={{ fontSize: 15 }} />{sortL}
            </button>
            {sortOpen && sortMenuPos && typeof document !== 'undefined' && createPortal(
              <>
                <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
                <div style={{ position: 'fixed', top: sortMenuPos.top, left: sortMenuPos.left, zIndex: 91, width: 'min(280px,calc(100vw - 32px))', padding: 4, borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 16px 36px -14px rgb(0 0 0 / .28)', animation: 'cp-pop2 .18s ease-out both' }}>
                  <span style={{ display: 'block', padding: '8px 10px 6px', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>SORT BY</span>
                  {CASE_SORT_OPTS.map(([k, icon, l]) => (
                    <button key={k} onClick={() => { setSortMode(k); setSortOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 42, padding: '0 10px', border: 'none', borderRadius: 999, background: sortMode === k ? 'var(--cp-surface-2)' : 'none', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left' }}>
                      <i className={`ph-bold ${icon}`} style={{ fontSize: 16, color: 'var(--cp-ink-3)', flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{l}</span>
                      {sortMode === k && <i className="ph-bold ph-check" style={{ color: 'var(--cp-pulse)' }} />}
                    </button>
                  ))}
                </div>
              </>,
              document.body
            )}
          </div>
        </div>

        <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sorted.length} cases</span>

        {activeChips.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
            {activeChips.map(c => (
              <button key={c.key} onClick={c.remove} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', borderRadius: 999, border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', animation: 'cp-pop2 .2s ease-out both' }}>
                {c.label}<i className="ph-bold ph-x" style={{ fontSize: 10, color: 'var(--cp-ink-3)' }} />
              </button>
            ))}
          </div>
        )}

        {view === 'list' && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
            {sorted.map(i => (
              <CaseRow key={i.id} issue={i} mob={false} onOpen={onOpen} needsYou={i.stage === 'resolved' && !!supported[i.id]} onConfirmFix={onConfirmFix} />
            ))}
          </div>
        )}

        {view === 'grid' && sorted.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 12 }}>
            {sorted.map(i => (
              <CaseCard key={i.id} issue={i} onOpen={openCardById} needsYou={i.stage === 'resolved' && !!supported[i.id]} onConfirmFix={onConfirmFix} />
            ))}
          </div>
        )}

        {(baseEmpty || narrowedEmpty) && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif', borderRadius: 20, border: '1.5px dashed var(--cp-line)' }}>
            {baseEmpty ? casesEmptyTxt : 'No cases match these filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
