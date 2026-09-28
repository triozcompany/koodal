'use client';
import { useRef, useEffect, type ReactNode, type CSSProperties } from 'react';
import { attachRipple } from '@/lib/ripple';
import styles from './Fab.module.css';

export interface FabProps {
  children: ReactNode;
  onClick?: () => void;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function Fab({ children, onClick, style, ...rest }: FabProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) attachRipple(el);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      data-glare="1"
      className={styles.fab}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 24,
        height: 52,
        padding: '0 20px 0 16px',
        borderRadius: 999,
        border: 'none',
        background: 'var(--cp-ink)',
        color: 'var(--cp-bg)',
        font: '600 14px/1 Outfit,sans-serif',
        boxShadow: 'var(--k-sh-fab)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        cursor: 'pointer',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
