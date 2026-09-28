import type { Stage } from '@/lib/domain/types';
import { PIN } from '@/lib/domain/stage-style';
import styles from './MapPin.module.css';

export interface MapPinProps {
  stage: Stage;
  label: string;
  hot?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function MapPin({ stage, label, hot = false, selected = false, onClick }: MapPinProps) {
  const [bg, fg] = PIN[stage] ?? PIN.reported;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.pin}${hot ? ` ${styles.hot}` : ''}`}
      style={{
        position: 'relative',
        height: 30,
        padding: '0 11px 0 9px',
        borderRadius: 999,
        border: 'none',
        background: bg,
        color: fg,
        boxShadow: selected ? '0 0 0 2px var(--cp-ink), var(--k-sh-pin)' : 'var(--k-sh-pin)',
        font: '700 12px/1 Outfit,sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: fg, opacity: 0.6, flexShrink: 0 }} />
      {label}
    </button>
  );
}
