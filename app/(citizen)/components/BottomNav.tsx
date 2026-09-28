'use client';

type Screen = 'home' | 'feed' | 'search' | 'cases' | 'detail' | string;

interface Props {
  screen: Screen;
  onNav: (s: string) => void;
  onReport: () => void;
  needConfirm: number;
}

const TABS_L = [
  { key: 'home',   icon: 'ph-map-trifold', label: 'Nearby' },
  { key: 'feed',   icon: 'ph-newspaper',   label: 'Feed'   },
];
const TABS_R = [
  { key: 'search', icon: 'ph-magnifying-glass', label: 'Search' },
  { key: 'cases',  icon: 'ph-briefcase',         label: 'Cases'  },
];

export function BottomNav({ screen, onNav, onReport, needConfirm }: Props) {
  return (
    <div
      data-cp-theme="dark"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, background: '#000', borderTop: '1px solid #1a1a1a', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 84px 1fr 1fr', alignItems: 'start', paddingTop: 10, boxSizing: 'border-box' }}
    >
      {TABS_L.map(({ key, icon, label }) => {
        const active = screen === key;
        return (
          <button
            key={key}
            onClick={() => onNav(key)}
            style={{ position: 'relative', border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} style={{ fontSize: 24 }} />
            {label}
          </button>
        );
      })}

      <button
        data-glare="1"
        onClick={onReport}
        title="Report"
        style={{ justifySelf: 'center', marginTop: -24, width: 68, height: 68, borderRadius: '50%', background: 'radial-gradient(circle at 50% 30%,#2e2e2e,#060606 72%)', border: '1.5px solid #3a3a3a', boxShadow: '0 0 0 5px #000,0 0 28px 2px rgb(255 255 255 / .16)', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 28, transition: 'transform .12s' }}
      >
        <i className="ph-bold ph-camera" />
      </button>

      {TABS_R.map(({ key, icon, label }) => {
        const active = screen === key;
        const badge = key === 'cases' && needConfirm > 0 ? String(needConfirm) : null;
        return (
          <button
            key={key}
            onClick={() => onNav(key)}
            style={{ position: 'relative', border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer' }}
          >
            <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} style={{ fontSize: 24 }} />
            {label}
            {badge && <span style={{ position: 'absolute', top: -4, left: '50%', marginLeft: 6, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 11px/18px Outfit,sans-serif', textAlign: 'center' }}>{badge}</span>}
          </button>
        );
      })}
    </div>
  );
}
