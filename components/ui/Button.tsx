'use client';
import { useRef, useEffect, type CSSProperties, type ReactNode } from 'react';
import { attachRipple } from '@/lib/ripple';
import styles from './Button.module.css';

type Variant = 'primary' | 'raised';
type Size = 'l' | 'm' | 's';
type Color = 'default' | 'peacock' | 'pulse' | 'leaf';

const H: Record<Size, number> = { l: 52, m: 44, s: 40 };
const FONT: Record<Size, string> = {
  l: '600 15px/1 Outfit,sans-serif',
  m: '600 13px/1 Outfit,sans-serif',
  s: '600 13px/1 Outfit,sans-serif',
};
const PAD: Record<Size, string> = { l: '0 20px', m: '0 16px', s: '0 14px' };

const PBG: Record<Color, string> = {
  default: 'var(--cp-ink)',
  peacock: 'var(--cp-peacock)',
  pulse:   'var(--cp-pulse)',
  leaf:    'var(--cp-leaf)',
};
const PFG: Record<Color, string> = {
  default: 'var(--cp-bg)',
  peacock: '#fff',
  pulse:   '#fff',
  leaf:    '#fff',
};

export interface ButtonProps {
  variant?: Variant;
  size?: Size;
  color?: Color;
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary',
  size = 'm',
  color = 'default',
  children,
  onClick,
  disabled,
  style,
  type = 'button',
}: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && variant === 'primary') attachRipple(el);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const base: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: size === 'l' ? 9 : 7,
    height: H[size],
    padding: PAD[size],
    borderRadius: 999,
    font: FONT[size],
    letterSpacing: '.01em',
    cursor: 'pointer',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    border: '1px solid var(--cp-line)',
  };

  if (variant === 'primary') {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        onClick={onClick}
        data-glare="1"
        className={styles.btn}
        style={{ ...base, background: PBG[color], color: PFG[color], boxShadow: 'var(--k-sh-primary)', ...style }}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={styles.btn}
      style={{
        ...base,
        background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',
        boxShadow: 'var(--k-sh-raised)',
        color: 'var(--cp-ink)',
        font: size === 'l' ? '600 14px/1 Outfit,sans-serif' : '700 13px/1 Outfit,sans-serif',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
