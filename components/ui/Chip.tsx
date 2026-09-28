'use client';
import type { CSSProperties, ReactNode } from 'react';
import styles from './Chip.module.css';

export interface ChipProps {
  children: ReactNode;
  selected?: boolean;
  onClick?: () => void;
  style?: CSSProperties;
  icon?: string;
}

export function Chip({ children, selected = false, onClick, style, icon }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.chip}${selected ? ` ${styles.selected}` : ''}`}
      style={{
        height: 34,
        padding: '0 12px',
        borderRadius: 999,
        border: '1px solid var(--cp-line)',
        background: 'var(--cp-surface)',
        color: 'var(--cp-ink-2)',
        font: '600 12px/1 Outfit,sans-serif',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        ...style,
      }}
    >
      {icon && <i className={`ph-bold ${icon}`} style={{ fontSize: 13 }} />}
      {children}
    </button>
  );
}
