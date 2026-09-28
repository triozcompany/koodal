'use client';
import type { CSSProperties } from 'react';
import styles from './VoteButton.module.css';

export interface VoteButtonProps {
  count: number;
  on?: boolean;
  onClick?: () => void;
  label?: string;
  style?: CSSProperties;
}

export function VoteButton({ count, on = false, onClick, label = '▲', style }: VoteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.btn}${on ? ` ${styles.on}` : ''}`}
      style={{
        width: 54,
        height: 60,
        borderRadius: 999,
        border: '1px solid var(--cp-line)',
        background: on ? 'var(--cp-ink)' : 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',
        color: on ? 'var(--cp-bg)' : 'var(--cp-ink)',
        boxShadow: 'var(--k-sh-raised)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        cursor: 'pointer',
        flexShrink: 0,
        ...style,
      }}
    >
      <span style={{ font: '700 13px/1 Outfit,sans-serif' }}>{label}</span>
      <span style={{ font: '600 12px/1 Outfit,sans-serif' }}>{count}</span>
    </button>
  );
}
