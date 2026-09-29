'use client';

interface Props {
  /** Fill fraction (0–1) for each of the 4 segments: Location, Photo, Details, Post. */
  segments: [number, number, number, number];
  color: string;
  hintIcon: string;
  hintText: string;
  pct: number;
  trackColor?: string;
  mutedColor?: string;
  reducedMotion?: boolean;
}

export function GoalGradientBar({
  segments, color, hintIcon, hintText, pct,
  trackColor = 'var(--cp-surface-2)', mutedColor = 'var(--cp-ink-3)', reducedMotion = false,
}: Props) {
  const segTrans = reducedMotion ? 'none' : 'width .3s cubic-bezier(.3,1.2,.5,1), background .2s';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={hintText}
        style={{ display: 'flex', gap: 4 }}
      >
        {segments.map((frac, k) => (
          <div key={k} style={{ flex: 1, height: 4, borderRadius: 2, background: trackColor, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.max(0, Math.min(1, frac)) * 100}%`, borderRadius: 2, background: color, transition: segTrans }} />
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 11.5px/1 Outfit,sans-serif', color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <i className={`ph-bold ${hintIcon}`}></i>{hintText}
        </span>
        <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: mutedColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{pct}%</span>
      </div>
    </div>
  );
}
