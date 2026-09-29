'use client';
import { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ensureMaplibreWorker } from '@/lib/maplibre-setup';
import { reverseGeocode, searchAddress, type GeocodeResult } from '@/lib/geo/nominatim';

// OpenFreeMap — free vector tiles, no API key/signup (https://openfreemap.org).
// `positron` matches the muted basemap used in NearbyMap.tsx.
const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
// Fallback center when geolocation is denied/unavailable — roughly Velachery, Chennai.
const DEFAULT_CENTER: [number, number] = [80.2206, 12.9750];

interface Props {
  initial?: GeocodeResult | null;
  onConfirm: (loc: GeocodeResult) => void;
  onClose: () => void;
}

export function LocationPicker({ initial, onConfirm, onClose }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const centerRef = useRef<{ lat: number; lng: number }>({
    lat: initial?.lat ?? DEFAULT_CENTER[1],
    lng: initial?.lng ?? DEFAULT_CENTER[0],
  });
  const cityAreaRef = useRef<{ city?: string; area?: string }>({ city: initial?.city, area: initial?.area });
  const reverseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [address, setAddress] = useState(initial?.address ?? '');
  const [resolving, setResolving] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [mapFailed, setMapFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodeResult[]>([]);

  async function resolve(lat: number, lng: number) {
    setResolving(true);
    const r = await reverseGeocode(lat, lng);
    if (r) { setAddress(r.address); cityAreaRef.current = { city: r.city, area: r.area }; }
    setResolving(false);
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;
    const start: [number, number] = initial ? [initial.lng, initial.lat] : DEFAULT_CENTER;

    ensureMaplibreWorker();
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({ container: mapContainerRef.current, style: MAP_STYLE, center: start, zoom: 15 });
    } catch (err) {
      console.error('LocationPicker: map creation failed:', err);
      setMapFailed(true);
      return;
    }
    mapRef.current = map;

    // A style/tile load failure doesn't throw — it fires this event instead,
    // and without a listener it fails completely silently (a blank canvas
    // with no visible sign anything went wrong).
    map.on('error', e => {
      console.error('LocationPicker: map error:', e.error?.message ?? e);
      setMapFailed(true);
    });

    // Defensive: guards against the container-not-sized-yet class of bug —
    // cheap even though this drawer doesn't animate its own size.
    requestAnimationFrame(() => map.resize());

    map.on('moveend', () => {
      const c = map.getCenter();
      centerRef.current = { lat: c.lat, lng: c.lng };
      if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
      reverseTimerRef.current = setTimeout(() => resolve(c.lat, c.lng), 700);
    });

    if (!initial) {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const { latitude, longitude } = pos.coords;
            centerRef.current = { lat: latitude, lng: longitude };
            map.jumpTo({ center: [longitude, latitude], zoom: 16 });
            resolve(latitude, longitude);
          },
          err => {
            // GeolocationPositionError's code/message are inherited getters,
            // not own enumerable properties, so logging the raw object prints "{}".
            console.error(`geolocation failed: [${err.code}] ${err.message}`);
            setGeoError("Couldn't get your location — search or pan the map to set it.");
          },
          { enableHighAccuracy: true, timeout: 8000 },
        );
      } else {
        setGeoError('Location isn’t available on this device — search or pan the map to set it.');
      }
    }

    return () => {
      if (reverseTimerRef.current) clearTimeout(reverseTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onSearchChange(v: string) {
    setQuery(v);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (v.trim().length < 3) { setResults([]); return; }
    searchTimerRef.current = setTimeout(async () => setResults(await searchAddress(v)), 400);
  }

  function pickResult(r: GeocodeResult) {
    setResults([]);
    setQuery('');
    setAddress(r.address);
    cityAreaRef.current = { city: r.city, area: r.area };
    centerRef.current = { lat: r.lat, lng: r.lng };
    mapRef.current?.jumpTo({ center: [r.lng, r.lat], zoom: 16 });
  }

  function confirm() {
    onConfirm({
      lat: centerRef.current.lat,
      lng: centerRef.current.lng,
      address: address.trim() || 'Unnamed location',
      ...cityAreaRef.current,
    });
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 220, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, left: 10, maxWidth: 520, margin: '0 auto', zIndex: 221, background: 'var(--cp-surface)', borderRadius: 24, border: '1px solid var(--cp-line)', boxShadow: '0 30px 70px -24px rgb(0 0 0 / .45)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '18px 18px 12px', flexShrink: 0 }}>
          <span style={{ flex: 1, font: "400 20px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Set the location</span>
          <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>

        <div style={{ padding: '0 18px 12px', flexShrink: 0 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 46, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
              <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 16 }} />
              <input
                value={query}
                onChange={e => onSearchChange(e.target.value)}
                placeholder="Search for an address or area"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }}
              />
            </div>
            {results.length > 0 && (
              <div style={{ position: 'absolute', left: 0, right: 0, top: 50, zIndex: 5, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', borderRadius: 16, boxShadow: '0 16px 40px -16px rgb(0 0 0 / .3)', overflow: 'hidden' }}>
                {results.map((r, i) => (
                  <button key={i} onClick={() => pickResult(r)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', background: 'none', borderTop: i ? '1px solid var(--cp-line)' : 'none', color: 'var(--cp-ink)', font: '500 12.5px/1.4 Outfit,sans-serif', cursor: 'pointer' }}>
                    {r.address}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ position: 'relative', flex: 1, minHeight: 200 }}>
          <div ref={mapContainerRef} style={{ position: 'absolute', inset: 0, visibility: mapFailed ? 'hidden' : 'visible' }} />
          {mapFailed ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--cp-surface-2)', padding: 24, textAlign: 'center' }}>
              <i className="ph-bold ph-map-trifold" style={{ fontSize: 28, color: 'var(--cp-ink-3)' }} />
              <span style={{ font: '600 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>Map preview unavailable</span>
              <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Search or type the exact address below</span>
            </div>
          ) : (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-100%)', pointerEvents: 'none', fontSize: 34, color: 'var(--cp-pulse)', filter: 'drop-shadow(0 4px 6px rgb(0 0 0 / .35))' }}>
              <i className="ph-fill ph-map-pin" />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 18px 18px', flexShrink: 0, borderTop: '1px solid var(--cp-line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 20 }}>
            <i className="ph-bold ph-map-pin-line" style={{ fontSize: 15, color: 'var(--cp-ink-3)', flexShrink: 0 }} />
            <input
              value={resolving ? 'Finding address…' : address}
              onChange={e => setAddress(e.target.value)}
              placeholder="Type the exact location"
              disabled={resolving}
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '600 13px/1.3 Outfit,sans-serif' }}
            />
          </div>
          {geoError && <span style={{ font: '500 11.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{geoError}</span>}
          <button data-glare="1"
            onClick={confirm}
            disabled={resolving || !address.trim()}
            style={{ height: 52, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14.5px/1 Outfit,sans-serif', cursor: resolving ? 'default' : 'pointer', opacity: resolving || !address.trim() ? 0.6 : 1 }}
          >
            Use this location
          </button>
        </div>
      </div>
    </>
  );
}
