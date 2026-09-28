import type { CSSProperties, ReactNode } from 'react';

export interface SectionLabelProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function SectionLabel({ children, style }: SectionLabelProps) {
  return (
    <span style={{
      font: '600 11px/1 Outfit,sans-serif',
      letterSpacing: '.16em',
      textTransform: 'uppercase',
      color: 'var(--cp-ink-3)',
      ...style,
    }}>
      {children}
    </span>
  );
}
