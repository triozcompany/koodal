'use client';
import { useRef, useState, useCallback, useEffect } from 'react';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { PILL, SEGC } from '@/lib/domain/stage-style';
import { step, ago } from '@/lib/domain/rules';
import type { FilterState } from '@/lib/domain/filters';
import { PIN_PREVIEW_DARK } from '@/lib/domain/map-pin-theme';
import styles from './HomeScreen.module.css';

const PINC: Record<string, string> = {
  reported: 'var(--cp-ink-3)',
  community: 'var(--cp-marigold)',
  review: 'var(--cp-peacock)',
  verified: 'var(--cp-peacock)',
  assigned: 'var(--cp-peacock)',
  progress: 'var(--cp-pulse)',
  resolved: 'var(--cp-leaf)',
  closed: 'var(--cp-leaf)',
  rejected: 'var(--cp-surface-2)',
};

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
  const [sheetTop, setSheetTop] = useState<number | null>(null);
  const [sheetDragging, setSheetDragging] = useState(false);
  const [sheetHidden, setSheetHidden] = useState(false);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [mapDragging, setMapDragging] = useState(false);
  const [mSelId, setMSelId] = useState<string | null>(null);

  const winH = useRef(0);
  const sheetDragRef = useRef({ y: 0, top: 0 });
  const mapDragRef = useRef({ cx: 0, cy: 0, px: 0, py: 0 });
  const mapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    winH.current = window.innerHeight;
    setSheetTop(Math.round(window.innerHeight * 0.3));
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

  // Map drag
  const mapDown = useCallback((e: React.PointerEvent) => {
    mapDragRef.current = { cx: e.clientX, cy: e.clientY, px: panX, py: panY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX, panY]);

  const mapMove = useCallback((e: React.PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    setMapDragging(true);
    const L = 500 * zoom;
    const nx = mapDragRef.current.px + (e.clientX - mapDragRef.current.cx);
    const ny = mapDragRef.current.py + (e.clientY - mapDragRef.current.cy);
    setPanX(Math.max(-L, Math.min(L, nx)));
    setPanY(Math.max(-L, Math.min(L, ny)));
  }, [zoom]);

  const mapUp = useCallback(() => setMapDragging(false), []);

  const mapWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(z => Math.max(0.7, Math.min(3, z * (1 - e.deltaY * 0.0015))));
    setMapDragging(true);
    if (mapTimeoutRef.current) clearTimeout(mapTimeoutRef.current);
    mapTimeoutRef.current = setTimeout(() => setMapDragging(false), 120);
  }, []);

  const zoomIn = () => setZoom(z => Math.min(3, z * 1.3));
  const zoomOut = () => setZoom(z => Math.max(0.7, z / 1.3));
  const recenter = () => { setZoom(1); setPanX(0); setPanY(0); };

  const toggleMapFull = () => {
    if (sheetHidden) {
      setSheetHidden(false); setSheetTop(null); setMSelId(null);
      onMapMaximize?.(false);
    } else {
      setSheetHidden(true);
      onMapMaximize?.(true);
    }
  };

  // Computed
  const h = winH.current || 844;
  const sheetTopPx = sheetHidden ? (h + 40) + 'px' : (sheetTop ?? Math.round(h * 0.3)) + 'px';
  const sheetTrans = sheetDragging ? 'none' : 'top .45s cubic-bezier(.2,.9,.3,1.1)';
  const mapTr = mapDragging ? 'none' : 'transform .35s cubic-bezier(.2,.9,.3,1)';
  const mapCur = mapDragging ? 'grabbing' : 'grab';
  const pinInv = (1 / (zoom || 1)).toFixed(3);
  const regionName = f.region === 'near' ? 'Velachery' : f.region;
  const meI = me.name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const showMe = f.region === 'near';

  function cardData(issue: Issue) {
    const st = step(issue.stage);
    const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
    const on = !!supported[issue.id];
    const dist = issue.city === 'Chennai' && issue.km < 3
      ? (issue.km < 1 ? Math.round(issue.km * 1000) + ' m' : issue.km + ' km')
      : issue.city;
    return {
      icon: CATS[issue.cat].icon,
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

  return (
    <div style={{ position: 'absolute', inset: 0, animation: 'cp-in .38s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* ── MAP LAYER ── */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '100%', overflow: 'hidden', background: 'var(--cp-map)' }}>
        <div
          onPointerDown={mapDown}
          onPointerMove={mapMove}
          onPointerUp={mapUp}
          onWheel={mapWheel}
          style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: mapCur }}
        >
          <div style={{ position: 'absolute', inset: 0, transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: '50% 50%', transition: mapTr }}>
            {/* grid */}
            <div style={{ position: 'absolute', inset: '-30%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '50px 50px' }} />
            {/* park */}
            <div style={{ position: 'absolute', left: '8%', top: '12%', width: '18%', height: '14%', borderRadius: 20, background: 'var(--cp-map-park)', transform: 'rotate(-9deg)' }} />
            {/* water */}
            <div style={{ position: 'absolute', right: '-8%', top: '56%', width: '34%', height: '30%', borderRadius: '50%', background: 'var(--cp-map-water)' }} />
            {/* roads */}
            <div style={{ position: 'absolute', left: '-10%', top: '50%', width: '120%', height: 16, background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
            <div style={{ position: 'absolute', left: '53%', top: '-10%', width: 14, height: '120%', background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
            <div style={{ position: 'absolute', left: '-20%', top: '30%', width: '140%', height: 12, background: 'var(--cp-map-road)', transform: 'rotate(18deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
            {/* me dot */}
            {showMe && (
              <div style={{ position: 'absolute', left: '48%', top: '44%', width: 16, height: 16, marginTop: -8, marginLeft: -8, borderRadius: '50%', background: 'var(--cp-ink)', border: '3px solid var(--cp-surface)', boxShadow: '0 0 0 8px color-mix(in oklch,var(--cp-ink) 12%,transparent)' }} />
            )}
            {/* pins */}
            {issues.map(issue => {
              const c = PINC[issue.stage] ?? 'var(--cp-ink-3)';
              const hot = issue.stage === 'review' || (issue.stage === 'community' && issue.conf >= 70);
              const selAndHidden = mSelId === issue.id && sheetHidden;
              const pb = selAndHidden ? 'var(--cp-ink)' : 'var(--cp-surface)';
              const pf = selAndHidden ? 'var(--cp-bg)' : 'var(--cp-ink)';
              return (
                <div
                  key={issue.id}
                  onClick={() => {
                    setSheetHidden(true);
                    setMSelId(issue.id);
                    onMapMaximize?.(true);
                  }}
                  onPointerDown={e => e.stopPropagation()}
                  style={{ position: 'absolute', left: issue.x + '%', top: (issue.y * 0.62 + 10) + '%', transform: `translate(-50%,-100%) scale(${pinInv})`, transformOrigin: '50% 100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}
                >
                  {hot && (
                    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 30, borderRadius: 999, background: c, animation: 'cp-ping 1.9s ease-out infinite' }} />
                  )}
                  <div
                    className={styles.pin}
                    style={{
                      '--pin-sc': selAndHidden ? '1.12' : '1',
                      position: 'relative', display: 'flex', alignItems: 'center', gap: 6,
                      height: 30, padding: '0 11px 0 9px', borderRadius: 999,
                      background: pb, color: pf,
                      boxShadow: '0 2px 10px rgb(0 0 0 / .16),0 0 0 1px rgb(0 0 0 / .06)',
                      font: '700 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap', boxSizing: 'border-box',
                    } as React.CSSProperties}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, boxShadow: '0 0 0 2px var(--cp-surface)', flexShrink: 0 }} />
                    <i className={`ph-bold ${CATS[issue.cat].icon}`} style={{ fontSize: 14 }} />
                    {issue.sup}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* map controls */}
        <div style={{ position: 'absolute', right: 16, top: 70, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4 }}>
          <button
            onClick={toggleMapFull}
            className={styles.mapBtn}
            style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', cursor: 'pointer', fontSize: 17, marginBottom: 6 }}
          >
            <i className={`ph-bold ${sheetHidden ? 'ph-arrows-in-simple' : 'ph-arrows-out-simple'}`} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', overflow: 'hidden' }}>
            <button onClick={zoomIn} style={{ width: 42, height: 42, border: 'none', borderBottom: '1px solid var(--cp-line)', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 }}>
              <i className="ph-bold ph-plus" />
            </button>
            <button onClick={zoomOut} style={{ width: 42, height: 42, border: 'none', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 }}>
              <i className="ph-bold ph-minus" />
            </button>
          </div>
          <button
            onClick={recenter}
            style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-pulse)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', cursor: 'pointer', fontSize: 18 }}
          >
            <i className="ph-fill ph-navigation-arrow" />
          </button>
        </div>
      </div>

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

      {/* ── mSel CARD ── */}
      {hasMSel && mSelIssue && (() => {
        const it = cardData(mSelIssue);
        const selOn = !!supported[mSelIssue.id];
        const supBg = selOn ? 'var(--cp-pulse)' : PIN_PREVIEW_DARK.supportBtnBg;
        return (
          <div data-cp-theme="dark" style={{ position: 'absolute', left: 12, right: 12, bottom: navHidden ? 82 : 96, zIndex: 7, borderRadius: 20, background: PIN_PREVIEW_DARK.cardBg, color: PIN_PREVIEW_DARK.cardText, border: PIN_PREVIEW_DARK.cardBorder, boxShadow: '0 18px 40px -16px rgb(0 0 0 / .4),0 0 0 1px rgb(0 0 0 / .05)', overflow: 'hidden', animation: 'cp-sheet .35s cubic-bezier(.2,.9,.3,1.15) both' }}>
            <div onClick={() => onOpen(mSelIssue.id)} style={{ position: 'relative', height: 140, background: `repeating-linear-gradient(135deg,${PIN_PREVIEW_DARK.photoGradientA} 0 10px,${PIN_PREVIEW_DARK.photoGradientB} 10px 20px)`, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <i className={`ph-bold ${it.icon}`} style={{ fontSize: 40, color: PIN_PREVIEW_DARK.metaText }} />
              <button
                onClick={e => { e.stopPropagation(); setMSelId(null); }}
                style={{ position: 'absolute', right: 10, top: 10, width: 34, height: 34, borderRadius: '50%', border: 'none', background: PIN_PREVIEW_DARK.closeBtnBg, color: PIN_PREVIEW_DARK.closeBtnFg, cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 15 }}
              >
                <i className="ph-bold ph-x" />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '12px 14px 14px' }}>
              <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: PIN_PREVIEW_DARK.metaText, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.meta}</span>
              <span onClick={() => onOpen(mSelIssue.id)} style={{ font: '600 15px/1.25 Outfit,sans-serif', cursor: 'pointer' }}>{it.title}</span>
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
        );
      })()}

      {/* ── SHOW LIST BUTTON ── */}
      {sheetHidden && (
        <button
          data-glare="1"
          onClick={() => { setSheetHidden(false); setSheetTop(null); setMSelId(null); }}
          className={styles.raised}
          style={{ position: 'absolute', right: 16, bottom: navHidden ? 24 : 104, zIndex: 6, display: 'flex', alignItems: 'center', gap: 8, height: 46, padding: '0 18px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: '0 10px 24px -10px rgb(0 0 0 / .45)', animation: 'cp-pop2 .25s both' }}
        >
          <i className="ph-bold ph-list-bullets" />
          Show list · {issues.length}
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
            <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{issues.length} issues around you</span>
          </div>
        </div>

        {/* issue list */}
        <div
          onScroll={sheetScroll}
          onWheel={sheetWheel}
          style={{ flex: 1, overflowY: 'auto', overscrollBehavior: 'contain', paddingBottom: navHidden ? 24 : 110, borderTop: '1px solid var(--cp-line)' }}
        >
          {issues.length === 0 ? (
            <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, color: 'var(--cp-ink-3)', textAlign: 'center' }}>
              <i className="ph-bold ph-funnel-x" style={{ fontSize: 30 }} />
              <span style={{ font: '600 13px/1.3 Outfit,sans-serif' }}>Nothing matches these filters</span>
              <button onClick={onClearFilters} style={{ border: 'none', background: 'none', color: 'var(--cp-pulse)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Clear filters</button>
            </div>
          ) : issues.map(issue => {
            const it = cardData(issue);
            return (
              <div
                key={issue.id}
                onClick={() => onOpen(issue.id)}
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
