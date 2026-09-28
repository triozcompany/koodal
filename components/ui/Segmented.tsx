'use client';
import type { CSSProperties } from 'react';

export interface SegmentedItem {
  value: string;
  label: string;
}

export interface SegmentedProps {
  items: SegmentedItem[];
  value: string;
  onChange: (v: string) => void;
  style?: CSSProperties;
}

export function Segmented({ items, value, onChange, style }: SegmentedProps) {
  return (
    <div
      role="tablist"
      style={{
        display: 'inline-flex',
        gap: 4,
        padding: '3px 4px',
        borderRadius: 999,
        background: 'var(--cp-surface-2)',
        ...style,
      }}
    >
      {items.map(item => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            style={{
              height: 32,
              padding: '0 14px',
              borderRadius: 999,
              border: 'none',
              font: '600 12px/1 Outfit,sans-serif',
              background: active ? 'var(--cp-surface)' : 'transparent',
              color: active ? 'var(--cp-ink)' : 'var(--cp-ink-3)',
              boxShadow: active ? '0 1px 3px rgb(0 0 0 / .1)' : 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'background .15s, color .15s',
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
