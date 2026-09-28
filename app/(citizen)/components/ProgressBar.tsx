'use client';
import type { Stage } from '@/lib/domain/types';
import { step } from '@/lib/domain/rules';

const SEGC = ['var(--cp-ink-3)', 'var(--cp-marigold)', 'var(--cp-peacock)', 'var(--cp-pulse)', 'var(--cp-leaf)'];

export function ProgressBar({ stage }: { stage: Stage }) {
  const st = step(stage);
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[0, 1, 2, 3, 4].map(j => (
        <span key={j} style={{ width: 12, height: 4, borderRadius: 2, background: stage === 'rejected' ? 'var(--cp-line)' : j <= st ? SEGC[st] : 'var(--cp-line)' }} />
      ))}
    </div>
  );
}
