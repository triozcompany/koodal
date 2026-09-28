import type { Stage } from '@/lib/domain/types';
import { SEGC, TRACK } from '@/lib/domain/stage-style';
import { step } from '@/lib/domain/rules';

export interface ProgressTrackProps {
  stage: Stage;
  showLabels?: boolean;
}

export function ProgressTrack({ stage, showLabels = false }: ProgressTrackProps) {
  const st = step(stage);
  const rejected = stage === 'rejected';

  return (
    <div>
      {showLabels && (
        <div style={{ display: 'flex', gap: 3, marginBottom: 6 }}>
          {TRACK.map(([icon, lbl], i) => (
            <div key={i} style={{ width: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <i className={`ph-bold ${icon}`} style={{ fontSize: 10, color: (!rejected && i <= st) ? SEGC[i] : 'var(--cp-ink-3)', opacity: (!rejected && i <= st) ? 1 : 0.35 }} />
              <span style={{ font: '600 8px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{lbl}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 3 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <span
            key={i}
            style={{
              width: 12,
              height: 4,
              borderRadius: 2,
              background: rejected ? 'var(--cp-line)' : i <= st ? SEGC[st] : 'var(--cp-line)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
