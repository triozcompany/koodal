'use client';
import { refreshApp } from '@/lib/refreshApp';

// Replaces the root layout on failure, so CSS variables aren't available here.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  const btn = { font: '600 14px/1 sans-serif', padding: '12px 18px', borderRadius: 12, border: '1px solid #ccc', cursor: 'pointer' } as const;
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'sans-serif', textAlign: 'center', padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center' }}>
          <h1 style={{ margin: 0 }}>Something went wrong</h1>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={reset} style={{ ...btn, background: '#fff' }}>Try again</button>
            <button onClick={refreshApp} style={{ ...btn, background: '#f5b301' }}>Refresh app</button>
          </div>
        </div>
      </body>
    </html>
  );
}
