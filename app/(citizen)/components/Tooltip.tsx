'use client';
import { useRef, useState } from 'react';

interface Props {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
}

/** Wraps a single icon-only control with a small floating label — shown on
 * desktop hover, and on mobile via a deliberate long-press (a quick tap still
 * just fires the child's own onClick; only a ~400ms hold reveals the label). */
export function Tooltip({ label, children, side = 'top' }: Props) {
  const [show, setShow] = useState(false);
  const pressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const startPress = () => {
    pressTimer.current = setTimeout(() => setShow(true), 400);
  };
  const endPress = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
    pressTimer.current = null;
    setShow(false);
  };

  return (
    <span
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
    >
      {children}
      {show && (
        <span
          role="tooltip"
          style={{
            position: 'absolute',
            [side === 'top' ? 'bottom' : 'top']: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: side === 'top' ? 8 : undefined,
            marginTop: side === 'bottom' ? 8 : undefined,
            padding: '6px 10px',
            borderRadius: 8,
            background: 'rgba(20,20,20,.94)',
            color: '#fff',
            font: '600 11.5px/1.2 Outfit,sans-serif',
            whiteSpace: 'nowrap',
            zIndex: 60,
            pointerEvents: 'none',
            boxShadow: '0 6px 16px -6px rgb(0 0 0 / .5)',
          }}
        >
          {label}
        </span>
      )}
    </span>
  );
}
