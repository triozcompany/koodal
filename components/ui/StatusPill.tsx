import type { Stage } from '@/lib/domain/types';
import { PILL } from '@/lib/domain/stage-style';

export interface StatusPillProps {
  stage: Stage;
  label?: string;
}

export function StatusPill({ stage, label }: StatusPillProps) {
  const [bg, fg, defaultLabel] = PILL[stage] ?? PILL.reported;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 22,
      padding: '0 8px',
      borderRadius: 999,
      background: bg,
      color: fg,
      font: '600 11.5px/1 Outfit,sans-serif',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {label ?? defaultLabel}
    </span>
  );
}

/** Government stage pill */
export interface GovPillProps {
  gsKey: string;
  label: string;
  bg: string;
  fg: string;
  icon?: string;
}

export function GovPill({ label, bg, fg, icon }: GovPillProps) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      height: 22,
      padding: '0 8px',
      borderRadius: 999,
      background: bg,
      color: fg,
      font: '600 11.5px/1 Outfit,sans-serif',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    }}>
      {icon && <i className={`ph-bold ${icon}`} style={{ fontSize: 11 }} />}
      {label}
    </span>
  );
}
