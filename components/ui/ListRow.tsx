import type { CSSProperties, ReactNode } from 'react';
import styles from './ListRow.module.css';

export interface ListRowProps {
  children: ReactNode;
  onClick?: () => void;
  last?: boolean;
  style?: CSSProperties;
}

export function ListRow({ children, onClick, last = false, style }: ListRowProps) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      className={onClick ? styles.row : undefined}
      style={{
        padding: '14px 16px',
        borderBottom: last ? 'none' : '1px solid var(--cp-line)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: onClick ? 'pointer' : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Gov table header row */
export function TableHeader({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      padding: '12px 18px',
      background: 'var(--cp-bg)',
      borderBottom: '1px solid var(--cp-line)',
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}
