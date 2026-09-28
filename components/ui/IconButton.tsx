import type { CSSProperties, ReactNode } from 'react';
import styles from './IconButton.module.css';

export interface IconButtonProps {
  children: ReactNode;
  onClick?: () => void;
  size?: number;
  style?: CSSProperties;
  'aria-label'?: string;
}

export function IconButton({ children, onClick, size = 40, style, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.btn}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: 'none',
        background: 'var(--cp-surface-2)',
        color: 'var(--cp-ink)',
        fontSize: 18,
        display: 'grid',
        placeItems: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
