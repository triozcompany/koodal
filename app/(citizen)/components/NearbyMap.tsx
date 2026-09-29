'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ensureMaplibreWorker } from '@/lib/maplibre-setup';
import { clusterElement, groupByPixel } from '@/lib/map/clusters';
import type { Issue, MapCamera } from '@/lib/domain/types';
import { issueIcon } from '@/lib/domain/constants';
import { PIN } from '@/lib/domain/stage-style';
import { approximateLatLngFromFakeXY } from '@/lib/domain/geo';

// Same free OpenFreeMap tiles already used in LocationPicker.tsx — no API
// key, no new service. `positron` (a minimal, muted basemap) reads much
// better than `liberty` behind our own colored pins. Not re-themed for dark
// mode in this pass (matching that same precedent) — a real dark vector
// style is its own project.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DEFAULT_CENTER: [number, number] = [80.2206, 12.9750];
const CLUSTER_PX = 46; // pins closer than this (on screen) collapse into a count bubble

interface Props {
  issues: Issue[];
  selectedId?: string | null;
  focusId?: string | null;
  onPinClick: (id: string) => void;
  maximized: boolean;
  onToggleMaximize: () => void;
  mob: boolean;
  initialCamera?: MapCamera | null;
  onCameraChange?: (camera: MapCamera) => void;
}

function issueLngLat(issue: Issue): [number, number] {
  if (typeof issue.lat === 'number' && typeof issue.lng === 'number') return [issue.lng, issue.lat];
  const { lat, lng } = approximateLatLngFromFakeXY(issue.x, issue.y);
  return [lng, lat];
}

/** Builds the same pin look (stage-colored dot, icon, support count, the
 * "hot" pulse) as a plain DOM element — maplibregl.Marker takes a real
 * element, not a React node. */
function pinElement(issue: Issue, selected: boolean, onClick: () => void): HTMLDivElement {
  const [bg] = PIN[issue.stage] ?? PIN.reported;
  const hot = issue.stage === 'review' || (issue.stage === 'community' && issue.conf >= 70);

  // `wrap` is handed straight to maplibregl.Marker, which adds its own
  // `.maplibregl-marker` class (position:absolute;top:0;left:0) and moves it
  // purely via a CSS transform. Setting layout/position styles directly on
  // `wrap` (an earlier version did) overrides that class via inline-style
  // specificity, so the marker falls back into normal document flow instead
  // of being absolutely positioned — pins land in the wrong spot, and any
  // full-bleed decoration inside stretches to the full flow width. All of
  // our own layout goes on the inner element instead.
  const wrap = document.createElement('div');

  const inner = document.createElement('div');
  inner.style.cssText = 'position:relative;display:flex;flex-direction:column;align-items:center;cursor:pointer;';
  wrap.appendChild(inner);

  if (hot) {
    const ping = document.createElement('div');
    ping.style.cssText = `position:absolute;left:0;right:0;top:0;height:30px;border-radius:999px;background:${bg};opacity:.55;pointer-events:none;animation:cp-ping 1.9s ease-out infinite;`;
    inner.appendChild(ping);
  }

  const pin = document.createElement('div');
  pin.style.cssText = `position:relative;display:flex;align-items:center;gap:6px;height:30px;padding:0 11px 0 9px;border-radius:999px;background:${selected ? 'var(--cp-ink)' : 'var(--cp-surface)'};color:${selected ? 'var(--cp-bg)' : 'var(--cp-ink)'};box-shadow:0 2px 10px rgb(0 0 0/.22),0 0 0 1.5px var(--cp-line);font:700 12px/1 Outfit,sans-serif;white-space:nowrap;box-sizing:border-box;transform:scale(${selected ? 1.12 : 1});transition:transform .2s;`;

  const dot = document.createElement('span');
  dot.style.cssText = `width:8px;height:8px;border-radius:50%;background:${bg};box-shadow:0 0 0 2px var(--cp-surface);flex-shrink:0;`;
  const icon = document.createElement('i');
  icon.className = `ph-bold ${issueIcon(issue)}`;
  icon.style.fontSize = '14px';

  pin.appendChild(dot);
  pin.appendChild(icon);
  pin.appendChild(document.createTextNode(String(issue.sup)));
  inner.appendChild(pin);
  wrap.addEventListener('click', e => { e.stopPropagation(); onClick(); });
  return wrap;
}

const mapBtnStyle: React.CSSProperties = { width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'var(--cp-surface)', color: 'var(--cp-ink)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', cursor: 'pointer', fontSize: 17, display: 'grid', placeItems: 'center' };
const zoomBtnStyle: React.CSSProperties = { width: 42, height: 42, border: 'none', background: 'none', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17 };

export function NearbyMap({ issues, selectedId, focusId, onPinClick, maximized, onToggleMaximize, mob, initialCamera, onCameraChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const onPinClickRef = useRef(onPinClick);
  onPinClickRef.current = onPinClick;
  const onCameraChangeRef = useRef(onCameraChange);
  onCameraChangeRef.current = onCameraChange;
  // Only read at mount, to seed the map's initial view/whether to skip the
  // auto-fit-bounds pass below — not meant to react to later prop changes.
  const framedRef = useRef(!!initialCamera);
  const flownIdRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [pitched, setPitched] = useState(() => (initialCamera ? initialCamera.pitch > 0 : true));
  const [mapFailed, setMapFailed] = useState(false);
  const [view, setView] = useState(0); // bumps on zoom end so clusters regroup

  useEffect(() => {
    if (!containerRef.current) return;
    ensureMaplibreWorker();
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: containerRef.current,
        style: MAP_STYLE,
        center: initialCamera?.center ?? DEFAULT_CENTER,
        zoom: initialCamera?.zoom ?? 14,
        pitch: initialCamera?.pitch ?? 55,
        bearing: initialCamera?.bearing ?? 0,
        attributionControl: false,
      });
    } catch (err) {
      console.error('NearbyMap: map creation failed:', err);
      setMapFailed(true);
      return;
    }
    mapRef.current = map;
    map.on('error', e => console.error('NearbyMap: map error:', e.error?.message ?? e));
    map.on('load', () => setReady(true));
    map.on('zoomend', () => setView(v => v + 1));
    // Fires once a pan/zoom/tilt/rotate gesture settles (not per-frame), so
    // this is already naturally throttled — safe to report straight through.
    map.on('moveend', () => {
      const c = map.getCenter();
      onCameraChangeRef.current?.({ center: [c.lng, c.lat], zoom: map.getZoom(), pitch: map.getPitch(), bearing: map.getBearing() });
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The list panel/bottom sheet resizing when maximize toggles doesn't fire
  // a window resize event, so the ResizeObserver above wouldn't always catch
  // it in time for the very next paint — nudge it explicitly too.
  useEffect(() => {
    if (!mapRef.current) return;
    requestAnimationFrame(() => mapRef.current?.resize());
  }, [maximized]);

  // Rebuild markers whenever the visible issues, the selection or the zoom changes —
  // simplest correct approach at the issue counts this app actually shows. Overlapping pins
  // collapse into a count bubble; the selected issue always stays a pin, so fly-to targets
  // never disappear inside a cluster.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markersRef.current.forEach(m => m.remove());
    markersRef.current = groupByPixel(issues, i => map.project(issueLngLat(i)), i => i.id === selectedId, CLUSTER_PX).map(group => {
      if (group.length === 1) {
        const issue = group[0];
        return new maplibregl.Marker({ element: pinElement(issue, issue.id === selectedId, () => onPinClickRef.current(issue.id)), anchor: 'bottom' })
          .setLngLat(issueLngLat(issue))
          .addTo(map);
      }
      const pts = group.map(issueLngLat);
      const center: [number, number] = [pts.reduce((a, q) => a + q[0], 0) / pts.length, pts.reduce((a, q) => a + q[1], 0) / pts.length];
      const zoomIn = () => {
        const b = new maplibregl.LngLatBounds();
        pts.forEach(q => b.extend(q));
        map.fitBounds(b, { padding: 90, maxZoom: 17, duration: 500 });
      };
      return new maplibregl.Marker({ element: clusterElement(group.length, zoomIn), anchor: 'center' }).setLngLat(center).addTo(map);
    });
  }, [issues, selectedId, ready, view]);

  // Fly to an explicitly focused issue (a list-row or pin click) — never on
  // mere hover, so scanning the desktop list doesn't yank the camera around.
  // Guarded by flownIdRef so it fires once per focus change, not on every
  // unrelated re-render while the same issue stays focused.
  useEffect(() => {
    const map = mapRef.current;
    if (!focusId) { flownIdRef.current = null; return; }
    if (!map || !ready || focusId === flownIdRef.current) return;
    const issue = issues.find(i => i.id === focusId);
    if (!issue) return;
    flownIdRef.current = focusId;
    map.flyTo({ center: issueLngLat(issue), zoom: Math.max(map.getZoom(), 15) });
  }, [focusId, issues, ready]);

  // Frame all visible issues once, as soon as both the map and the first
  // batch of issues are ready — after that the user's own pan/zoom takes over.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || framedRef.current || issues.length === 0) return;
    framedRef.current = true;
    const bounds = new maplibregl.LngLatBounds();
    issues.forEach(i => bounds.extend(issueLngLat(i)));
    map.fitBounds(bounds, { padding: 80, maxZoom: 16, duration: 0 });
  }, [issues, ready]);

  function toggle3d() {
    const map = mapRef.current;
    if (!map) return;
    const next = !pitched;
    setPitched(next);
    map.easeTo({ pitch: next ? 55 : 0, duration: 500 });
  }

  function locateMe() {
    const map = mapRef.current;
    if (!map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      pos => map.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 15 }),
      err => console.error(`NearbyMap locateMe failed: [${err.code}] ${err.message}`),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--cp-map)', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, visibility: mapFailed ? 'hidden' : 'visible' }} />

      {mapFailed && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: 'var(--cp-ink-3)' }}>
          <i className="ph-bold ph-map-trifold" style={{ fontSize: 28 }} />
          <span style={{ font: '600 13px/1.4 Outfit,sans-serif' }}>Map unavailable</span>
        </div>
      )}

      <div style={{ position: 'absolute', right: mob ? 16 : 20, top: mob ? 70 : 20, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4 }}>
        <button onClick={onToggleMaximize} title={maximized ? 'Exit full screen' : 'Full screen map'} style={mapBtnStyle}>
          <i className={`ph-bold ${maximized ? 'ph-arrows-in-simple' : 'ph-arrows-out-simple'}`} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', borderRadius: 14, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', overflow: 'hidden' }}>
          <button onClick={() => mapRef.current?.zoomIn()} style={{ ...zoomBtnStyle, borderBottom: '1px solid var(--cp-line)' }}><i className="ph-bold ph-plus" /></button>
          <button onClick={() => mapRef.current?.zoomOut()} style={zoomBtnStyle}><i className="ph-bold ph-minus" /></button>
        </div>
        <button onClick={toggle3d} title="Toggle 3D buildings" style={{ ...mapBtnStyle, color: pitched ? 'var(--cp-pulse)' : 'var(--cp-ink)' }}>
          <i className="ph-bold ph-cube" />
        </button>
        <button onClick={locateMe} title="My location" style={{ ...mapBtnStyle, color: 'var(--cp-pulse)' }}>
          <i className="ph-fill ph-navigation-arrow" />
        </button>
      </div>
    </div>
  );
}
