'use client';
import Link from 'next/link';

export function DemoTag() {
  return (
    <span title="Sample case that came with the design" style={{ display: 'inline-flex', alignItems: 'center', height: 17, padding: '0 6px', marginLeft: 6, borderRadius: 6, background: 'var(--cp-surface-2)', color: 'var(--cp-ink-3)', font: '700 9.5px/1 Outfit,sans-serif', letterSpacing: '.1em', textTransform: 'uppercase', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>Demo</span>
  );
}

/** Shown when the real-only view has nothing in it yet. */
export function RealOnlyEmpty({ compact }: { compact?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', padding: compact ? '14px 16px' : '32px 24px', justifyContent: compact ? 'flex-start' : 'center', textAlign: compact ? 'left' : 'center', borderRadius: 20, border: '1.5px dashed var(--cp-line)', background: 'var(--cp-surface)' }}>
      <span style={{ width: 40, height: 40, flex: 'none', borderRadius: 12, background: 'var(--cp-peacock-soft)', color: 'var(--cp-peacock)', display: 'grid', placeItems: 'center', fontSize: 19 }}><i className="ph-bold ph-users-three" /></span>
      <span style={{ flex: '1 1 260px', display: 'flex', flexDirection: 'column', gap: 5, minWidth: 0 }}>
        <span style={{ font: '600 14px/1.25 Outfit,sans-serif' }}>No real cases yet</span>
        <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>A citizen report becomes a case once enough neighbours support it. Until then it shows under New signals. The sample cases from the design are hidden.</span>
      </span>
      <Link href="/console/settings" style={{ height: 40, padding: '0 16px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', boxShadow: '0 2px 0 var(--cp-edge)', color: 'var(--cp-ink)', font: '600 12.5px/40px Outfit,sans-serif', textDecoration: 'none', whiteSpace: 'nowrap' }}>Show demo data</Link>
    </div>
  );
}
