import type { CSSProperties } from 'react';
import { AVB } from '@/lib/domain/stage-style';

export interface AvatarProps {
  name: string;
  index?: number;
  size?: number;
  style?: CSSProperties;
}

export function Avatar({ name, index = 0, size = 32, style }: AvatarProps) {
  const initials = name.split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();
  const bg = AVB[index % AVB.length];
  return (
    <span style={{
      width: size,
      height: size,
      borderRadius: '50%',
      background: bg,
      color: 'var(--cp-ink)',
      font: `600 ${Math.round(size * 0.4)}px/1 Outfit,sans-serif`,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      ...style,
    }}>
      {initials}
    </span>
  );
}
