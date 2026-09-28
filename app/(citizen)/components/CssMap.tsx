'use client';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';

const PIN_COLORS: Record<string, [string, string]> = {
  reported: ['var(--cp-surface)', 'var(--cp-ink)'],
  community: ['var(--cp-marigold)', 'var(--cp-on-marigold)'],
  review: ['var(--cp-marigold)', 'var(--cp-on-marigold)'],
  verified: ['var(--cp-peacock)', '#fff'],
  assigned: ['var(--cp-peacock)', '#fff'],
  progress: ['var(--cp-pulse)', '#fff'],
  resolved: ['var(--cp-leaf)', '#fff'],
  closed: ['var(--cp-leaf)', '#fff'],
  rejected: ['var(--cp-surface-2)', 'var(--cp-ink-3)'],
};

interface Props {
  issues: Issue[];
  onPinClick: (id: string) => void;
  selectedId?: string;
}

export function CssMap({ issues, onPinClick, selectedId }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: 'var(--cp-map)' }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: '-30%', transform: 'rotate(-9deg)', backgroundImage: 'linear-gradient(var(--cp-map-line) 2px,transparent 2px),linear-gradient(90deg,var(--cp-map-line) 2px,transparent 2px)', backgroundSize: '50px 50px' }} />
        {/* Park */}
        <div style={{ position: 'absolute', left: '8%', top: '12%', width: '18%', height: '14%', borderRadius: 20, background: 'var(--cp-map-park)', transform: 'rotate(-9deg)' }} />
        {/* Water */}
        <div style={{ position: 'absolute', right: '-8%', top: '56%', width: '34%', height: '30%', borderRadius: '50%', background: 'var(--cp-map-water)' }} />
        {/* Roads */}
        <div style={{ position: 'absolute', left: '-10%', top: '50%', width: '120%', height: 16, background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
        <div style={{ position: 'absolute', left: '53%', top: '-10%', width: 14, height: '120%', background: 'var(--cp-map-road)', transform: 'rotate(-9deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
        <div style={{ position: 'absolute', left: '-20%', top: '30%', width: '140%', height: 12, background: 'var(--cp-map-road)', transform: 'rotate(18deg)', boxShadow: '0 0 0 1px var(--cp-map-line)' }} />
        {/* My location dot */}
        <div style={{ position: 'absolute', left: '48%', top: '44%', width: 16, height: 16, margin: '-8px 0 0 -8px', borderRadius: '50%', background: 'var(--cp-ink)', border: '3px solid var(--cp-surface)', boxShadow: '0 0 0 8px color-mix(in oklch,var(--cp-ink) 12%,transparent)' }} />
        {/* Pins */}
        {issues.filter(i => i.stage !== 'rejected').map(i => {
          const [pb, pf] = PIN_COLORS[i.stage] ?? PIN_COLORS.reported;
          const hot = (i.stage === 'community' && i.conf >= 70) || i.stage === 'review';
          const selected = i.id === selectedId;
          const x = i.x + '%';
          const y = (i.y * 0.62 + 8) + '%';
          return (
            <div key={i.id} onClick={() => onPinClick(i.id)} style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%,-100%) scale(${selected ? 1.12 : 1})`, transformOrigin: '50% 100%', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: selected ? 10 : 1 }}>
              {hot && <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 30, borderRadius: 999, background: pb, animation: 'cp-ping 1.9s ease-out infinite' }} />}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 11px 0 9px', borderRadius: 999, background: pb, color: pf, boxShadow: '0 2px 10px rgb(0 0 0 / .16),0 0 0 1px rgb(0 0 0 / .06)', font: '700 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap', boxSizing: 'border-box' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: pb, boxShadow: '0 0 0 2px var(--cp-surface)' }} />
                <i className={`ph-bold ${CATS[i.cat].icon}`} style={{ fontSize: 14 }}></i>
                {i.sup}
              </div>
            </div>
          );
        })}
        {/* Road labels */}
        <span style={{ position: 'absolute', left: '6%', top: '46.5%', transform: 'rotate(-9deg)', font: '500 11px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>100 FEET RD</span>
        <span style={{ position: 'absolute', left: '14%', top: '25%', transform: 'rotate(18deg)', font: '500 11px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>VELACHERY MAIN RD</span>
      </div>
      {/* Recenter */}
      <div style={{ position: 'absolute', right: 16, top: 70, display: 'flex', flexDirection: 'column', gap: 6, zIndex: 4 }}>
        <button style={{ width: 42, height: 42, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-pulse)', cursor: 'pointer', fontSize: 18, boxShadow: '0 4px 14px -6px rgb(0 0 0 / .2)', display: 'grid', placeItems: 'center' }}>
          <i className="ph-fill ph-navigation-arrow" style={{ fontSize: 18 }} />
        </button>
      </div>
    </div>
  );
}
