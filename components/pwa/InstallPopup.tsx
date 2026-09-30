'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useInstall } from './PwaProvider';

const DISMISS_KEY = 'koodal-install-dismissed-at';
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;
const DELAY_MS = 5000;
// The Console is a desktop work tool and member onboarding is a focused flow: don't interrupt either.
const QUIET_PREFIXES = ['/console', '/onboard-member'];

function recentlyDismissed() {
  try {
    const at = Number(localStorage.getItem(DISMISS_KEY));
    return !!at && Date.now() - at < SNOOZE_MS;
  } catch { return false; }
}
function snooze() {
  try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* storage blocked: popup just shows next visit */ }
}

/** One-time "install the app" card, shown a few seconds after load when installing is possible. */
export function InstallPopup() {
  const { showInstall, isIOS, promptInstall } = useInstall();
  const pathname = usePathname();
  const quiet = QUIET_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'));
  const [armed, setArmed] = useState(false);   // delay elapsed
  const [closed, setClosed] = useState(false); // dismissed or acted on during this page load
  const [mob, setMob] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    if (!showInstall || closed || recentlyDismissed()) return;
    const t = setTimeout(() => setArmed(true), DELAY_MS);
    return () => clearTimeout(t);
  }, [showInstall, closed]);

  useEffect(() => {
    const m = window.matchMedia('(max-width: 719px)');
    const r = window.matchMedia('(prefers-reduced-motion: reduce)');
    const read = () => { setMob(m.matches); setReduceMotion(r.matches); };
    read();
    m.addEventListener('change', read);
    return () => m.removeEventListener('change', read);
  }, []);

  const visible = armed && showInstall && !closed && !quiet;

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { snooze(); setClosed(true); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  const install = async () => {
    snooze();            // don't ask again soon, whichever way the prompt goes
    setClosed(true);
    await promptInstall();
  };
  const notNow = () => { snooze(); setClosed(true); };

  // Citizen mobile has a bottom tab bar (84px) with a FAB that rises 24px above it.
  const onCitizenMobile = mob && !['/', '/pitch'].includes(pathname);
  const bottom = onCitizenMobile ? 'calc(120px + env(safe-area-inset-bottom))' : 'max(16px, env(safe-area-inset-bottom))';

  return (
    <div
      role="dialog"
      aria-labelledby="install-popup-title"
      style={{
        position: 'fixed', zIndex: 120, bottom,
        ...(mob ? { left: 12, right: 12 } : { right: 20, width: 380 }),
        padding: 16, borderRadius: 22, background: '#0f0f0f', color: '#f5f5f5',
        boxShadow: '0 30px 60px -20px rgb(0 0 0 / .55)', display: 'flex', flexDirection: 'column', gap: 14,
        animation: reduceMotion ? 'none' : 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ width: 46, height: 46, flex: 'none', borderRadius: 14, background: '#fff', display: 'grid', placeItems: 'center' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/android/launchericon-192x192.png" alt="" width={34} height={34} style={{ objectFit: 'contain' }} />
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
          <span id="install-popup-title" style={{ font: "400 21px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Install Koodal</span>
          <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: '#bdbdbd' }}>
            {isIOS ? 'Add it to your home screen for a full-screen app.' : 'Open it from your home screen, full screen, in one tap.'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={notNow} style={{ flex: 1, height: 44, borderRadius: 999, border: '1px solid #2e2e2e', background: 'transparent', color: '#f5f5f5', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>Not now</button>
        <button onClick={install} style={{ flex: 1.4, height: 44, borderRadius: 999, border: 'none', background: 'var(--cp-marigold)', color: '#0f0f0f', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
          <i className="ph-bold ph-download-simple" />{isIOS ? 'Show me how' : 'Install'}
        </button>
      </div>
    </div>
  );
}
