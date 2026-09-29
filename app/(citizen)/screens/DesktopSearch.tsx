'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { matchesFilter, type FilterState } from '@/lib/domain/filters';
import { STG_OPTS, SEV_OPTS } from '../components/FilterPanel';
import { TileCard, CaseCard, searchIssues, sortResults, SORT_OPTS, type SortMode } from './SearchScreen';
import { dedupeCases } from '@/lib/domain/rules';

interface Props {
  issues: Issue[];
  f: FilterState;
  onFilterChange: (f: FilterState) => void;
  onOpen: (id: string) => void;
  onEdit?: (id: string) => void;
  onFilter: () => void;
  fCount?: number;
}

export function DesktopSearch({ issues, f, onFilterChange, onOpen, onEdit, onFilter, fCount = 0 }: Props) {
  const [q, setQ] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('relevant');
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

  const filteredIssues = issues.filter(i => matchesFilter(i, f));
  const results    = searchIssues(filteredIssues, q);
  const sorted     = sortResults(results, sortMode);
  const sCases     = dedupeCases(sorted.filter(i => !!i.caseId));
  const sReports   = sorted.filter(i => !i.caseId);
  const latestNear = filteredIssues.filter(i => i.city === 'Chennai' && i.km < 3 && i.stage !== 'rejected').sort((a, b) => b.created - a.created).slice(0, 8);
  const hasTagOrQuery = !!q || !!f.tag;
  const showIdle   = !hasTagOrQuery;
  const showRes    = hasTagOrQuery && sorted.length > 0;
  const qNone      = hasTagOrQuery && sorted.length === 0;
  const sortL      = SORT_OPTS.find(([k]) => k === sortMode)?.[2] ?? 'Relevant';

  const activeChips: { key: string; label: string; remove: () => void }[] = [
    ...f.cat.map(c => ({ key: `cat-${c}`, label: CATS[c as keyof typeof CATS]?.l ?? c, remove: () => onFilterChange({ ...f, cat: f.cat.filter(x => x !== c) }) })),
    ...f.stage.map(s => ({ key: `stage-${s}`, label: STG_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange({ ...f, stage: f.stage.filter(x => x !== s) }) })),
    ...f.sev.map(s => ({ key: `sev-${s}`, label: SEV_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange({ ...f, sev: f.sev.filter(x => x !== s) }) })),
    ...(f.tag ? [{ key: 'tag', label: `#${f.tag}`, remove: () => onFilterChange({ ...f, tag: null }) }] : []),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Header — full width, matching Feed's un-capped top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, minHeight: 44, padding: '22px 32px 0' }}>
        <span style={{ font: "400 32px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Search</span>
      </div>

      {/* Body — capped at 1240px like Feed's non-sidebar content */}
      <div style={{ maxWidth: 1240, margin: '0 auto', width: '100%', padding: '16px 32px 64px', display: 'flex', flexDirection: 'column', gap: 16, boxSizing: 'border-box' }}>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 320px', minWidth: 0, display: 'flex', alignItems: 'center', gap: 9, height: 48, padding: '0 16px', borderRadius: 999, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
          <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 18 }} />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Street, area, #tag or case ID"
            style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }}
          />
          {q && (
            <button onClick={() => setQ('')} style={{ border: 'none', background: 'var(--cp-surface-2)', width: 26, height: 26, borderRadius: '50%', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-x" style={{ fontSize: 11 }} />
            </button>
          )}
        </div>

        <button
          onClick={onFilter}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, height: 48, padding: '0 18px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)' }}
        >
          <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />
          Filters
          {fCount > 0 && <span style={{ minWidth: 18, height: 18, padding: '0 5px', boxSizing: 'border-box', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 10.5px/18px Outfit,sans-serif', textAlign: 'center' }}>{fCount}</span>}
        </button>

        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            ref={sortBtnRef}
            onClick={toggleSort}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 48, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink-2)', font: '500 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <i className="ph-bold ph-arrows-down-up" style={{ fontSize: 14 }} />
            {sortL}
            <i className="ph-bold ph-caret-down" style={{ fontSize: 11, transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
          </button>
          {sortOpen && sortMenuPos && typeof document !== 'undefined' && createPortal(
            <>
              <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90 }} />
              <div style={{ position: 'fixed', top: sortMenuPos.top, left: sortMenuPos.left, zIndex: 91, width: 'min(280px,calc(100vw - 32px))', padding: 4, borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 16px 36px -14px rgb(0 0 0 / .28)', animation: 'cp-pop2 .18s ease-out both' }}>
                <span style={{ display: 'block', padding: '8px 10px 6px', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>SORT BY</span>
                {SORT_OPTS.map(([k, icon, l]) => (
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

      {activeChips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {activeChips.map(c => (
            <button key={c.key} onClick={c.remove} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, height: 32, padding: '0 10px', borderRadius: 999, border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', animation: 'cp-pop2 .2s ease-out both' }}>
              {c.label}<i className="ph-bold ph-x" style={{ fontSize: 10, color: 'var(--cp-ink-3)' }} />
            </button>
          ))}
        </div>
      )}

      {showIdle && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>LATEST AROUND YOU</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
              {latestNear.map(i => <TileCard key={i.id} issue={i} onOpen={onOpen} onEdit={onEdit} />)}
            </div>
          </div>
        </div>
      )}

      {showRes && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sorted.length} results</span>
          {sCases.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ font: "400 18px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Cases</span>
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sCases.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 12 }}>
                {sCases.map(i => <CaseCard key={i.id} issue={i} onOpen={onOpen} />)}
              </div>
            </div>
          )}
          {sReports.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ font: "400 18px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Reports</span>
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sReports.length}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 }}>
                {sReports.map(i => <TileCard key={i.id} issue={i} onOpen={onOpen} onEdit={onEdit} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {qNone && (
        <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>
          Nothing matches.
          <br />
          <button style={{ marginTop: 12, border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer' }}>Report it →</button>
        </div>
      )}
      </div>
    </div>
  );
}
