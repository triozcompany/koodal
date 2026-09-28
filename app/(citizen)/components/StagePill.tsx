'use client';
import type { Stage } from '@/lib/domain/types';

const PILL: Record<Stage, [string, string, string]> = {
  reported: ['var(--cp-surface-2)', 'var(--cp-ink-2)', 'New'],
  community: ['var(--cp-marigold)', 'var(--cp-on-marigold)', 'Gathering support'],
  review: ['var(--cp-peacock-soft)', 'var(--cp-ink)', 'With govt'],
  verified: ['var(--cp-peacock)', '#fff', 'Official case'],
  assigned: ['var(--cp-peacock)', '#fff', 'Official case'],
  progress: ['var(--cp-pulse)', '#fff', 'In progress'],
  resolved: ['var(--cp-leaf-soft)', 'var(--cp-ink)', 'Fixed · confirm'],
  closed: ['var(--cp-leaf)', '#fff', 'Closed'],
  rejected: ['var(--cp-surface-2)', 'var(--cp-ink-3)', 'Not accepted'],
};

export function pillColors(stage: Stage) { return PILL[stage] ?? PILL.reported; }

export function StagePill({ stage }: { stage: Stage }) {
  const [bg, fg, label] = pillColors(stage);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: bg, color: fg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {label}
    </span>
  );
}
