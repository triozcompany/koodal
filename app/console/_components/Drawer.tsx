'use client';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useMob } from '@/lib/console/useMob';
import { attachRipple } from '@/lib/ripple';
import { haptic } from '@/lib/haptics';

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  eyebrow: string;
  title: string;
  footer?: ReactNode;
  children: ReactNode;
  /** Always-dark drawer, for use over an always-dark page (Settings). */
  dark?: boolean;
}

const LABEL = { font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' } as const;

// Desktop: right panel 440px inset 12px r26. Mobile: floats 10px off the edges with r20, matching the
// citizen app's drawers (LocationDrawer/ProfileDrawer), rather than the handoff's edge-to-edge sheet.
// Header and footer are sticky; only the body scrolls. Menus (Combobox) portal at z-index 400,
// above this drawer's z-index 100, so they are never clipped by the footer.
export function Drawer({ open, onClose, eyebrow, title, footer, children, dark }: DrawerProps) {
  const mob = useMob();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: mob ? 'var(--cp-scrim)' : 'rgb(0 0 0 / .18)',
        backdropFilter: 'blur(3px)', WebkitBackdropFilter: 'blur(3px)',
        animation: 'cp-row .2s both',
      }}
    >
      <div
        role="dialog" aria-modal="true" aria-label={title} data-cp-theme={dark ? 'dark' : undefined}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          ...(mob ? { left: 10, right: 10, bottom: 'max(10px, env(safe-area-inset-bottom))', maxHeight: 'calc(100dvh - 20px)' } : { right: 12, top: 12, bottom: 12, width: 440 }),
          display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box',
          background: 'var(--cp-surface)', border: '1px solid var(--cp-line)',
          borderRadius: mob ? 20 : 26,
          boxShadow: '0 30px 80px -24px rgb(0 0 0 / .45)',
          animation: mob ? 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both' : 'cp-side .4s cubic-bezier(.2,.9,.3,1.05) both',
        }}
      >
        {mob && <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '10px auto 0', flex: 'none' }} />}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '20px 22px 16px', borderBottom: '1px solid var(--cp-line)', flex: 'none' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <span style={LABEL}>{eyebrow}</span>
            <span style={{ font: "400 26px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>{title}</span>
          </div>
          <button
            onClick={onClose} aria-label="Close"
            style={{ width: 38, height: 38, flex: 'none', borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16 }}
          ><i className="ph-bold ph-x" /></button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {children}
        </div>
        {footer && (
          <div style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px 20px', borderTop: '1px solid var(--cp-line)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span style={LABEL}>{children}</span>;
}

export function PrimaryButton({ children, onClick, disabled, style }: { children: ReactNode; onClick?: () => void; disabled?: boolean; style?: CSSProperties }) {
  return (
    <button
      data-glare="1" onClick={() => { haptic(); onClick?.(); }} disabled={disabled}
      ref={(el) => { if (el && !el.dataset.rip) { el.dataset.rip = '1'; attachRipple(el); } }}
      style={{ overflow: 'hidden',
        height: 52, padding: '0 26px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)',
        border: '1px solid var(--cp-line)', boxShadow: '0 8px 18px -8px rgb(0 0 0 / .45), inset 0 1px 0 rgb(255 255 255 / .14)',
        font: '600 14.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', ...style,
      }}
    >{children}</button>
  );
}

export function LinkButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{ height: 44, padding: '0 6px', border: 'none', background: 'none', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  );
}
