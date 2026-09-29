'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Issue } from '@/lib/domain/types';
import { CATS, issueIcon } from '@/lib/domain/constants';
import { SEGC, TRACK } from '@/lib/domain/stage-style';
import { step, caseBadge, dedupeCases, slaRisk } from '@/lib/domain/rules';
import { matchesFilter } from '@/lib/domain/filters';
import type { FilterState } from '@/lib/domain/filters';
import { STG_OPTS, SEV_OPTS } from '../components/FilterPanel';
import { searchIssues, CaseCard } from './SearchScreen';

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  meInitials: string;
  meVerified: boolean;
  onOpen: (caseId: string) => void;
  onFilter: () => void;
  onConfirmFix?: (id: string) => void;
  onProfile: () => void;
  f?: FilterState;
  onFilterChange?: (f: FilterState) => void;
  fCount?: number;
}

export type CaseSortMode = 'latest' | 'support' | 'sla';

export const CASE_SORT_OPTS: [CaseSortMode, string, string][] = [
  ['latest', 'ph-clock', 'Recent'],
  ['support', 'ph-users', 'Most supported'],
  ['sla', 'ph-warning', 'SLA urgency'],
];

export function sortCases(rows: Issue[], mode: CaseSortMode): Issue[] {
  switch (mode) {
    case 'latest': return [...rows].sort((a, b) => b.created - a.created);
    case 'support': return [...rows].sort((a, b) => b.sup - a.sup);
    case 'sla': return [...rows].sort((a, b) => slaRisk(b) - slaRisk(a) || (a.due ?? Infinity) - (b.due ?? Infinity));
  }
}

function StepTrack({ issue }: { issue: Issue }) {
  const st = step(issue.stage);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,64px))', gap: 4 }}>
      {[0, 1, 2, 3, 4].map(j => (
        <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
          <span style={{ height: 4, borderRadius: 2, background: issue.stage === 'rejected' ? 'var(--cp-line)' : j <= st ? SEGC[st] : 'var(--cp-line)' }} />
          <span style={{ font: '500 10.5px/1 Outfit,sans-serif', color: j <= st ? 'var(--cp-ink)' : 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{TRACK[j][1]}</span>
        </div>
      ))}
    </div>
  );
}

export function CaseRow({ issue, mob, onOpen, needsYou, onConfirmFix }: { issue: Issue; mob: boolean; onOpen: (caseId: string) => void; needsYou?: boolean; onConfirmFix?: (id: string) => void }) {
  const icon = issueIcon(issue);
  const photoN = Math.max(1, (issue.merged?.length ?? 0) + 1);
  const area = `${issue.area}, ${issue.city}`;
  const badge = caseBadge(issue);
  const thumbSize = mob ? 84 : 96;
  const confirmBtn = needsYou && (
    <button
      onClick={e => { e.stopPropagation(); onConfirmFix?.(issue.id); }}
      style={{ height: mob ? 22 : 24, padding: mob ? '0 8px' : '0 9px', borderRadius: mob ? 11 : 12, border: 'none', background: 'var(--cp-leaf)', color: '#fff', font: `600 ${mob ? 11 : 11.5}px/${mob ? 22 : 24}px Outfit,sans-serif`, whiteSpace: 'nowrap', cursor: 'pointer', marginLeft: mob ? 0 : 4 }}
    >
      Confirm fix
    </button>
  );

  const thumb = (
    <div style={{ position: 'relative', width: thumbSize, height: 72, borderRadius: 14, overflow: 'hidden', border: '1px solid var(--cp-line)', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 8px,var(--cp-ph-b) 8px 16px)' }}>
      <span style={{ position: 'absolute', left: 6, top: 6, width: 24, height: 24, borderRadius: 8, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
        <i className={`ph-bold ${icon}`} style={{ fontSize: 13, color: 'var(--cp-bg)' }} />
      </span>
      <span style={{ position: 'absolute', right: 5, bottom: 5, height: 18, padding: '0 5px', borderRadius: 5, background: 'var(--cp-surface)', font: '700 10px/18px Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}>
        <i className="ph-bold ph-images" />{photoN}
      </span>
    </div>
  );

  const caption = (
    <span style={{ font: `500 ${mob ? 11.5 : 12}px/1.1 Outfit,sans-serif`, color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      <span style={{ color: 'var(--cp-ink-2)' }}>{issue.caseId}</span> · {area}
    </span>
  );

  if (mob) {
    return (
      <div onClick={() => issue.caseId && onOpen(issue.caseId)} style={{ display: 'grid', gridTemplateColumns: '84px minmax(0,1fr)', gap: 12, alignItems: 'center', padding: 12, borderBottom: '1px solid var(--cp-line)', cursor: 'pointer' }}>
        {thumb}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          {caption}
          <span style={{ font: '600 14px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{issue.title}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: badge.bg, color: badge.fg, font: '600 11px/22px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{badge.label}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
              <i className="ph-bold ph-users" />{issue.sup}
            </span>
            {confirmBtn}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => issue.caseId && onOpen(issue.caseId)}
      style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr) auto', gap: 16, alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer' }}
    >
      {thumb}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, minWidth: 0 }}>
        {caption}
        <span style={{ font: '600 14.5px/1.25 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.title}</span>
        <StepTrack issue={issue} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
        <span style={{ height: 26, padding: '0 10px', borderRadius: 13, background: badge.bg, color: badge.fg, font: '600 11.5px/26px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{badge.label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
          <i className="ph-bold ph-users" />{issue.sup}
          {confirmBtn}
        </span>
      </div>
    </div>
  );
}

export function CasesScreen({ issues, supported, meInitials, meVerified, onOpen, onFilter, onConfirmFix, onProfile, f, onFilterChange, fCount = 0 }: Props) {
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
  const filtered = f ? base.filter(i => matchesFilter(i, f)) : base;
  const searched = q.trim() ? searchIssues(filtered, q) : filtered;
  const sorted = sortCases(searched, sortMode);

  const baseEmpty = base.length === 0;
  const casesEmptyTxt = tab === 'following'
    ? "Support a report — when it becomes an official case, you'll follow it here."
    : 'No official cases in this region yet.';
  const narrowedEmpty = !baseEmpty && sorted.length === 0;

  const sortL = CASE_SORT_OPTS.find(([k]) => k === sortMode)?.[2] ?? 'Recent';

  // CaseCard (shared with SearchScreen) calls onOpen with the issue's doc id, not
  // its human caseId — Search wants the former (/issues/[id]), Cases wants the
  // latter (/cases/[caseId]), so translate here rather than changing CaseCard's
  // contract for one caller.
  const openCardById = (id: string) => {
    const iss = sorted.find(x => x.id === id);
    if (iss?.caseId) onOpen(iss.caseId);
  };

  const activeChips: { key: string; label: string; remove: () => void }[] = f ? [
    ...f.cat.map(c => ({ key: `cat-${c}`, label: CATS[c as keyof typeof CATS]?.l ?? c, remove: () => onFilterChange?.({ ...f, cat: f.cat.filter(x => x !== c) }) })),
    ...f.stage.map(s => ({ key: `stage-${s}`, label: STG_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange?.({ ...f, stage: f.stage.filter(x => x !== s) }) })),
    ...f.sev.map(s => ({ key: `sev-${s}`, label: SEV_OPTS.find(([k]) => k === s)?.[1] ?? s, remove: () => onFilterChange?.({ ...f, sev: f.sev.filter(x => x !== s) }) })),
  ] : [];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', flexShrink: 0 }}>
        <span style={{ flex: 1, font: "400 26px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Cases</span>
        <button onClick={onProfile} title="Profile" style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer' }}>
          {meInitials}
          {meVerified && (
            <span style={{ position: 'absolute', right: -6, bottom: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--cp-peacock)', border: '2px solid var(--cp-surface)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10 }}>
              <i className="ph-bold ph-check" />
            </span>
          )}
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 110px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 2 }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, padding: 4, borderRadius: 999, background: 'var(--cp-surface-2)' }}>
            {([['following', 'Following', following.length], ['all', 'All', allCases.length]] as const).map(([k, l, n]) => {
              const on = tab === k;
              return (
                <button key={k} onClick={() => setTab(k)} style={{ flex: 1, minWidth: 0, height: 36, padding: '0 10px', borderRadius: 999, border: 'none', background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, overflow: 'hidden' }}>
                  {l}<span style={{ font: '700 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{n}</span>
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
              <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 17 }} />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Case ID, street, area" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }} />
              {q && (
                <button onClick={() => setQ('')} style={{ border: 'none', background: 'var(--cp-surface-2)', width: 24, height: 24, borderRadius: '50%', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                  <i className="ph-bold ph-x" style={{ fontSize: 10 }} />
                </button>
              )}
            </div>
            <button onClick={onFilter} title="Filters" style={{ position: 'relative', flexShrink: 0, width: 46, height: 46, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 17, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)' }}>
              <i className="ph-bold ph-sliders-horizontal" />
              {fCount > 0 && <span style={{ position: 'absolute', top: -3, right: -3, minWidth: 18, height: 18, padding: '0 5px', boxSizing: 'border-box', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 10.5px/18px Outfit,sans-serif', textAlign: 'center' }}>{fCount}</span>}
            </button>
          </div>

          {/* Sort + count + view toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button ref={sortBtnRef} onClick={toggleSort} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 34, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink-2)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <i className="ph-bold ph-arrows-down-up" style={{ fontSize: 13 }} />{sortL}
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
            <span style={{ flex: 1, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{sorted.length} cases</span>
            <div style={{ display: 'flex', gap: 2, padding: 3, borderRadius: 999, background: 'var(--cp-surface-2)' }}>
              {([['list', 'List', 'ph-rows'], ['grid', 'Grid', 'ph-squares-four']] as const).map(([k, l, icon]) => {
                const on = view === k;
                return (
                  <button key={k} onClick={() => setView(k)} title={l} style={{ width: 36, height: 30, borderRadius: 999, border: 'none', background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', cursor: 'pointer', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none', fontSize: 15 }}>
                    <i className={`ph-bold ${icon}`} />
                  </button>
                );
              })}
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
        </div>

        {view === 'list' && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', overflow: 'hidden' }}>
            {sorted.map(i => (
              <CaseRow key={i.id} issue={i} mob onOpen={onOpen} needsYou={i.stage === 'resolved' && !!supported[i.id]} onConfirmFix={onConfirmFix} />
            ))}
          </div>
        )}

        {view === 'grid' && sorted.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: 12 }}>
            {sorted.map(i => (
              <CaseCard key={i.id} issue={i} onOpen={openCardById} needsYou={i.stage === 'resolved' && !!supported[i.id]} onConfirmFix={onConfirmFix} />
            ))}
          </div>
        )}

        {(baseEmpty || narrowedEmpty) && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>
            {baseEmpty ? casesEmptyTxt : 'No cases match these filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
