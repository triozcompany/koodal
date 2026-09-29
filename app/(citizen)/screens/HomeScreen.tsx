'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { Issue } from '@/lib/domain/types';
import { issueIcon } from '@/lib/domain/constants';
import { PILL, SEGC } from '@/lib/domain/stage-style';
import { step, ago } from '@/lib/domain/rules';
import type { FilterState } from '@/lib/domain/filters';
import { PIN_PREVIEW_DARK } from '@/lib/domain/map-pin-theme';
import { useApp } from '@/lib/app-context';
import { searchIssues } from './SearchScreen';
import { NearbyMap } from '../components/NearbyMap';
import styles from './HomeScreen.module.css';

interface Props {
  issues: Issue[];
  f: FilterState;
  onFilter: () => void;
  onLocation: () => void;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  onClearFilters: () => void;
  supported: Record<string, boolean>;
  fCount: number;
  me: { name: string; verified: boolean };
  onOpenDrawer?: () => void;
  onMapMaximize?: (maximized: boolean) => void;
  navHidden?: boolean;
}

export function HomeScreen({
  issues, f, onFilter, onLocation, onOpen, onSupport, onClearFilters,
  supported, fCount, me, onOpenDrawer = () => {}, onMapMaximize, navHidden = false,
}: Props) {
  const {
    nearbySelectedId, setNearbySelectedId,
    nearbySheetHidden, setNearbySheetHidden,
    nearbySheetTop, setNearbySheetTop,
    nearbyListScroll, setNearbyListScroll,
    nearbyMapCamera, setNearbyMapCamera,
  } = useApp();

  // Seeded once from the persisted context values (survives navigating away
  // to /issues/[id] and back) — kept as local state after that so the drag/
  // scroll gestures below stay fast and don't write to shared context on
  // every frame. See the unmount-sync effect further down.
  const [sheetTop, setSheetTop] = useState<number | null>(nearbySheetTop);
  const [sheetDragging, setSheetDragging] = useState(false);
  const [sheetHidden, setSheetHidden] = useState(nearbySheetHidden);
  const [mSelId, setMSelId] = useState<string | null>(nearbySelectedId);

  const winH = useRef(0);
  const sheetDragRef = useRef({ y: 0, top: 0 });
  const listScrollRef = useRef<HTMLDivElement>(null);
  const restoredScrollRef = useRef(false);

  useEffect(() => {
    winH.current = window.innerHeight;
    setSheetTop(prev => prev ?? Math.round(window.innerHeight * 0.3));
  }, []);

  // Restore the list's scroll position once real issues have arrived —
  // setting scrollTop on an empty list is a no-op, so this retries via the
  // issues.length dependency instead of firing once unconditionally.
  useEffect(() => {
    if (restoredScrollRef.current || !listScrollRef.current || issues.length === 0) return;
    restoredScrollRef.current = true;
    listScrollRef.current.scrollTop = nearbyListScroll;
  }, [issues.length, nearbyListScroll]);

  // Mirror the current local state into the persisted context exactly once,
  // when this screen unmounts (i.e. navigating to an issue) — not on every
  // drag/scroll event, which would otherwise re-render every context consumer.
  const sheetHiddenRef = useRef(sheetHidden); sheetHiddenRef.current = sheetHidden;
  const sheetTopRef = useRef(sheetTop); sheetTopRef.current = sheetTop;
  const mSelIdRef = useRef(mSelId); mSelIdRef.current = mSelId;
  useEffect(() => {
    return () => {
      setNearbySheetHidden(sheetHiddenRef.current);
      setNearbySheetTop(sheetTopRef.current);
      setNearbySelectedId(mSelIdRef.current);
      if (listScrollRef.current) setNearbyListScroll(listScrollRef.current.scrollTop);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sheet drag
  const sheetDown = useCallback((e: React.PointerEvent) => {
    const h = winH.current;
    sheetDragRef.current = { y: e.clientY, top: sheetTop ?? Math.round(h * 0.3) };
    setSheetDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [sheetTop]);

  const sheetMove = useCallback((e: React.PointerEvent) => {
    if (!sheetDragging) return;
    const h = winH.current;
    const dy = e.clientY - sheetDragRef.current.y;
    const newTop = Math.max(0, Math.min(h - 60, sheetDragRef.current.top + dy));
    setSheetTop(newTop);
  }, [sheetDragging]);

  const sheetUp = useCallback(() => {
    if (!sheetDragging) return;
    setSheetDragging(false);
    const h = winH.current;
    const cur = sheetTop ?? Math.round(h * 0.3);
    const snaps = [96, Math.round(h * 0.3), h - 230];
    if (cur > snaps[2] + 50) {
      setSheetHidden(true);
      setSheetTop(null);
      return;
    }
    const snap = snaps.reduce((a, b) => Math.abs(b - cur) < Math.abs(a - cur) ? b : a);
    setSheetTop(snap);
    setSheetHidden(false);
  }, [sheetDragging, sheetTop]);

  const sheetScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const h = winH.current;
    const top = sheetTop ?? Math.round(h * 0.3);
    if (top > 110 && (e.currentTarget as HTMLDivElement).scrollTop > 6) setSheetTop(96);
  }, [sheetTop]);

  const sheetWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const h = winH.current;
    const top = sheetTop ?? Math.round(h * 0.3);
    if (top <= 110 && (e.currentTarget as HTMLDivElement).scrollTop <= 0 && e.deltaY < -4) {
      setSheetTop(Math.round(h * 0.3));
    }
  }, [sheetTop]);

  const selectPin = useCallback((id: string) => {
    setSheetHidden(true);
    setMSelId(id);
  }, []);

  const toggleMapFull = () => {
    if (sheetHidden) {
      setSheetHidden(false); setSheetTop(null); setMSelId(null);
      onMapMaximize?.(false);
    } else {
      setSheetHidden(true);
      onMapMaximize?.(true);
    }
  };

  // Search — debounced so typing doesn't re-filter the list (and rebuild
  // every map marker) on each keystroke.
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);
  const displayIssues = debouncedQuery.trim() ? searchIssues(issues, debouncedQuery) : issues;

  // Computed
  const h = winH.current || 844;
  const sheetTopPx = sheetHidden ? (h + 40) + 'px' : (sheetTop ?? Math.round(h * 0.3)) + 'px';
  const sheetTrans = sheetDragging ? 'none' : 'top .45s cubic-bezier(.2,.9,.3,1.1)';
  const regionName = f.region === 'near' ? 'Velachery' : f.region;
  const meI = me.name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();

  function cardData(issue: Issue) {
    const st = step(issue.stage);
    const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
    const on = !!supported[issue.id];
    const dist = issue.city === 'Chennai' && issue.km < 3
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
      n: issue.sup,
      sb: on ? 'var(--cp-pulse)' : 'var(--cp-surface)',
      sf: on ? '#fff' : 'var(--cp-ink)',
      si: on ? 'ph-fill ph-arrow-fat-up' : 'ph-bold ph-arrow-fat-up',
    };
  }

  const mSelIssue = mSelId ? issues.find(i => i.id === mSelId) ?? null : null;
  const hasMSel = sheetHidden && !!mSelIssue;
  // Prev/next cycle through whichever issues are currently visible (the same
  // set pinned on the map), not the full unfiltered list.
  const mSelIdx = mSelIssue ? displayIssues.findIndex(i => i.id === mSelIssue.id) : -1;
  const mSelHasPrev = mSelIdx > 0;
  const mSelHasNext = mSelIdx >= 0 && mSelIdx < displayIssues.length - 1;
  const goMSelPrev = () => { if (mSelHasPrev) selectPin(displayIssues[mSelIdx - 1].id); };
  const goMSelNext = () => { if (mSelHasNext) selectPin(displayIssues[mSelIdx + 1].id); };

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* ── MAP LAYER ── */}
      <NearbyMap
        issues={displayIssues}
        selectedId={sheetHidden ? mSelId : null}
        focusId={sheetHidden ? mSelId : null}
        onPinClick={selectPin}
        maximized={sheetHidden}
        onToggleMaximize={toggleMapFull}
        mob
        initialCamera={nearbyMapCamera}
        onCameraChange={setNearbyMapCamera}
      />

      {/* ── TOP BAR — always visible, including when map is maximized ── */}
      <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', gap: 8, alignItems: 'center', zIndex: 6 }}>
        <button
          onClick={onLocation}
          className={styles.raised}
          style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          <i className="ph-fill ph-map-pin" style={{ color: 'var(--cp-pulse)', fontSize: 18 }} />
          {regionName}
          <i className="ph-bold ph-caret-down" style={{ fontSize: 13, color: 'var(--cp-ink-3)' }} />
        </button>
        <button
          onClick={onFilter}
          className={styles.raised}
          style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
        >
          <i className="ph-bold ph-sliders-horizontal" style={{ fontSize: 20 }} />
          {fCount > 0 && <span style={{ position: 'absolute', top: 7, right: 7, width: 8, height: 8, borderRadius: '50%', background: 'var(--cp-pulse)', border: '2px solid var(--cp-surface)' }} />}
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={onOpenDrawer}
          className={styles.raised}
          style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
        >
          {meI}
          {me.verified && (
            <span style={{ position: 'absolute', right: -6, bottom: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--cp-peacock)', border: '2px solid var(--cp-surface)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10 }}>
              <i className="ph-bold ph-check" />
            </span>
          )}
        </button>
      </div>

      {/* ── mSel CARD (+ Show list button stacked above it, so it never
          overlaps the card regardless of the card's actual rendered
          height — a flex column stack, not a hardcoded pixel offset) ── */}
      {hasMSel && mSelIssue && (() => {
        const it = cardData(mSelIssue);
        const selOn = !!supported[mSelIssue.id];
        const supBg = selOn ? 'var(--cp-pulse)' : PIN_PREVIEW_DARK.supportBtnBg;
        const photoUrl = mSelIssue.evidence?.find(e => e.url)?.url;
        return (
          <div style={{ position: 'absolute', left: 12, right: 12, bottom: navHidden ? 24 : 96, zIndex: 7, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
            <button
              data-glare="1"
              onClick={() => { setSheetHidden(false); setSheetTop(null); setMSelId(null); }}
              className={styles.raised}
              style={{ display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 18px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 10px 24px -10px rgb(0 0 0 / .45)', animation: 'cp-pop2 .25s both' }}
            >
              <i className="ph-bold ph-list-bullets" />
              Show list · {displayIssues.length}
            </button>
            <div data-cp-theme="dark" style={{ width: '100%', borderRadius: 20, background: PIN_PREVIEW_DARK.cardBg, color: PIN_PREVIEW_DARK.cardText, border: PIN_PREVIEW_DARK.cardBorder, boxShadow: '0 18px 40px -16px rgb(0 0 0 / .4),0 0 0 1px rgb(0 0 0 / .05)', overflow: 'hidden', animation: 'cp-sheet .35s cubic-bezier(.2,.9,.3,1.15) both' }}>
            {mSelIdx >= 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 8px 0' }}>
                <button
                  onClick={goMSelPrev}
                  disabled={!mSelHasPrev}
                  title="Previous issue"
                  style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'transparent', color: PIN_PREVIEW_DARK.metaText, cursor: mSelHasPrev ? 'pointer' : 'default', opacity: mSelHasPrev ? 1 : 0.3, display: 'grid', placeItems: 'center', fontSize: 15 }}
                >
                  <i className="ph-bold ph-caret-left" />
                </button>
                <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText }}>{mSelIdx + 1} of {displayIssues.length}</span>
                <button
                  onClick={goMSelNext}
                  disabled={!mSelHasNext}
                  title="Next issue"
                  style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', background: 'transparent', color: PIN_PREVIEW_DARK.metaText, cursor: mSelHasNext ? 'pointer' : 'default', opacity: mSelHasNext ? 1 : 0.3, display: 'grid', placeItems: 'center', fontSize: 15 }}
                >
                  <i className="ph-bold ph-caret-right" />
                </button>
              </div>
            )}
            <div style={{ position: 'relative', height: 140, background: photoUrl ? undefined : `repeating-linear-gradient(135deg,${PIN_PREVIEW_DARK.photoGradientA} 0 10px,${PIN_PREVIEW_DARK.photoGradientB} 10px 20px)`, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <i className={`ph-bold ${it.icon}`} style={{ fontSize: 40, color: PIN_PREVIEW_DARK.metaText }} />
              )}
              <button
                onClick={e => { e.stopPropagation(); setMSelId(null); }}
                style={{ position: 'absolute', right: 10, top: 10, width: 34, height: 34, borderRadius: '50%', border: 'none', background: PIN_PREVIEW_DARK.closeBtnBg, color: PIN_PREVIEW_DARK.closeBtnFg, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 15 }}
              >
                <i className="ph-bold ph-x" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px 14px' }}>
              <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.meta}</span>
              <span style={{ font: '600 15px/1.25 Outfit,sans-serif' }}>{it.title}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 9px', borderRadius: 999, background: it.pc, color: it.pfg, font: '600 11px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{it.pl}</span>
                <span style={{ flex: 1, font: '600 12px/1 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText, whiteSpace: 'nowrap' }}>{it.n} citizens</span>
                <button
                  onClick={e => { e.stopPropagation(); onSupport(mSelIssue.id); }}
                  className={styles.supportBtn}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: PIN_PREVIEW_DARK.supportBtnBorder, background: supBg, color: PIN_PREVIEW_DARK.supportBtnFg, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0 }}
                >
                  <i className={it.si} />
                </button>
                <button
                  data-glare="1"
                  onClick={() => onOpen(mSelIssue.id)}
                  className={styles.raised}
                  style={{ height: 40, padding: '0 16px', borderRadius: 999, border: 'none', background: PIN_PREVIEW_DARK.openBtnBg, color: PIN_PREVIEW_DARK.openBtnFg, font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7 }}
                >
                  Open<i className="ph-bold ph-arrow-right" />
                </button>
              </div>
            </div>
          </div>
          </div>
        );
      })()}

      {/* ── SHOW LIST BUTTON — only stands alone here when the map is
          maximized without a preview open; otherwise it's stacked above
          the mSel card above ── */}
      {sheetHidden && !hasMSel && (
        <button
          data-glare="1"
          onClick={() => { setSheetHidden(false); setSheetTop(null); setMSelId(null); }}
          className={styles.raised}
          style={{ position: 'absolute', right: 16, bottom: navHidden ? 24 : 104, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 18px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 10px 24px -10px rgb(0 0 0 / .45)', animation: 'cp-pop2 .25s both' }}
        >
          <i className="ph-bold ph-list-bullets" />
          Show list · {displayIssues.length}
        </button>
      )}

      {/* ── BOTTOM SHEET ── */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: sheetTopPx, background: 'var(--cp-surface)', borderRadius: '26px 26px 0 0', boxShadow: '0 -1px 0 var(--cp-line),0 -14px 40px -12px rgba(20,20,40,.18)', display: 'flex', flexDirection: 'column', transition: sheetTrans, zIndex: 5 }}>
        {/* drag handle + title */}
        <div
          onPointerDown={sheetDown}
          onPointerMove={sheetMove}
          onPointerUp={sheetUp}
          style={{ touchAction: 'none', cursor: 'grab', padding: '10px 20px 6px', userSelect: 'none', flexShrink: 0 }}
        >
          <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '0 auto 12px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ font: "400 23px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Nearby</span>
            <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{displayIssues.length} issues around you</span>
          </div>
        </div>

        {/* search */}
        <div style={{ padding: '0 20px 10px', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 42, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 15, color: 'var(--cp-ink-3)' }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search issues"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 13.5px/1 Outfit,sans-serif' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', color: 'var(--cp-ink-3)', cursor: 'pointer', fontSize: 14, display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-x" />
              </button>
            )}
          </div>
        </div>

        {/* issue list */}
        <div
          ref={listScrollRef}
          onScroll={sheetScroll}
          onWheel={sheetWheel}
          style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', paddingBottom: navHidden ? 24 : 110, borderTop: '1px solid var(--cp-line)' }}
        >
          {displayIssues.length === 0 ? (
            <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--cp-ink-3)', textAlign: 'center' }}>
              <i className="ph-bold ph-funnel-x" style={{ fontSize: 30 }} />
              <span style={{ font: '600 13px/1.3 Outfit,sans-serif' }}>{searchQuery.trim() ? 'No issues match your search' : 'Nothing matches these filters'}</span>
              {searchQuery.trim() ? (
                <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Clear search</button>
              ) : (
                <button onClick={onClearFilters} style={{ border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Clear filters</button>
              )}
            </div>
          ) : displayIssues.map(issue => {
            const it = cardData(issue);
            return (
              <div
                key={issue.id}
                onClick={() => selectPin(issue.id)}
                className={styles.row}
                style={{ display: 'grid', gridTemplateColumns: '46px minmax(0,1fr) 54px', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', alignItems: 'start', background: 'var(--cp-surface)' }}
              >
                <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <i className={`ph-bold ${it.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
                  <div style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.meta}</div>
                  <div style={{ font: '600 14px/1.25 Outfit,sans-serif' }}>{it.title}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: it.pc, color: it.pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{it.pl}</span>
                    <span style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                      {it.segs.map((sg, i) => <span key={i} style={{ width: 12, height: 4, borderRadius: 2, background: sg.c, display: 'block' }} />)}
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
