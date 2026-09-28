'use client';
import { useEffect, useState, type ReactNode } from 'react';

export interface ToastProps {
  message: string;
  icon?: ReactNode;
  durationMs?: number;
  onDone?: () => void;
}

export function Toast({ message, icon, durationMs = 3000, onDone }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onDone]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 16,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 60,
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '11px 16px',
      borderRadius: 14,
      background: 'var(--cp-ink)',
      color: 'var(--cp-bg)',
      font: '600 12.5px/1.2 Outfit,sans-serif',
      boxShadow: 'var(--k-sh-toast)',
      animation: 'cp-toast .35s cubic-bezier(.2,.9,.3,1.3) both',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
    }}>
      {icon ?? <i className="ph-fill ph-check-circle" style={{ fontSize: 16, color: 'var(--cp-leaf)' }} />}
      {message}
    </div>
  );
}
