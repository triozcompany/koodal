'use client';
import { useRef, useState, useCallback } from 'react';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { PILL, SEGC, PIN } from '@/lib/domain/stage-style';
import { step, ago } from '@/lib/domain/rules';
import type { FilterState } from '../components/FilterPanel';
import styles from './DesktopHome.module.css';

const CATS_ENTRIES = Object.entries(CATS);


interface Props {
  issues: Issue[];
  f: FilterState;
  onFilter: () => void;
  onLocation: () => void;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  supported: Record<string, boolean>;
  fCount: number;
  onCatChip: (cat: string) => void;
  onSearch: () => void;
  wide: boolean;
  mapMaximized: boolean;
  onMapMaximize: () => void;
  onMapMinimize: () => void;
}

export function DesktopHome({ issues, f, onFilter, onLocation, onOpen, onSupport, supported, fCount, onCatChip, wide, mapMaximized, onMapMaximize, onMapMinimize }: Props) {
  const [listOpen, setListOpen] = useState(true);
  const [selId, setSelId]           = useState<string | null>(null);
  const [panX, setPanX]             = useState(0);
  const [panY, setPanY]             = useState(0);
  const [zoom, setZoom]             = useState(1);
  const [mapDragging, setMapDragging] = useState(false);

  const mapDragRef    = useRef({ cx: 0, cy: 0, px: 0, py: 0 });
  const mapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapDown = useCallback((e: React.PointerEvent) => {
    mapDragRef.current = { cx: e.clientX, cy: e.clientY, px: panX, py: panY };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [panX, panY]);

  const mapMove = useCallback((e: React.PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    setMapDragging(true);
    const L  = 500 * zoom;
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

  const zoomIn   = () => setZoom(z => Math.min(3, z * 1.3));
  const zoomOut  = () => setZoom(z => Math.max(0.7, z / 1.3));
  const recenter = () => { setZoom(1); setPanX(0); setPanY(0); };

  const listW       = listOpen ? (wide ? '420px' : '350px') : '0px';
  const regionName  = f.region === 'near' ? 'Velachery' : f.region;
  const dTitle      = f.region === 'near' ? 'Nearby' : f.region;
  const dCount      = `${issues.length} issues`;
  const showMe      = f.region === 'near';
  const mapTr       = mapDragging ? 'none' : 'transform .35s cubic-bezier(.2,.9,.3,1)';
  const mapCur      = mapDragging ? 'grabbing' : 'grab';
  const pinInv      = (1 / (zoom || 1)).toFixed(3);
  const mapFullIcon = mapMaximized ? 'ph-arrows-in-simple' : 'ph-arrows-out-simple';
  const mapFullTip  = mapMaximized ? 'Exit full screen' : 'Full screen map';

  function cardData(issue: Issue) {
    const st         = step(issue.stage);
    const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
    const on         = !!supported[issue.id];
    const dist       = issue.city === 'Chennai' && issue.km < 3
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
    return { ...it, sbD: selOn ? 'var(--cp-pulse)' : '#1e1e1e', conf: selIssue.conf };
  })() : null;

  const chips = [
    ['all', 'All', 'ph-squares-four'] as const,
    ...CATS_ENTRIES.map(([k, c]) => [k, c.l, c.icon] as const),
  ];

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

          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', margin: '0 -20px', padding: '0 20px' }}>
            {chips.map(([k, label, icon]) => {
              const on = k === 'all' ? !f.cat.length : (f.cat.length === 1 && f.cat[0] === k);
              return (
                <button
                  key={k}
                  onClick={() => onCatChip(k)}
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 999, border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: on ? 'var(--cp-ink)' : 'var(--cp-surface)', color: on ? 'var(--cp-bg)' : 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s' }}
                >
                  <i className={`ph-bold ${icon}`} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          {issues.length === 0
            ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>Nothing matches these filters.</div>
            : issues.map(issue => {
                const it  = cardData(issue);
                const bar = selId === issue.id ? 'var(--cp-pulse)' : 'transparent';
                return (
                  <div key={issue.id} onMouseEnter={() => setSelId(issue.id)} style={{ boxShadow: `inset 3px 0 0 ${bar}` }}>
                    <div
                      className={styles.rowInner}
                      onClick={() => onOpen(issue.id)}
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

        <div
          onPointerDown={mapDown}
          onPointerMove={mapMove}
          onPointerUp={mapUp}
          onWheel={mapWheel}
          style={{ position: 'absolute', inset: 0, touchAction: 'none', cursor: mapCur }}
        >
          <div style={{ position: 'absolute', inset: 0, transform: `translate(${panX}px,${panY}px) scale(${zoom})`, transformOrigin: '50% 50%', transition: mapTr }}>
            <div style={{ position: 'absolute', inset: '-30%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '50px 50px' }} />
            <div style={{ position: 'absolute', left: '8%', top: '12%', width: '18%', height: '14%', borderRadius: 20, background: 'var(--cp-map-park)', transform: 'rotate(-9deg)' }} />
            <div style={{ position: 'absolute', right: '-8%', top: '56%', width: '34%', height: '30%', borderRadius: '50%', background: 'var(--cp-map-water)' }} />
            <div style={{ position: 'absolute', left: '-10%', top: '50%', width: '120%', height: 16, background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
            <div style={{ position: 'absolute', left: '53%', top: '-10%', width: 14, height: '120%', background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
            <div style={{ position: 'absolute', left: '-20%', top: '30%', width: '140%', height: 12, background: 'var(--cp-map-road)', transform: 'rotate(18deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />

            {showMe && (
              <>
                <span style={{ position: 'absolute', left: '6%', top: '46.5%', transform: 'rotate(-9deg)', font: '500 11px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>100 FEET RD</span>
                <span style={{ position: 'absolute', left: '14%', top: '25%', transform: 'rotate(18deg)', font: '500 11px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>VELACHERY MAIN RD</span>
                <div style={{ position: 'absolute', left: '48%', top: '44%', width: 16, height: 16, marginTop: -8, marginLeft: -8, borderRadius: '50%', background: 'var(--cp-ink)', border: '3px solid var(--cp-surface)', boxShadow: '0 0 0 8px color-mix(in oklch,var(--cp-ink) 12%,transparent)' }} />
              </>
            )}

            {issues.map(issue => {
              const c          = PIN[issue.stage]?.[0] ?? 'var(--cp-surface)';
              const hot        = issue.stage === 'review' || (issue.stage === 'community' && issue.conf >= 70);
              const isSelected = selId === issue.id;
              const pb         = isSelected ? 'var(--cp-ink)' : 'var(--cp-surface)';
              const pf         = isSelected ? 'var(--cp-bg)' : 'var(--cp-ink)';
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelId(issue.id)}
                  onPointerDown={e => e.stopPropagation()}
                  style={{ position: 'absolute', left: issue.x + '%', top: (issue.y * 0.8 + 10) + '%', transform: `translate(-50%,-100%) scale(${pinInv})`, transformOrigin: '50% 100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: isSelected ? 6 : 1 }}
                >
                  {hot && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 30, borderRadius: 999, background: c, animation: 'cp-ping 1.9s ease-out infinite' }} />}
                  <div
                    className={styles.pin}
                    style={{ '--pin-sc': isSelected ? '1.12' : '1', position: 'relative', display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 11px 0 9px', borderRadius: 999, background: pb, color: pf, boxShadow: '0 2px 10px rgb(0 0 0 / .16),0 0 0 1px rgb(0 0 0 / .06)', font: '700 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap', boxSizing: 'border-box' } as React.CSSProperties}
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

        {/* Map controls — top right */}
        <div style={{ position: 'absolute', right: 20, top: 20, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4 }}>
          <button
            onClick={() => {
              if (mapMaximized) {
                onMapMinimize();
                setListOpen(true);
              } else {
                onMapMaximize();
                setListOpen(false);
              }
            }}
            title={mapFullTip}
            className={styles.mapBtn}
            style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', cursor: 'pointer', fontSize: 17, marginBottom: 6 }}
          >
            <i className={`ph-bold ${mapFullIcon}`} />
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', overflow: 'hidden' }}>
            <button onClick={zoomIn}  style={{ width: 42, height: 42, border: 'none', borderBottom: '1px solid var(--cp-line)', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 }}><i className="ph-bold ph-plus" /></button>
            <button onClick={zoomOut} style={{ width: 42, height: 42, border: 'none', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 }}><i className="ph-bold ph-minus" /></button>
          </div>
          <button
            onClick={recenter}
            title="Back to my location"
            style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-pulse)', cursor: 'pointer', fontSize: 18, boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)' }}
          >
            <i className="ph-fill ph-navigation-arrow" />
          </button>
        </div>

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
        {hasSel && selIssue && selData && (
          <div
            onClick={() => onOpen(selIssue.id)}
            data-cp-theme="dark"
            style={{ position: 'absolute', right: 20, bottom: 20, width: 'min(340px,calc(100% - 40px))', boxSizing: 'border-box', borderRadius: 22, background: '#0d0d0d', color: '#f5f5f5', border: '1px solid #262626', boxShadow: '0 24px 50px -18px rgb(0 0 0 / .55)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'cp-row .3s cubic-bezier(.2,.9,.3,1.2) both', zIndex: 9, cursor: 'pointer' }}
          >
            <div style={{ position: 'relative', height: 150, flexShrink: 0, background: 'repeating-linear-gradient(135deg,#1a1a1a 0 12px,#222 12px 24px)' }}>
              <span style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', font: '500 11px/1 Outfit,sans-serif', color: '#bdbdbd', background: '#141414', padding: '6px 9px', borderRadius: 6, whiteSpace: 'nowrap' }}>community photo</span>
              <span style={{ position: 'absolute', left: 12, top: 12, display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 999, background: selData.pc, color: selData.pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{selData.pl}</span>
              <button
                onClick={e => { e.stopPropagation(); setSelId(null); }}
                title="Close"
                style={{ position: 'absolute', right: 10, top: 10, width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'rgb(0 0 0 / .55)', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'grid', placeItems: 'center' }}
              >
                <i className="ph-bold ph-x" />
              </button>
              <span style={{ position: 'absolute', left: 12, bottom: 12, width: 34, height: 34, borderRadius: 11, background: '#fff', display: 'grid', placeItems: 'center' }}>
                <i className={`ph-bold ${selData.icon}`} style={{ fontSize: 17, color: '#0f0f0f' }} />
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px 16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: '#8a8a8a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selData.meta}</span>
                <span style={{ font: '600 16px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>{selData.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={e => { e.stopPropagation(); onSupport(selIssue.id); }}
                  title="Support"
                  className={styles.selSupportBtn}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 13px', borderRadius: 999, border: '1px solid #2e2e2e', background: selData.sbD, color: '#fff', font: '700 13px/1 Outfit,sans-serif', cursor: 'pointer', flexShrink: 0 }}
                >
                  <i className={selData.si} style={{ fontSize: 16 }} />
                  {selData.n}
                </button>
                <span style={{ font: '600 12.5px/1 Outfit,sans-serif', color: '#bdbdbd', whiteSpace: 'nowrap' }}>{selData.conf}%</span>
                <div style={{ flex: 1 }} />
                <button
                  data-glare="1"
                  onClick={e => { e.stopPropagation(); onOpen(selIssue.id); }}
                  style={{ height: 40, padding: '0 16px', borderRadius: 999, background: '#fff', color: '#0f0f0f', border: 'none', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Open
                  <i className="ph-bold ph-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
