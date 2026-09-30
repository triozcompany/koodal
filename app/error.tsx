'use client';
import { refreshApp } from '@/lib/refreshApp';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  const btn = { font: '600 14px/1 Outfit,sans-serif', padding: '12px 18px', borderRadius: 12, border: '1px solid var(--cp-line)', cursor: 'pointer' } as const;
  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, background: 'var(--cp-bg)', color: 'var(--cp-ink)', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
        <h1 style={{ font: "400 28px/1.1 'DM Serif Display',serif", margin: 0 }}>Something went wrong</h1>
        <p style={{ font: '500 14px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', margin: 0 }}>Try again, or refresh the app to reload it fresh.</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={reset} style={{ ...btn, background: 'var(--cp-surface)', color: 'var(--cp-ink)' }}>Try again</button>
          <button onClick={refreshApp} style={{ ...btn, background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)' }}>Refresh app</button>
        </div>
      </div>
    </div>
  );
}
