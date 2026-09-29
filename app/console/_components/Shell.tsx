'use client';
import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { currentOrg } from '@/lib/console/org';
import { useMob } from '@/lib/console/useMob';
import { govStage } from '@/lib/console/derive';
import { readPrefs, TIMEOUT_MIN } from '@/lib/console/prefs';
import { useConsole } from './ConsoleProvider';

const NAV = [
  { href: '/console', label: 'Home', icon: 'ph-house' },
  { href: '/console/cases', label: 'Cases', icon: 'ph-folders' },
  { href: '/console/map', label: 'Map', icon: 'ph-map-trifold' },
  { href: '/console/insights', label: 'Insights', icon: 'ph-chart-line-up' },
  { href: '/console/search', label: 'Search', icon: 'ph-magnifying-glass' },
];
const TITLES: Record<string, string> = { '/console/profile': 'Profile', '/console/settings': 'Settings' };

const initials = (n: string) => n.split(' ').filter(Boolean).slice(0, 2).map((s) => s[0]).join('').toUpperCase();
const isActive = (path: string, href: string) => (href === '/console' ? path === href : path === href || path.startsWith(href + '/'));

function useWide() {
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const u = () => setWide(window.innerWidth >= 1100);
    u();
    window.addEventListener('resize', u);
    return () => window.removeEventListener('resize', u);
  }, []);
  return wide;
}

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const mob = useMob();
  const wide = useWide();
  const { staff, ready, configReady, issues, railCollapsed, toggleRail, signOut, toast } = useConsole();
  const pending = issues.filter((i) => govStage(i) === 'pending').length;
  const [logoHover, setLogoHover] = useState(false);

  // Auto sign-out after the inactivity window chosen in Settings (read fresh each check).
  useEffect(() => {
    if (!staff) return;
    let last = Date.now();
    const bump = () => { last = Date.now(); };
    const evs = ['pointerdown', 'keydown', 'scroll'] as const;
    evs.forEach((e) => window.addEventListener(e, bump, { passive: true }));
    const t = setInterval(() => {
      if (Date.now() - last > TIMEOUT_MIN[readPrefs().timeout] * 60_000) { signOut(); toast('Signed out after inactivity'); }
    }, 15_000);
    return () => { evs.forEach((e) => window.removeEventListener(e, bump)); clearInterval(t); };
  }, [staff, signOut, toast]);

  // "/" jumps to Search from anywhere, unless the user is typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || t?.closest('input,textarea,select,[contenteditable]')) return;
      e.preventDefault();
      router.push('/console/search');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);

  // Route guard. The sign-in screen is built in Phase 3.
  useEffect(() => { if (ready && !staff) router.replace('/console/sign-in'); }, [ready, staff, router]);
  if (!ready || !staff || !configReady) return null;

  const expanded = wide && !railCollapsed;
  const ini = initials(staff.name);
  const subPage = TITLES[path] ?? (path.startsWith('/console/cases/') ? 'Case' : null);
  const activeHref = subPage && path.startsWith('/console/cases/') ? '/console/cases' : path;

  if (mob) {
    return (
      <div style={{ paddingBottom: 84 }}>
        <header data-cp-theme={path === '/console/settings' ? 'dark' : undefined} style={{ position: subPage ? 'sticky' : 'relative', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: 10, height: 60, padding: '0 16px', background: 'var(--cp-bg)', borderBottom: '1px solid var(--cp-line)' }}>
          {subPage ? (
            <>
              <button onClick={() => router.back()} aria-label="Back" style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center' }}><i className="ph-bold ph-arrow-left" /></button>
              <span style={{ flex: 1, textAlign: 'center', font: '600 15px/1.1 Outfit,sans-serif' }}>{subPage}</span>
              <span style={{ width: 40, flex: 'none' }} />
            </>
          ) : (
            <>
              <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
                <img src="/koodal-mark.png" alt="Koodal" style={{ width: 24, height: 24, objectFit: 'contain', filter: 'invert(1)' }} />
              </span>
              <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '600 15px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentOrg.short}</span>
                <span style={{ font: '600 8.5px/1 Outfit,sans-serif', letterSpacing: '.2em', color: 'var(--cp-pulse)', whiteSpace: 'nowrap' }}>KOODAL CONSOLE</span>
              </span>
              <Link href="/console/settings" title="Settings" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', fontSize: 18, display: 'grid', placeItems: 'center', textDecoration: 'none' }}><i className="ph-bold ph-gear-six" /></Link>
              <Link href="/console/profile" title="Profile" style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--cp-marigold)', color: '#0f0f0f', font: "400 14px/1 'DM Serif Display',serif", display: 'grid', placeItems: 'center', textDecoration: 'none' }}>{ini}</Link>
            </>
          )}
        </header>
        <main>{children}</main>
        <nav data-cp-theme="dark" style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 40, height: 76, paddingBottom: 'env(safe-area-inset-bottom)', background: '#000', color: '#f5f5f5', borderTop: '1px solid #1a1a1a', display: 'grid', gridTemplateColumns: 'repeat(5,minmax(0,1fr))', alignItems: 'center' }}>
          {NAV.map((n) => {
            const on = isActive(activeHref, n.href);
            return (
              <Link key={n.href} href={n.href} style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5, color: on ? '#fff' : '#8a8a8a', font: '600 9.5px/1 Outfit,sans-serif', letterSpacing: '.12em', textTransform: 'uppercase', textDecoration: 'none' }}>
                <i className={`${on ? 'ph-fill' : 'ph-bold'} ${n.icon}`} style={{ fontSize: 23 }} />
                {n.label}
                {n.href === '/console/cases' && pending > 0 && (
                  <span style={{ position: 'absolute', top: 10, left: '50%', marginLeft: 6, minWidth: 18, height: 18, borderRadius: 9, background: 'var(--cp-marigold)', color: '#0f0f0f', font: '700 11px/18px Outfit,sans-serif', textAlign: 'center', padding: '0 4px', boxSizing: 'border-box', letterSpacing: 0 }}>{pending}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  const railItem = (on: boolean) => ({
    position: 'relative' as const, display: 'flex', alignItems: 'center', gap: 12, height: 46, padding: '0 14px', border: 'none', borderRadius: 999,
    background: on ? 'var(--cp-surface-2)' : 'transparent', color: on ? '#fff' : '#8a8a8a', font: "600 13.5px/1 Outfit,'Noto Sans Tamil',sans-serif",
    cursor: 'pointer', textAlign: 'left' as const, whiteSpace: 'nowrap' as const, textDecoration: 'none',
  });
  const swap = wide && railCollapsed && logoHover;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav data-cp-theme="dark" style={{ position: 'sticky', top: 0, height: '100vh', flex: 'none', width: expanded ? 236 : 76, boxSizing: 'border-box', padding: '18px 12px 16px', display: 'flex', flexDirection: 'column', gap: 6, background: '#000', color: '#f5f5f5', borderRight: '1px solid #1a1a1a', zIndex: 20, transition: 'width .3s cubic-bezier(.2,.9,.3,1)' }}>
        <button
          onClick={() => { if (wide) toggleRail(); }} onMouseEnter={() => setLogoHover(true)} onMouseLeave={() => setLogoHover(false)}
          title={!wide ? 'Koodal' : railCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: 6, margin: '0 2px 18px', border: 'none', borderRadius: 14, background: logoHover && wide ? '#141414' : 'transparent', color: '#f5f5f5', cursor: wide ? 'pointer' : 'default', textAlign: 'left', transition: 'background .2s' }}
        >
          <span style={{ position: 'relative', width: 36, height: 36, flex: 'none', borderRadius: '50%', background: '#fff', display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <img src="/koodal-mark.png" alt="Koodal" style={{ position: 'absolute', width: 28, height: 28, objectFit: 'contain', opacity: swap ? 0 : 1, transform: `scale(${swap ? 0.4 : 1})`, transition: 'opacity .2s,transform .25s cubic-bezier(.3,1.6,.5,1)' }} />
            <i className="ph-bold ph-sidebar-simple" style={{ position: 'absolute', fontSize: 17, color: '#0f0f0f', opacity: swap ? 1 : 0, transform: `scale(${swap ? 1 : 0.4})`, transition: 'opacity .2s,transform .25s cubic-bezier(.3,1.6,.5,1)' }} />
          </span>
          {expanded && (
            <>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
                <span style={{ font: '700 18px/1 Outfit,sans-serif', letterSpacing: '.06em' }}>KOODAL</span>
                <span style={{ font: '600 9px/1 Outfit,sans-serif', letterSpacing: '.22em', color: 'var(--cp-ink-3)' }}>CONSOLE</span>
              </span>
              <i className="ph-bold ph-sidebar-simple" style={{ fontSize: 18, color: '#7c7c7c', marginRight: 4, opacity: logoHover ? 1 : 0.5, transition: 'opacity .2s' }} />
            </>
          )}
        </button>
        {/* Fixed-org identity card. Not a switcher: multi-org is out of scope for this phase. */}
        <div title={currentOrg.name} style={{ display: 'flex', alignItems: 'center', gap: 10, height: 56, margin: '-6px 0 14px', padding: '0 8px', boxSizing: 'border-box', border: '1px solid #262626', borderRadius: 16 }}>
          <span style={{ width: 34, height: 34, flex: 'none', borderRadius: 10, background: 'var(--cp-marigold)', color: '#0f0f0f', font: '700 12.5px/34px Outfit,sans-serif', textAlign: 'center' }}>GC</span>
          {expanded && (
            <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
              <span style={{ font: '600 13.5px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentOrg.short}</span>
              <span style={{ font: '600 9px/1 Outfit,sans-serif', letterSpacing: '.18em', color: 'var(--cp-marigold)', whiteSpace: 'nowrap' }}>GOVERNMENT</span>
            </span>
          )}
        </div>
        {NAV.map((n) => {
          const on = isActive(activeHref, n.href);
          return (
            <Link key={n.href} href={n.href} title={n.label} style={railItem(on)}>
              <i className={`${on ? 'ph-fill' : 'ph-bold'} ${n.icon}`} style={{ fontSize: 22 }} />
              {expanded && <span style={{ flex: 1 }}>{n.label}</span>}
              {n.href === '/console/cases' && pending > 0 && (
                <span style={{ minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-marigold)', color: '#0f0f0f', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center', position: expanded ? 'static' : 'absolute', top: 3, right: 4 }}>{pending}</span>
              )}
            </Link>
          );
        })}
        <div style={{ flex: 1 }} />
        <Link href="/console/settings" title="Settings" style={railItem(path === '/console/settings')}>
          <i className="ph-bold ph-gear-six" style={{ fontSize: 22 }} />
          {expanded && 'Settings'}
        </Link>
        <Link href="/console/profile" title="Profile" style={{ ...railItem(path === '/console/profile'), height: 52, padding: '0 9px', color: '#f5f5f5', font: '600 13px/1.1 Outfit,sans-serif' }}>
          <span style={{ width: 34, height: 34, flex: 'none', borderRadius: '50%', background: 'var(--cp-marigold)', color: '#0f0f0f', font: "400 13px/34px 'DM Serif Display',serif", textAlign: 'center' }}>{ini}</span>
          {expanded && (
            <span style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{staff.name}</span>
              <span style={{ font: '500 11px/1 Outfit,sans-serif', color: '#8a8a8a', whiteSpace: 'nowrap' }}>{staff.title}</span>
            </span>
          )}
        </Link>
      </nav>
      <main style={{ flex: 1, minWidth: 0, position: 'relative' }}>{children}</main>
    </div>
  );
}
