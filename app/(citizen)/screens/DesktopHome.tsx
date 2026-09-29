'use client';
import { useEffect, useRef, useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { issueIcon } from '@/lib/domain/constants';
import { PILL, SEGC } from '@/lib/domain/stage-style';
import { step, ago } from '@/lib/domain/rules';
import type { FilterState } from '@/lib/domain/filters';
import { PIN_PREVIEW_DARK } from '@/lib/domain/map-pin-theme';
import { useApp } from '@/lib/app-context';
import { searchIssues } from './SearchScreen';
import { NearbyMap } from '../components/NearbyMap';
import styles from './DesktopHome.module.css';

interface Props {
  issues: Issue[];
  f: FilterState;
  onFilter: () => void;
  onLocation: () => void;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  supported: Record<string, boolean>;
  fCount: number;
  onSearch: () => void;
  wide: boolean;
  mapMaximized: boolean;
  onMapMaximize: () => void;
  onMapMinimize: () => void;
}

export function DesktopHome({ issues, f, onFilter, onLocation, onOpen, onSupport, supported, fCount, wide, mapMaximized, onMapMaximize, onMapMinimize }: Props) {
  const {
    nearbySelectedId, setNearbySelectedId,
    nearbyListOpen, setNearbyListOpen,
    nearbyListScroll, setNearbyListScroll,
    nearbyMapCamera, setNearbyMapCamera,
  } = useApp();

  // Seeded once from context (survives navigating to /issues/[id] and back),
  // then kept local — hover keeps updating `selId` locally with zero context
  // writes; only the unmount-sync effect below writes back to context.
  const [listOpen, setListOpen] = useState(nearbyListOpen);
  const [selId, setSelId]           = useState<string | null>(nearbySelectedId);
  const [focusId, setFocusId]       = useState<string | null>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const restoredScrollRef = useRef(false);

  useEffect(() => {
    if (restoredScrollRef.current || !listScrollRef.current || issues.length === 0) return;
    restoredScrollRef.current = true;
    listScrollRef.current.scrollTop = nearbyListScroll;
  }, [issues.length, nearbyListScroll]);

  const listOpenRef = useRef(listOpen); listOpenRef.current = listOpen;
  const selIdRef = useRef(selId); selIdRef.current = selId;
  useEffect(() => {
    return () => {
      setNearbyListOpen(listOpenRef.current);
      setNearbySelectedId(selIdRef.current);
      if (listScrollRef.current) setNearbyListScroll(listScrollRef.current.scrollTop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search — debounced so typing doesn't re-filter the list (and rebuild
  // every map marker) on each keystroke.
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const displayIssues = debouncedQuery.trim() ? searchIssues(issues, debouncedQuery) : issues;

  const listW       = listOpen ? (wide ? '420px' : '350px') : '0px';
  const regionName  = f.region === 'near' ? 'Velachery' : f.region;
  const dTitle      = f.region === 'near' ? 'Nearby' : f.region;
  const dCount      = `${displayIssues.length} issues`;

  const toggleMapFull = () => {
    if (mapMaximized) {
      onMapMinimize();
      setListOpen(true);
    } else {
      onMapMaximize();
      setListOpen(false);
    }
  };

  function cardData(issue: Issue) {
    const st         = step(issue.stage);
    const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
    const on         = !!supported[issue.id];
    const dist       = issue.city === 'Chennai' && issue.km < 3
      ? (issue.km < 1 ? Math.round(issue.km * 1000) + ' m' : issue.km + ' km')
      : issue.city;
    return {
      icon: issueIcon(issue),
      meta: `${issue.area} · ${dist} · ${ago(issue.created)}`,
      title: issue.title,
      pc, pfg, pl,
      segs: [0, 1, 2, 3, 4].map(j => ({
        c: issue.stage === 'rejected' ? 'var(--cp-line)' : j <= st ? SEGC[st] : 'var(--cp-line)',
      })),
      sevHot: issue.sev === 'critical',
      n:  issue.sup,
      sb: on ? 'var(--cp-pulse)' : 'var(--cp-surface)',
      sf: on ? '#fff' : 'var(--cp-ink)',
      si: on ? 'ph-fill ph-arrow-fat-up' : 'ph-bold ph-arrow-fat-up',
    };
  }

  const selIssue = selId ? (issues.find(i => i.id === selId) ?? null) : null;
  const hasSel   = !!selIssue;
  const selData  = hasSel && selIssue ? (() => {
    const it    = cardData(selIssue);
    const selOn = !!supported[selIssue.id];
    return { ...it, sbD: selOn ? 'var(--cp-pulse)' : PIN_PREVIEW_DARK.supportBtnBg, conf: selIssue.conf };
  })() : null;
  // Prev/next cycle through whichever issues are currently visible (the same
  // set pinned on the map), not the full unfiltered list.
  const selIdx = selIssue ? displayIssues.findIndex(i => i.id === selIssue.id) : -1;
  const selHasPrev = selIdx > 0;
  const selHasNext = selIdx >= 0 && selIdx < displayIssues.length - 1;
  const goSelPrev = () => { if (selHasPrev) { const id = displayIssues[selIdx - 1].id; setSelId(id); setFocusId(id); } };
  const goSelNext = () => { if (selHasNext) { const id = displayIssues[selIdx + 1].id; setSelId(id); setFocusId(id); } };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: `${listW} minmax(0,1fr)`, transition: 'grid-template-columns .35s cubic-bezier(.2,.9,.3,1)', height: '100vh', animation: 'cp-row .3s ease-out both' }}>

      {/* ── LEFT: issue list ── */}
      <section style={{ display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0, overflow: 'hidden', background: 'var(--cp-surface)', borderRight: '1px solid var(--cp-line)' }}>

        <div style={{ padding: '22px 20px 12px', display: 'flex', flexDirection: 'column', gap: 12, borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ font: "400 26px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>{dTitle}</span>
            <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{dCount}</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setListOpen(false)}
              title="Hide list"
              style={{ width: 34, height: 34, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', fontSize: 15, alignSelf: 'center', display: 'grid', placeItems: 'center' }}
            >
              <i className="ph-bold ph-caret-double-left" />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 40, padding: '0 13px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 14, color: 'var(--cp-ink-3)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search issues"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', color: 'var(--cp-ink-3)', cursor: 'pointer', fontSize: 13, display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-x" />
              </button>
            )}
          </div>
        </div>

        <div ref={listScrollRef} style={{ flex: 1, overflowY: 'auto' }}>
          {displayIssues.length === 0
            ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>
                {searchQuery.trim() ? 'No issues match your search.' : 'Nothing matches these filters.'}
              </div>
            )
            : displayIssues.map(issue => {
                const it  = cardData(issue);
                const bar = selId === issue.id ? 'var(--cp-pulse)' : 'transparent';
                return (
                  <div key={issue.id} onMouseEnter={() => setSelId(issue.id)} style={{ boxShadow: `inset 3px 0 0 ${bar}` }}>
                    <div
                      className={styles.rowInner}
                      onClick={() => { setSelId(issue.id); setFocusId(issue.id); }}
                      style={{ display: 'grid', gridTemplateColumns: '46px minmax(0,1fr) 54px', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', alignItems: 'start', background: 'var(--cp-surface)' }}
                    >
                      <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
                        <i className={`ph-bold ${it.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                        <div style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.meta}</div>
                        <div style={{ font: '600 14px/1.25 Outfit,sans-serif', textWrap: 'pretty' } as React.CSSProperties}>{it.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: it.pc, color: it.pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{it.pl}</span>
                          <span style={{ display: 'flex', gap: 3 }}>
                            {it.segs.map((sg, j) => <span key={j} style={{ width: 12, height: 4, borderRadius: 2, background: sg.c }} />)}
                          </span>
                          {it.sevHot && <i className="ph-fill ph-warning" style={{ color: 'var(--cp-pulse)', fontSize: 14 }} />}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onSupport(issue.id); }}
                        className={styles.supportBtn}
                        style={{ width: 54, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: it.sb, color: it.sf, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', transition: 'transform .25s cubic-bezier(.3,1.6,.5,1),background .15s', flexShrink: 0 }}
                      >
                        <i className={it.si} style={{ fontSize: 20 }} />
                        <span style={{ font: '700 12px/1 Outfit,sans-serif' }}>{it.n}</span>
                      </button>
                    </div>
                  </div>
                );
              })
          }
        </div>
      </section>

      {/* ── RIGHT: map panel ── */}
      <section style={{ position: 'relative', overflow: 'hidden', background: 'var(--cp-map)' }}>

        <NearbyMap
          issues={displayIssues}
          selectedId={selId}
          focusId={focusId}
          onPinClick={id => { setSelId(id); setFocusId(id); }}
          maximized={mapMaximized}
          onToggleMaximize={toggleMapFull}
          mob={false}
          initialCamera={nearbyMapCamera}
          onCameraChange={setNearbyMapCamera}
        />

        {/* Location + Filter pills — top left, Show list prepended when list hidden */}
        <div style={{ position: 'absolute', left: 20, top: 20, zIndex: 5, display: 'flex', gap: 8 }}>
          {!listOpen && (
            <button
              data-glare="1"
              onClick={() => setListOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 16px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 2px 0 rgba(0,0,0,.35),0 8px 14px -10px rgb(0 0 0 / .4)', animation: 'cp-pop2 .25s both' }}
            >
              <i className="ph-bold ph-list-bullets" />
              Show list
            </button>
          )}
          <button
            onClick={onLocation}
            className={styles.regionBtn}
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', fontSize: 18 }} />
            {regionName}
            <i className="ph-bold ph-caret-down" style={{ fontSize: 13, color: 'var(--cp-ink-3)' }} />
          </button>
          <button
            onClick={onFilter}
            className={styles.regionBtn}
            style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 14px', borderRadius: 999, background: fCount > 0 ? 'var(--cp-ink)' : 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: `1px solid ${fCount > 0 ? 'transparent' : 'var(--cp-line)'}`, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: fCount > 0 ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background .15s,color .15s' }}
          >
            <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 16 }} />
            Filters
            {fCount > 0 && (
              <span style={{ minWidth: 18, height: 18, padding: '0 4px', borderRadius: 999, background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '700 11px/18px Outfit,sans-serif', textAlign: 'center', boxSizing: 'border-box' }}>{fCount}</span>
            )}
          </button>
        </div>

        {/* Selected issue card — bottom right */}
        {hasSel && selIssue && selData && (() => {
          const photoUrl = selIssue.evidence?.find(e => e.url)?.url;
          return (
          <div
            data-cp-theme="dark"
            style={{ position: 'absolute', right: 20, bottom: 20, width: 'min(340px,calc(100% - 40px))', boxSizing: 'border-box', borderRadius: 22, background: PIN_PREVIEW_DARK.cardBg, color: PIN_PREVIEW_DARK.cardText, border: PIN_PREVIEW_DARK.cardBorder, boxShadow: '0 24px 50px -18px rgb(0 0 0 / .55)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'cp-row .3s cubic-bezier(.2,.9,.3,1.2) both', zIndex: 9 }}
          >
            {selIdx >= 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 0', flexShrink: 0 }}>
                <button
                  onClick={goSelPrev}
                  disabled={!selHasPrev}
                  title="Previous issue"
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: PIN_PREVIEW_DARK.metaText, cursor: selHasPrev ? 'pointer' : 'default', opacity: selHasPrev ? 1 : 0.3, display: 'grid', placeItems: 'center', fontSize: 13 }}
                >
                  <i className="ph-bold ph-caret-left" />
                </button>
                <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText }}>{selIdx + 1} of {displayIssues.length}</span>
                <button
                  onClick={goSelNext}
                  disabled={!selHasNext}
                  title="Next issue"
                  style={{ width: 28, height: 28, borderRadius: '50%', border: 'none', background: 'transparent', color: PIN_PREVIEW_DARK.metaText, cursor: selHasNext ? 'pointer' : 'default', opacity: selHasNext ? 1 : 0.3, display: 'grid', placeItems: 'center', fontSize: 13 }}
                >
                  <i className="ph-bold ph-caret-right" />
                </button>
              </div>
            )}
            <div style={{ position: 'relative', height: 150, flexShrink: 0, background: photoUrl ? undefined : `repeating-linear-gradient(135deg,${PIN_PREVIEW_DARK.photoGradientA} 0 12px,${PIN_PREVIEW_DARK.photoGradientB} 12px 24px)` }}>
              {photoUrl && <img src={photoUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
              <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 999, background: selData.pc, color: selData.pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{selData.pl}</span>
              <button
                onClick={e => { e.stopPropagation(); setSelId(null); }}
                title="Close"
                style={{ position: 'absolute', right: 10, top: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: PIN_PREVIEW_DARK.closeBtnBg, color: PIN_PREVIEW_DARK.closeBtnFg, cursor: 'pointer', fontSize: 13, display: 'grid', placeItems: 'center' }}
              >
                <i className="ph-bold ph-x" />
              </button>
              <span style={{ position: 'absolute', left: 12, bottom: 12, width: 34, height: 34, borderRadius: 11, background: PIN_PREVIEW_DARK.openBtnBg, display: 'grid', placeItems: 'center' }}>
                <i className={`ph-bold ${selData.icon}`} style={{ fontSize: 17, color: PIN_PREVIEW_DARK.openBtnFg }} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selData.meta}</span>
                <span style={{ font: '600 16px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{selData.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={e => { e.stopPropagation(); onSupport(selIssue.id); }}
                  title="Support"
                  className={styles.selSupportBtn}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 13px', borderRadius: 999, border: PIN_PREVIEW_DARK.supportBtnBorder, background: selData.sbD, color: PIN_PREVIEW_DARK.supportBtnFg, font: '700 13px/1 Outfit,sans-serif', cursor: 'pointer', flexShrink: 0 }}
                >
                  <i className={selData.si} style={{ fontSize: 16 }} />
                  {selData.n}
                </button>
                <span style={{ font: '600 12.5px/1 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText, whiteSpace: 'nowrap' }}>{selData.conf}%</span>
                <div style={{ flex: 1 }} />
                <button
                  data-glare="1"
                  onClick={e => { e.stopPropagation(); onOpen(selIssue.id); }}
                  style={{ height: 40, padding: '0 16px', borderRadius: 999, background: PIN_PREVIEW_DARK.openBtnBg, color: PIN_PREVIEW_DARK.openBtnFg, border: 'none', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Open
                  <i className="ph-bold ph-arrow-right" />
                </button>
              </div>
            </div>
          </div>
          );
        })()}

      </section>
    </div>
  );
}
