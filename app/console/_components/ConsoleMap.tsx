'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ensureMaplibreWorker } from '@/lib/maplibre-setup';
import { clusterElement, groupByPixel } from '@/lib/map/clusters';
import { issueIcon } from '@/lib/domain/constants';
import { approximateLatLngFromFakeXY } from '@/lib/domain/geo';
import type { Issue } from '@/lib/domain/types';
import { govStage, isOverdue, PIN_COLOR } from '@/lib/console/derive';
import type { MapCamera } from '@/lib/console/mapState';

// Same OpenFreeMap positron style, worker setup and coordinate fallback the citizen
// Nearby map uses (NearbyMap.tsx); pins, clusters and the two hotspot layers are Console-specific.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DEFAULT_CENTER: [number, number] = [80.2206, 12.975];
const CLUSTER_PX = 46;
const PITCH = 55; // same 3D tilt the citizen Nearby map opens with

type LngLat = [number, number];
export function issueLngLat(issue: Issue): LngLat {
  if (typeof issue.lat === 'number' && typeof issue.lng === 'number') return [issue.lng, issue.lat];
  const { lat, lng } = approximateLatLngFromFakeXY(issue.x, issue.y);
  return [lng, lat];
}

export interface AreaBubble { area: string; lngLat: LngLat; n: number }
interface Props {
  cases: Issue[];
  hotspots: AreaBubble[];   // n = open cases in the area
  emerging: AreaBubble[];   // n = reports still gathering support
  showCases: boolean;
  showHotspots: boolean;
  showEmerging: boolean;
  selectedId: string | null;
  hoverId: string | null;
  fitKey: string;
  onPick: (id: string) => void;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  /** Saved view to reopen at (returning from a case). Read once, at mount. */
  initialCamera?: MapCamera | null;
  onCameraChange?: (c: MapCamera) => void;
}

function pinEl(issue: Issue, selected: boolean, onClick: () => void): HTMLDivElement {
  const g = govStage(issue);
  const dot = PIN_COLOR[g];
  const alarm = isOverdue(issue) || g === 'reopened' || g === 'pending';
  const wrap = document.createElement('div');
  const inner = document.createElement('div');
  inner.dataset.pin = issue.id;
  inner.style.cssText = `position:relative;display:flex;align-items:center;gap:6px;height:34px;padding:0 11px 0 9px;border-radius:999px;border:1.5px solid ${selected ? 'var(--cp-ink)' : 'var(--cp-line)'};background:${selected ? 'var(--cp-ink)' : 'var(--cp-surface)'};color:${selected ? 'var(--cp-bg)' : 'var(--cp-ink)'};cursor:pointer;font:700 12px/1 Outfit,sans-serif;white-space:nowrap;box-shadow:0 6px 16px -8px rgb(0 0 0 / .45);transform:scale(${selected ? 1.15 : 1});transition:transform .25s cubic-bezier(.3,1.6,.5,1);`;
  if (alarm) {
    const ping = document.createElement('span');
    ping.style.cssText = `position:absolute;left:9px;top:50%;width:9px;height:9px;margin-top:-4.5px;border-radius:50%;background:${dot};animation:cp-ping 1.8s ease-out infinite;`;
    inner.appendChild(ping);
  }
  const d = document.createElement('span');
  d.style.cssText = `position:relative;width:9px;height:9px;flex:none;border-radius:50%;background:${dot};`;
  const i = document.createElement('i');
  i.className = `ph-bold ${issueIcon(issue)}`;
  i.style.fontSize = '14px';
  inner.append(d, i, document.createTextNode(String(issue.sup)));
  wrap.appendChild(inner);
  wrap.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
  return wrap;
}

function bubbleEl(b: AreaBubble, kind: 'hot' | 'emerging'): HTMLDivElement {
  const wrap = document.createElement('div');
  const el = document.createElement('div');
  if (kind === 'hot') {
    const s = 30 + b.n * 18;
    el.style.cssText = `position:relative;width:${s}px;height:${s}px;border-radius:50%;background:radial-gradient(circle,color-mix(in oklch,var(--cp-pulse) 30%,transparent),color-mix(in oklch,var(--cp-pulse) 6%,transparent) 68%,transparent 70%);pointer-events:none;`;
    const l = document.createElement('span');
    l.textContent = b.area;
    l.style.cssText = 'position:absolute;left:50%;top:100%;transform:translate(-50%,-80%);font:600 10.5px/1 Outfit,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--cp-ink-2);white-space:nowrap;text-shadow:0 0 4px var(--cp-surface),0 0 4px var(--cp-surface);';
    el.appendChild(l);
  } else {
    const s = 40 + b.n * 10;
    el.title = `${b.n} reports still gathering support in ${b.area}`;
    el.style.cssText = `display:grid;place-items:center;width:${s}px;height:${s}px;border-radius:50%;border:2px dashed var(--cp-marigold);background:color-mix(in oklch,var(--cp-marigold) 10%,transparent);font:700 11px/1 Outfit,sans-serif;color:var(--cp-ink);pointer-events:none;`;
    el.textContent = String(b.n);
  }
  wrap.appendChild(el);
  wrap.style.pointerEvents = 'none';
  return wrap;
}

const mapBtn: CSSProperties = { width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', cursor: 'pointer', fontSize: 17, display: 'grid', placeItems: 'center' };
const zoomBtn: CSSProperties = { width: 42, height: 42, border: 'none', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 };

export function ConsoleMap(p: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const pinMarkers = useRef<maplibregl.Marker[]>([]);
  const areaMarkers = useRef<maplibregl.Marker[]>([]);
  const pickRef = useRef(p.onPick);
  pickRef.current = p.onPick;
  const cameraRef = useRef(p.onCameraChange);
  cameraRef.current = p.onCameraChange;
  const initialCamera = useRef(p.initialCamera).current;
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pitched, setPitched] = useState(() => (initialCamera ? initialCamera.pitch > 0 : true));
  const [view, setView] = useState(0); // bumps on zoom/move end so clusters are recomputed

  useEffect(() => {
    if (!boxRef.current) return;
    ensureMaplibreWorker();
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({ container: boxRef.current, style: MAP_STYLE, center: initialCamera?.center ?? DEFAULT_CENTER, zoom: initialCamera?.zoom ?? 11.5, pitch: initialCamera?.pitch ?? PITCH, bearing: initialCamera?.bearing ?? 0, attributionControl: false });
    } catch (err) {
      console.error('ConsoleMap: map creation failed:', err);
      setFailed(true);
      return;
    }
    mapRef.current = map;
    map.on('error', (e) => console.error('ConsoleMap: map error:', e.error?.message ?? e));
    map.on('load', () => setReady(true));
    map.on('zoomend', () => setView((v) => v + 1));
    // Fires once a gesture settles, so it is safe to report straight through.
    map.on('moveend', () => {
      const c = map.getCenter();
      cameraRef.current?.({ center: [c.lng, c.lat], zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() });
    });
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(boxRef.current);
    return () => {
      ro.disconnect();
      pinMarkers.current.forEach((m) => m.remove());
      areaMarkers.current.forEach((m) => m.remove());
      pinMarkers.current = []; areaMarkers.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => { requestAnimationFrame(() => mapRef.current?.resize()); }, [p.fullscreen]);

  // Pins, grouped into count bubbles when they would overlap at the current zoom. The selected
  // case is never swallowed by a cluster.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    pinMarkers.current.forEach((m) => m.remove());
    pinMarkers.current = [];
    if (!p.showCases) return;
    for (const group of groupByPixel(p.cases, (i) => map.project(issueLngLat(i)), (i) => i.id === p.selectedId, CLUSTER_PX)) {
      if (group.length === 1) {
        const issue = group[0];
        pinMarkers.current.push(new maplibregl.Marker({ element: pinEl(issue, issue.id === p.selectedId, () => pickRef.current(issue.id)), anchor: 'center' }).setLngLat(issueLngLat(issue)).addTo(map));
      } else {
        const pts = group.map(issueLngLat);
        const center: LngLat = [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
        const zoomIn = () => {
          const b = new maplibregl.LngLatBounds();
          pts.forEach((q) => b.extend(q));
          map.fitBounds(b, { padding: 90, maxZoom: 17, duration: 500 });
        };
        pinMarkers.current.push(new maplibregl.Marker({ element: clusterElement(group.length, zoomIn), anchor: 'center' }).setLngLat(center).addTo(map));
      }
    }
  }, [p.cases, p.selectedId, p.showCases, ready, view]);

  // Hover on a list row scales that pin without rebuilding the markers (rebuilding would restart the ping).
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-pin]').forEach((el) => {
      const on = el.dataset.pin === p.hoverId && el.dataset.pin !== p.selectedId;
      el.style.transform = `scale(${el.dataset.pin === p.selectedId ? 1.15 : on ? 1.08 : 1})`;
    });
  }, [p.hoverId, p.selectedId, p.cases, view, ready]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    areaMarkers.current.forEach((m) => m.remove());
    areaMarkers.current = [];
    const add = (list: AreaBubble[], kind: 'hot' | 'emerging') =>
      list.forEach((b) => areaMarkers.current.push(new maplibregl.Marker({ element: bubbleEl(b, kind), anchor: 'center' }).setLngLat(b.lngLat).addTo(map)));
    if (p.showHotspots) add(p.hotspots, 'hot');
    if (p.showEmerging) add(p.emerging, 'emerging');
  }, [p.hotspots, p.emerging, p.showHotspots, p.showEmerging, ready]);

  // Frame the visible cases when the filters/region change (and on first load), never on live updates.
  // With a saved camera we are returning to where the user was: do not refit or re-fly.
  const framed = useRef(initialCamera ? p.fitKey : '');
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || p.cases.length === 0 || framed.current === p.fitKey) return;
    framed.current = p.fitKey;
    const b = new maplibregl.LngLatBounds();
    p.cases.forEach((i) => b.extend(issueLngLat(i)));
    map.fitBounds(b, { padding: 90, maxZoom: 15, duration: 400 });
  }, [p.cases, p.fitKey, ready]);

  // Fly to the selected case.
  const flown = useRef<string | null>(initialCamera ? p.selectedId : null);
  useEffect(() => {
    const map = mapRef.current;
    if (!p.selectedId) { flown.current = null; return; }
    if (!map || !ready || flown.current === p.selectedId) return;
    const issue = p.cases.find((i) => i.id === p.selectedId);
    if (!issue) return;
    flown.current = p.selectedId;
    map.flyTo({ center: issueLngLat(issue), zoom: Math.max(map.getZoom(), 15), duration: 600 });
  }, [p.selectedId, p.cases, ready]);

  function toggle3d() {
    const next = !pitched;
    setPitched(next);
    mapRef.current?.easeTo({ pitch: next ? PITCH : 0, duration: 500 });
  }

  function recenter() {
    const map = mapRef.current;
    if (!map) return;
    if (p.cases.length === 0) { map.flyTo({ center: DEFAULT_CENTER, zoom: 11.5 }); return; }
    const b = new maplibregl.LngLatBounds();
    p.cases.forEach((i) => b.extend(issueLngLat(i)));
    map.fitBounds(b, { padding: 90, maxZoom: 15, duration: 500 });
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cp-map)', overflow: 'hidden' }}>
      <div ref={boxRef} style={{ position: 'absolute', inset: 0, visibility: failed ? 'hidden' : 'visible' }} />
      {failed && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--cp-ink-3)' }}>
          <i className="ph-bold ph-map-trifold" style={{ fontSize: 28 }} /><span style={{ font: '600 13px/1.4 Outfit,sans-serif' }}>Map unavailable</span>
        </div>
      )}
      <div style={{ position: 'absolute', right: 16, top: 14, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 6 }}>
        <button onClick={p.onToggleFullscreen} title={p.fullscreen ? 'Exit full screen' : 'Full screen map'} style={{ ...mapBtn, marginBottom: 6 }}><i className={`ph-bold ${p.fullscreen ? 'ph-arrows-in-simple' : 'ph-arrows-out-simple'}`} /></button>
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', overflow: 'hidden' }}>
          <button onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in" style={{ ...zoomBtn, borderBottom: '1px solid var(--cp-line)' }}><i className="ph-bold ph-plus" /></button>
          <button onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out" style={zoomBtn}><i className="ph-bold ph-minus" /></button>
        </div>
        <button onClick={toggle3d} title="Toggle 3D buildings" aria-pressed={pitched} style={{ ...mapBtn, color: pitched ? 'var(--cp-pulse)' : 'var(--cp-ink)' }}><i className="ph-bold ph-cube" /></button>
        <button onClick={recenter} title="Recenter" style={{ ...mapBtn, color: 'var(--cp-pulse)' }}><i className="ph-bold ph-crosshair" /></button>
      </div>
    </div>
  );
}
