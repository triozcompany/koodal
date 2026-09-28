import type { CSSProperties, ReactNode } from 'react';

export interface CardProps {
  children: ReactNode;
  style?: CSSProperties;
}

export function Card({ children, style }: CardProps) {
  return (
    <div style={{
      borderRadius: 20,
      border: '1px solid var(--cp-line)',
      background: 'var(--cp-surface)',
      overflow: 'hidden',
      ...style,
    }}>
      {children}
    </div>
  );
}

/** Thumbnail (96×72 by default) with striped placeholder */
export interface ThumbProps {
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  radius?: number;
  style?: CSSProperties;
}

export function Thumb({ src, alt = '', width = 96, height = 72, radius = 14, style }: ThumbProps) {
  const placeholder = {
    background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0,var(--cp-ph-a) 8px,var(--cp-ph-b) 8px,var(--cp-ph-b) 16px)',
  };
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} style={{ width, height, borderRadius: radius, objectFit: 'cover', flexShrink: 0, ...style }} />
  ) : (
    <span style={{ width, height, borderRadius: radius, flexShrink: 0, display: 'block', ...placeholder, ...style }} />
  );
}
