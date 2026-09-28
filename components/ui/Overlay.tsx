'use client';
import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

export interface OverlayProps {
  children: ReactNode;
  title?: string;
  onBack?: () => void;
  headerRight?: ReactNode;
}

export function Overlay({ children, title, onBack, headerRight }: OverlayProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'var(--cp-bg)',
      display: 'flex',
      flexDirection: 'column',
      animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both',
      zIndex: 40,
    }}>
      {/* Sticky header */}
      <div style={{
        height: 64,
        padding: '0 16px',
        borderBottom: '1px solid var(--cp-line)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
      }}>
        {onBack && (
          <IconButton onClick={onBack} aria-label="Back">
            <i className="ph-bold ph-arrow-left" />
          </IconButton>
        )}
        {title && (
          <span style={{ font: '600 16px/1.25 Outfit,sans-serif', color: 'var(--cp-ink)', flex: 1 }}>
            {title}
          </span>
        )}
        {headerRight}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  );
}
