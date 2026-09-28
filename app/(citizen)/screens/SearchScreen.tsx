'use client';
import { useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { PILL, SEGC, TRACK } from '@/lib/domain/stage-style';
import { ago, score, step } from '@/lib/domain/rules';

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  meInitials: string;
  meVerified: boolean;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  onFilter: () => void;
  fCount?: number;
}

type SortMode = 'relevant' | 'recent';

const Q_SUGGEST = ['Velachery', 'sewage', 'pothole', 'Madurai garbage', 'streetlight', 'CP-2107'];

function searchIssues(issues: Issue[], q: string): Issue[] {
  const qt = q.trim().toLowerCase();
  if (!qt) return [];
  const words = qt.replace(/^#/, '').split(/\s+/);
  return issues.filter(i => {
    const hay = `${i.title} ${i.area} ${i.street} ${i.city} ${CATS[i.cat]?.l ?? ''} ${i.id} ${i.caseId ?? ''} ${i.dept} ${(i.tags ?? []).join(' ')}`.toLowerCase();
    return words.every(w => hay.includes(w));
  });
}

function topTags(issues: Issue[]): { t: string; n: number }[] {
  const map: Record<string, number> = {};
  issues.forEach(i => (i.tags ?? []).forEach(t => { map[t] = (map[t] ?? 0) + 1; }));
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t, n]) => ({ t, n }));
}

function TileCard({ issue, onOpen }: { issue: Issue; onOpen: (id: string) => void }) {
  const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
  const photoN   = Math.max(1, (issue.merged?.length ?? 0) + 1);
  const locked   = !!issue.caseId;
  const metaStr  = `${issue.area} · ${ago(issue.created)} ago`;
  const citN     = issue.sup;
  const cmtN     = issue.comments?.length ?? 0;

  return (
    <div
      onClick={() => onOpen(issue.id)}
      style={{ display: 'flex', flexDirection: 'column', borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', overflow: 'hidden', cursor: 'pointer', minWidth: 0, animation: 'cp-row .3s ease-out both' }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)' }}>
        <span style={{ position: 'absolute', left: 10, top: 10, height: 22, padding: '0 8px', borderRadius: 11, background: pc, color: pfg, font: '600 11px/22px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{pl}</span>
        <span style={{ position: 'absolute', right: 10, top: 10, width: 30, height: 30, borderRadius: 10, background: 'var(--cp-ink)', color: 'var(--cp-bg)', display: 'grid', placeItems: 'center', fontSize: 15 }}>
          <i className={`ph-bold ${CATS[issue.cat]?.icon}`} />
        </span>
        <span style={{ position: 'absolute', left: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 5, height: 24, padding: '0 8px', borderRadius: 12, background: 'var(--cp-surface)', font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <i className="ph-bold ph-images" />
          {photoN}
        </span>
        {locked && (
          <span style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 5, height: 24, padding: '0 8px', borderRadius: 12, background: 'var(--cp-peacock)', color: '#fff', font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
            <i className="ph-fill ph-bank" />Case
          </span>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, padding: 12, flex: 1, minWidth: 0 }}>
        <span style={{ font: '600 13.5px/1.3 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{issue.title}</span>
        <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metaStr}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-bold ph-arrow-fat-up" />{citN}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-bold ph-chat-circle" />{cmtN}
          </span>
          <div style={{ flex: 1 }} />
          <button
            onClick={e => e.stopPropagation()}
            title="Share"
            style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}
          >
            <i className="ph-bold ph-share-fat" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CaseCard({ issue, onOpen }: { issue: Issue; onOpen: (id: string) => void }) {
  const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
  const photoN   = Math.max(1, (issue.merged?.length ?? 0) + 1);
  const contribN = Math.max(1, (issue.merged?.length ?? 0) + 1);
  const st       = step(issue.stage);
  const oi       = (issue.assignee ?? issue.dept ?? 'GCC').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      onClick={() => onOpen(issue.id)}
      style={{ display: 'flex', flexDirection: 'column', gap: 14, padding: 16, borderRadius: 20, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', cursor: 'pointer', animation: 'cp-row .3s ease-out both' }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 14, overflow: 'hidden', background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)', border: '1px solid var(--cp-line)' }}>
        <div style={{ position: 'absolute', left: 10, top: 10, width: 32, height: 32, borderRadius: 10, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
          <i className={`ph-bold ${CATS[issue.cat]?.icon}`} style={{ color: 'var(--cp-bg)', fontSize: 16 }} />
        </div>
        <span style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 6, height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--cp-surface)', font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <i className="ph-bold ph-images" />{photoN} · {contribN} people
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: pc, color: pfg, display: 'grid', placeItems: 'center', fontSize: 20 }}>
          <i className={`ph-bold ${CATS[issue.cat]?.icon}`} />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            <span style={{ color: 'var(--cp-ink-2)' }}>{issue.caseId}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--cp-ink-3)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.area}</span>
          </span>
          <span style={{ font: '600 14.5px/1.3 Outfit,sans-serif', textWrap: 'pretty' } as React.CSSProperties}>{issue.title}</span>
        </div>
        <span style={{ flexShrink: 0, height: 26, padding: '0 9px', borderRadius: 13, background: 'var(--cp-peacock-soft)', color: 'var(--cp-peacock)', font: '600 11.5px/26px Outfit,sans-serif', whiteSpace: 'nowrap' }}>{pl}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', gap: 4 }}>
        {[0, 1, 2, 3, 4].map(j => (
          <div key={j} style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span style={{ height: 4, borderRadius: 2, background: issue.stage === 'rejected' ? 'var(--cp-line)' : j <= st ? SEGC[st] : 'var(--cp-line)', transition: 'background .3s' }} />
            <span style={{ font: '500 11px/1 Outfit,sans-serif', color: j <= st ? 'var(--cp-ink)' : 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{TRACK[j][1]}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 12, borderTop: '1px solid var(--cp-line)' }}>
        <span style={{ width: 26, height: 26, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-surface-2)', font: '700 10px/26px Outfit,sans-serif', textAlign: 'center', color: 'var(--cp-ink-2)' }}>{oi}</span>
        <span style={{ flex: 1, minWidth: 0, font: '500 12.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.assignee ?? 'Unassigned'} · {issue.dept || 'GCC'}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
          <i className="ph-bold ph-users" />{issue.sup}
        </span>
      </div>
    </div>
  );
}

export function SearchScreen({ issues, supported, meInitials, meVerified, onOpen, onSupport, onFilter, fCount = 0 }: Props) {
  const [q, setQ]             = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('relevant');
  const [sortOpen, setSortOpen] = useState(false);

  const results    = searchIssues(issues, q);
  const sorted     = sortMode === 'relevant'
    ? [...results].sort((a, b) => score(b) - score(a))
    : [...results].sort((a, b) => b.created - a.created);
  const sCases     = sorted.filter(i => !!i.caseId);
  const sReports   = sorted.filter(i => !i.caseId);
  const tags       = topTags(issues);
  const latestNear = issues.filter(i => i.city === 'Chennai' && i.km < 3 && i.stage !== 'rejected').sort((a, b) => b.created - a.created).slice(0, 6);
  const showIdle   = !q;
  const showRes    = !!q && sorted.length > 0;
  const qNone      = !!q && sorted.length === 0;
  const sortL      = sortMode === 'relevant' ? 'Relevant' : 'Recent';
  const sPad       = '8px 16px';

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '14px 16px 10px', flexShrink: 0 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 9, height: 48, padding: '0 13px', borderRadius: 15, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 1px 2px rgb(0 0 0 / .05)' }}>
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
          title="Profile"
          style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer' }}
        >
          {meInitials}
          {meVerified && (
            <span style={{ position: 'absolute', right: -6, bottom: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--cp-peacock)', border: '2px solid var(--cp-surface)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10 }}>
              <i className="ph-bold ph-check" />
            </span>
          )}
        </button>
      </div>

      {/* Filter/sort bar */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 16px 10px', flexShrink: 0 }}>
          <button
            onClick={onFilter}
            style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7, height: 38, padding: '0 13px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)' }}
          >
            <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />
            Filters
            {fCount > 0 && <span style={{ minWidth: 18, height: 18, padding: '0 5px', boxSizing: 'border-box', borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 10.5px/18px Outfit,sans-serif', textAlign: 'center' }}>{fCount}</span>}
          </button>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              onClick={() => setSortOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, height: 38, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink-2)', font: '500 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              <i className="ph-bold ph-arrows-down-up" style={{ fontSize: 14 }} />
              {sortL}
              <i className="ph-bold ph-caret-down" style={{ fontSize: 11, transform: sortOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            {sortOpen && (
              <>
                <div onClick={() => setSortOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 20 }} />
                <div style={{ position: 'absolute', top: 'calc(100% + 2px)', left: 0, zIndex: 21, width: 'min(280px,calc(100vw - 32px))', padding: 4, borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', boxShadow: '0 16px 36px -14px rgb(0 0 0 / .28)', animation: 'cp-pop2 .18s ease-out both' }}>
                  <span style={{ display: 'block', padding: '8px 10px 6px', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>SORT BY</span>
                  {([['relevant', 'ph-chart-bar', 'Relevant'], ['recent', 'ph-clock', 'Recent']] as const).map(([k, icon, l]) => (
                    <button key={k} onClick={() => { setSortMode(k); setSortOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', height: 42, padding: '0 10px', border: 'none', borderRadius: 999, background: sortMode === k ? 'var(--cp-surface-2)' : 'none', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left' }}>
                      <i className={`ph-bold ${icon}`} style={{ fontSize: 16, color: 'var(--cp-ink-3)', flexShrink: 0 }} />
                      <span style={{ flex: 1 }}>{l}</span>
                      {sortMode === k && <i className="ph-bold ph-check" style={{ color: 'var(--cp-pulse)' }} />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>

        {/* Idle state */}
        {showIdle && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, padding: sPad }}>

            {/* Trending tags */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>TRENDING TAGS</span>
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 2, margin: '0 -2px' }}>
                {tags.map(t => (
                  <button key={t.t} onClick={() => setQ('#' + t.t)} style={{ flexShrink: 0, height: 36, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ color: 'var(--cp-peacock)' }}>#</span>{t.t}
                    <span style={{ font: '600 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{t.n}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Try suggestions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>TRY</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {Q_SUGGEST.map(s => (
                  <button key={s} onClick={() => setQ(s)} style={{ height: 36, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Latest around you — tile grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>LATEST AROUND YOU</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {latestNear.map(i => <TileCard key={i.id} issue={i} onOpen={onOpen} />)}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {showRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22, padding: sPad }}>
            <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sorted.length} results</span>
            {sCases.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ font: "400 18px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Cases</span>
                  <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sCases.length}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12 }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {sReports.map(i => <TileCard key={i.id} issue={i} onOpen={onOpen} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* No results */}
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
