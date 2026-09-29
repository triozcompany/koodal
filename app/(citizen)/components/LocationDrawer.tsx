'use client';
import { useState, useMemo } from 'react';
import type { Issue } from '@/lib/domain/types';
import type { FilterState } from '@/lib/domain/filters';

const CORP: Record<string, string> = {
  Chennai: 'Greater Chennai Corp',
  Coimbatore: 'Coimbatore City Corp',
  Madurai: 'Madurai Corporation',
};

interface Props {
  f: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  issues: Issue[];
  mobile?: boolean;
}

export function LocationDrawer({ f, onChange, onClose, issues, mobile }: Props) {
  const [search, setSearch] = useState('');

  const cities = useMemo(() => {
    const map: Record<string, number> = {};
    issues.forEach(i => { map[i.city] = (map[i.city] ?? 0) + 1; });
    return Object.entries(map)
      .map(([city, count]) => ({ city, corp: CORP[city] ?? city, count }))
      .sort((a, b) => b.count - a.count);
  }, [issues]);

  const areas = useMemo(() => {
    const map: Record<string, { city: string; count: number }> = {};
    issues.forEach(i => {
      const k = `${i.area}||${i.city}`;
      if (!map[k]) map[k] = { city: i.city, count: 0 };
      map[k].count++;
    });
    return Object.entries(map)
      .map(([k, v]) => ({ area: k.split('||')[0], ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [issues]);

  const q = search.toLowerCase();
  const showNear = !q || 'near me'.includes(q) || 'velachery'.includes(q);
  const filteredCities = q ? cities.filter(c => c.city.toLowerCase().includes(q) || c.corp.toLowerCase().includes(q)) : cities;
  const filteredAreas = q ? areas.filter(a => a.area.toLowerCase().includes(q) || a.city.toLowerCase().includes(q)) : areas;

  function pick(region: string) {
    onChange({ ...f, region });
    onClose();
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }}
      />
      <div style={mobile
        ? { position: 'fixed', left: 10, right: 10, bottom: 10, maxHeight: '82%', zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }
        : { position: 'fixed', top: 10, right: 10, bottom: 10, width: 420, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }
      }>

        {/* Handle — mobile only */}
        {mobile && <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--cp-line)', margin: '12px auto 0', flexShrink: 0 }} />}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: mobile ? '10px 20px 16px' : '22px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <span style={{ flex: 1, font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.025em' }}>Where to explore</span>
          <button
            onClick={onClose}
            style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}
          >
            <i className="ph-bold ph-x" />
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 16px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 48, padding: '0 14px', borderRadius: 14, border: '1.5px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 17, color: 'var(--cp-ink-3)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search area, locality or city"
              style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }}
              autoFocus
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', padding: 0, cursor: 'pointer', color: 'var(--cp-ink-3)', fontSize: 15, display: 'grid', placeItems: 'center' }}>
                <i className="ph-bold ph-x" />
              </button>
            )}
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px 16px' }}>

          {/* Near me */}
          {showNear && (
            <button
              onClick={() => pick('near')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px', borderRadius: 16, border: 'none', background: f.region === 'near' ? 'var(--cp-surface-2)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
            >
              <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: 'var(--cp-pulse)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 22 }}>
                <i className="ph-fill ph-navigation-arrow" />
              </span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                <span style={{ font: '600 14.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink)' }}>Near me</span>
                <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>All reports, every city</span>
              </span>
              {f.region === 'near' && <i className="ph-bold ph-check" style={{ fontSize: 18, color: 'var(--cp-leaf)', flexShrink: 0 }} />}
            </button>
          )}

          {/* Cities */}
          {filteredCities.length > 0 && (
            <>
              <span style={{ display: 'block', padding: '14px 12px 6px', font: '600 10.5px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>PLACES</span>
              {filteredCities.map(({ city, corp, count }) => (
                <button
                  key={city}
                  onClick={() => pick(city)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px', borderRadius: 16, border: 'none', background: f.region === city ? 'var(--cp-surface-2)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
                >
                  <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'grid', placeItems: 'center', fontSize: 22 }}>
                    <i className="ph-bold ph-buildings" />
                  </span>
                  <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                    <span style={{ font: '600 14.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink)' }}>{city}</span>
                    <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{corp} · {count} {count === 1 ? 'issue' : 'issues'}</span>
                  </span>
                  {f.region === city && <i className="ph-bold ph-check" style={{ fontSize: 18, color: 'var(--cp-leaf)', flexShrink: 0 }} />}
                </button>
              ))}
            </>
          )}

          {/* Areas */}
          {filteredAreas.length > 0 && (
            <>
              <div style={{ height: 1, background: 'var(--cp-line)', margin: '10px 12px 4px' }} />
              {filteredAreas.map(({ area, city, count }) => {
                const sel = f.region === area;
                return (
                  <button
                    key={`${area}||${city}`}
                    onClick={() => pick(area)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 14, padding: '12px 12px', borderRadius: 16, border: 'none', background: sel ? 'var(--cp-surface-2)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background .12s' }}
                  >
                    <span style={{ width: 44, height: 44, flexShrink: 0, borderRadius: 14, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', display: 'grid', placeItems: 'center', fontSize: 20 }}>
                      <i className="ph-bold ph-map-pin" />
                    </span>
                    <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
                      <span style={{ font: '600 14.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink)' }}>{area}</span>
                      <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{city} · {count} {count === 1 ? 'issue' : 'issues'}</span>
                    </span>
                    {sel && <i className="ph-bold ph-check" style={{ fontSize: 18, color: 'var(--cp-leaf)', flexShrink: 0 }} />}
                  </button>
                );
              })}
            </>
          )}

          {filteredCities.length === 0 && filteredAreas.length === 0 && !showNear && (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>No results for "{search}"</div>
          )}
        </div>
      </div>
    </>
  );
}
