'use client';
import { useEffect } from 'react';

const STEPS: [string, string][] = [
  ['ph-export', 'Tap the Share button in your browser'],
  ['ph-plus-square', 'Choose “Add to Home Screen”'],
  ['ph-check-circle', 'Tap “Add”. Koodal opens like an app'],
];

/** iOS has no install prompt API, so the steps are shown by hand. */
export function IOSInstallHelp({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div role="dialog" aria-labelledby="ios-install-title" style={{ position: 'fixed', left: 12, right: 12, bottom: 'max(16px, env(safe-area-inset-bottom))', zIndex: 130, maxWidth: 420, margin: '0 auto', padding: 18, borderRadius: 22, background: '#0f0f0f', color: '#f5f5f5', boxShadow: '0 30px 60px -20px rgb(0 0 0 / .55)', display: 'flex', flexDirection: 'column', gap: 14, animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <span id="ios-install-title" style={{ font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Add Koodal to your home screen</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map(([icon, text], i) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, font: '500 14px/1.35 Outfit,sans-serif', color: '#e5e5e5' }}>
            <span style={{ width: 34, height: 34, flex: 'none', borderRadius: 10, background: '#1e1e1e', display: 'grid', placeItems: 'center', fontSize: 17, color: 'var(--cp-marigold)' }}><i className={`ph-bold ${icon}`} /></span>
            <span><b style={{ color: '#8a8a8a', marginRight: 6 }}>{i + 1}</b>{text}</span>
          </div>
        ))}
      </div>
      <button onClick={onClose} style={{ height: 46, borderRadius: 999, border: 'none', background: 'var(--cp-marigold)', color: '#0f0f0f', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}>Got it</button>
    </div>
  );
}
