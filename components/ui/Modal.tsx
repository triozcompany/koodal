'use client';
import type { CSSProperties, ReactNode } from 'react';
import { IconButton } from './IconButton';

export interface ModalProps {
  children: ReactNode;
  title?: string;
  onClose?: () => void;
  maxWidth?: number | string;
  style?: CSSProperties;
}

export function Modal({ children, title, onClose, maxWidth = 480, style }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Scrim */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--cp-scrim)',
          animation: 'cp-in .22s ease-out both',
        }}
      />
      {/* Panel */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth,
        background: 'var(--cp-surface)',
        borderRadius: 20,
        boxShadow: 'var(--k-sh-modal)',
        animation: 'cp-pop2 .25s cubic-bezier(.2,.9,.3,1.1) both',
        overflow: 'hidden',
        ...style,
      }}>
        {(title || onClose) && (
          <div style={{
            padding: '18px 22px',
            borderBottom: '1px solid var(--cp-line)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            {title && <span style={{ flex: 1, font: '600 16px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>{title}</span>}
            {onClose && (
              <IconButton size={36} onClick={onClose} aria-label="Close">
                <i className="ph-bold ph-x" style={{ fontSize: 16 }} />
              </IconButton>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
