'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  onReport: () => void;
  needConfirm: number;
}

const TABS_L = [
  { href: '/nearby', icon: 'ph-map-trifold', label: 'Nearby' },
  { href: '/feeds',  icon: 'ph-newspaper',   label: 'Feed'   },
];
const TABS_R = [
  { href: '/search', icon: 'ph-magnifying-glass', label: 'Search' },
  { href: '/cases',  icon: 'ph-briefcase',         label: 'Cases'  },
];

function isActive(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export function BottomNav({ onReport, needConfirm }: Props) {
  const pathname = usePathname();
  return (
    <div
      data-cp-theme="dark"
      style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 84, background: '#000', borderTop: '1px solid #1a1a1a', zIndex: 10, display: 'grid', gridTemplateColumns: '1fr 1fr 84px 1fr 1fr', alignItems: 'start', paddingTop: 10, boxSizing: 'border-box' }}
    >
      {TABS_L.map(({ href, icon, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            style={{ position: 'relative', border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none' }}
          >
            <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} style={{ fontSize: 24 }} />
            {label}
          </Link>
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

      {TABS_R.map(({ href, icon, label }) => {
        const active = isActive(pathname, href);
        const badge = href === '/cases' && needConfirm > 0 ? String(needConfirm) : null;
        return (
          <Link
            key={href}
            href={href}
            style={{ position: 'relative', border: 'none', background: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', cursor: 'pointer', textDecoration: 'none' }}
          >
            <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} style={{ fontSize: 24 }} />
            {label}
            {badge && <span style={{ position: 'absolute', top: -4, left: '50%', marginLeft: 6, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--cp-pulse)', color: '#fff', font: '700 11px/18px Outfit,sans-serif', textAlign: 'center' }}>{badge}</span>}
          </Link>
        );
      })}
    </div>
  );
}
