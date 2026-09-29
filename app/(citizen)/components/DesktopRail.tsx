'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  wide: boolean;
  onReport: () => void;
  meInitials: string;
  needConfirm?: number;
}

const NAV = [
  { key: 'home',  href: '/nearby',  icon: 'ph-map-trifold',     label: 'Nearby'   },
  { key: 'feed',  href: '/feeds',   icon: 'ph-newspaper',        label: 'Feed'     },
  { key: 'search',href: '/search',  icon: 'ph-magnifying-glass', label: 'Search'   },
  { key: 'cases', href: '/cases',   icon: 'ph-briefcase',        label: 'Cases'    },
];

function isActive(pathname: string, href: string) {
  return pathname.startsWith(href);
}

export function DesktopRail({ wide, onReport, meInitials, needConfirm = 0 }: Props) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered]     = useState(false);

  if (collapsed) {
    return (
      <nav
        data-cp-theme="dark"
        style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, width: 72, boxSizing: 'border-box', padding: '18px 0 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: '#000', borderRight: '1px solid #1a1a1a', zIndex: 20, overflowX: 'hidden', transition: 'width .25s cubic-bezier(.2,.9,.3,1)' }}
      >
        {/* Logo / expand button — hover tracked only on this element */}
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Image src="/koodal-mark.png" alt="Koodal" width={36} height={36} style={{ borderRadius: '50%', display: 'block' }} />
          {hovered && (
            <button
              onClick={() => setCollapsed(false)}
              title="Expand sidebar"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', borderRadius: '50%', background: '#fff', color: '#000', border: 'none', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}
            >
              <i className="ph-bold ph-caret-double-right" />
            </button>
          )}
        </div>

        {/* Report */}
        <button data-glare="1"
          onClick={onReport}
          title="Report issue"
          style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', border: 'none', cursor: 'pointer', fontSize: 20, display: 'grid', placeItems: 'center', marginBottom: 8 }}
        >
          <i className="ph-bold ph-camera" />
        </button>

        {/* Nav */}
        {NAV.map(({ key, href, icon, label }) => {
          const active = isActive(pathname, href);
          const badge = key === 'cases' && needConfirm > 0;
          return (
            <Link
              key={key}
              href={href}
              title={label}
              style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: active ? 'var(--cp-surface-2)' : 'transparent', color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', border: 'none', cursor: 'pointer', fontSize: 22, display: 'grid', placeItems: 'center', textDecoration: 'none' }}
            >
              <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} />
              {badge && (
                <span style={{ position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: 'var(--cp-marigold)', color: '#000', font: '700 10px/16px Outfit,sans-serif', textAlign: 'center', boxSizing: 'border-box' }}>{needConfirm}</span>
              )}
            </Link>
          );
        })}

        <div style={{ flex: 1 }} />

        {/* Settings */}
        <Link
          href="/settings"
          title="Settings"
          style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: isActive(pathname, '/settings') ? 'var(--cp-surface-2)' : 'transparent', color: isActive(pathname, '/settings') ? 'var(--cp-ink)' : 'var(--cp-ink-3)', border: 'none', cursor: 'pointer', fontSize: 20, display: 'grid', placeItems: 'center', textDecoration: 'none', marginBottom: 4 }}
        >
          <i className={`${isActive(pathname, '/settings') ? 'ph-fill' : 'ph-bold'} ph-gear-six`} />
        </Link>

        {/* Avatar */}
        <Link
          href="/profile"
          title="Profile"
          style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', border: 'none', cursor: 'pointer', font: "400 11px/32px 'DM Serif Display',serif", textAlign: 'center', textDecoration: 'none', display: 'grid', placeItems: 'center' }}
        >
          {meInitials}
        </Link>
      </nav>
    );
  }

  // Expanded
  const railW = wide ? '232px' : '200px';
  return (
    <nav
      data-cp-theme="dark"
      style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0, width: railW, boxSizing: 'border-box', padding: '18px 12px 16px', display: 'flex', flexDirection: 'column', gap: 6, background: '#000', borderRight: '1px solid #1a1a1a', zIndex: 20, overflowX: 'hidden', transition: 'width .25s cubic-bezier(.2,.9,.3,1)' }}
    >
      {/* Logo row — hover tracked only on this button, not the whole nav */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => setCollapsed(true)}
        title="Collapse sidebar"
        style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 12px', height: 44, padding: '0 4px', border: 'none', cursor: 'pointer', textAlign: 'left', borderRadius: 14, background: hovered ? 'var(--cp-surface-2)' : 'transparent', transition: 'background .25s' }}
      >
        {/* Logo mark / << — counter-rotating cross-fade */}
        <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
          {/* Koodal mark: tilts clockwise and shrinks out */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
            opacity: hovered ? 0 : 1,
            transform: hovered ? 'rotate(30deg) scale(0.5)' : 'rotate(0deg) scale(1)',
            transition: 'opacity .2s, transform .28s cubic-bezier(.4,0,.6,1)',
          }}>
            <Image src="/koodal-mark.png" alt="Koodal" width={36} height={36} />
          </div>
          {/* << circle: tilts in counter-clockwise with spring overshoot */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', background: '#fff',
            display: 'grid', placeItems: 'center',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'rotate(0deg) scale(1)' : 'rotate(-30deg) scale(0.5)',
            transition: 'opacity .2s, transform .32s cubic-bezier(.2,1.5,.4,1)',
          }}>
            <i className="ph-bold ph-caret-double-left" style={{
              fontSize: 15, color: '#000', display: 'block',
              transform: hovered ? 'scale(1)' : 'scale(0.6)',
              transition: 'transform .32s cubic-bezier(.2,1.5,.4,1)',
            }} />
          </div>
        </div>

        {/* KOODAL text — slight rightward nudge on hover */}
        <span style={{
          flex: 1, font: '700 18px/1 Outfit,sans-serif', letterSpacing: '.06em', whiteSpace: 'nowrap', color: '#fff',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform .25s cubic-bezier(.2,1.2,.4,1)',
        }}>KOODAL</span>

        {/* Sidebar icon slides in from left */}
        <div style={{
          width: 24, height: 24, flexShrink: 0, display: 'grid', placeItems: 'center',
          color: 'var(--cp-ink-3)', fontSize: 17,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(-6px)',
          transition: 'opacity .2s .04s, transform .25s .04s cubic-bezier(.2,1.2,.4,1)',
        }}>
          <i className="ph-bold ph-sidebar-simple" />
        </div>
      </button>

      {/* Report CTA */}
      <button data-glare="1"
        onClick={onReport}
        title="Report an issue"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 52, margin: '0 2px 14px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45),inset 0 1px 0 rgb(255 255 255 / .14)', font: '600 15px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap' }}
      >
        <i className="ph-bold ph-camera" style={{ fontSize: 21 }} />
        Report issue
      </button>

      {/* Nav items */}
      {NAV.map(({ key, href, icon, label }) => {
        const active = isActive(pathname, href);
        const badge = key === 'cases' && needConfirm > 0;
        return (
          <Link
            key={key}
            href={href}
            title={label}
            style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height: 46, padding: '0 14px', border: 'none', borderRadius: 999, background: active ? 'var(--cp-surface-2)' : 'transparent', color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}
          >
            <i className={`${active ? 'ph-fill' : 'ph-bold'} ${icon}`} style={{ fontSize: 22 }} />
            <span style={{ flex: 1 }}>{label}</span>
            {badge && (
              <span style={{ minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--cp-marigold)', color: '#000', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center', boxSizing: 'border-box' }}>{needConfirm}</span>
            )}
          </Link>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Settings */}
      <Link
        href="/settings"
        title="Settings"
        style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 12, height: 46, padding: '0 14px', border: 'none', borderRadius: 999, background: isActive(pathname, '/settings') ? 'var(--cp-surface-2)' : 'transparent', color: isActive(pathname, '/settings') ? 'var(--cp-ink)' : 'var(--cp-ink-3)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}
      >
        <i className={`${isActive(pathname, '/settings') ? 'ph-fill' : 'ph-bold'} ph-gear-six`} style={{ fontSize: 22 }} />
        <span style={{ flex: 1 }}>Settings</span>
      </Link>

      {/* Profile */}
      <Link
        href="/profile"
        title="Profile"
        style={{ display: 'flex', alignItems: 'center', gap: 12, height: 46, padding: '0 11px', border: 'none', borderRadius: 999, background: 'transparent', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left', textDecoration: 'none' }}
      >
        <span style={{ width: 28, height: 28, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', font: "400 11px/28px 'DM Serif Display',serif", textAlign: 'center' }}>{meInitials}</span>
        <span style={{ flex: 1, whiteSpace: 'nowrap' }}>Profile</span>
      </Link>
    </nav>
  );
}
