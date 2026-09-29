'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FieldLabel } from './Drawer';

export interface ComboOption { value: string; label: string; sub?: string; icon?: string; count?: number }

interface Props {
  label?: string;
  icon: string;
  placeholder: string;
  options: ComboOption[];
  value: string[];
  onChange: (next: string[]) => void;
  multi?: boolean;
  searchPlaceholder?: string;
}

const MENU_MAX = 320;
const GAP = 6;

// The menu is portalled to <body> with position:fixed at z-index 400 (drawers are 100), so a
// drawer's sticky footer or overflow can never hide it. It opens below the trigger and flips
// above when there is less room below than above.
export function Combobox({ label, icon, placeholder, options, value, onChange, multi = false, searchPlaceholder = 'Search' }: Props) {
  const btn = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number; maxH: number } | null>(null);

  const place = useCallback(() => {
    const r = btn.current?.getBoundingClientRect();
    if (!r) return;
    const below = window.innerHeight - r.bottom - GAP - 12;
    const above = r.top - GAP - 12;
    const up = below < 240 && above > below;
    const maxH = Math.min(MENU_MAX, up ? above : below);
    setPos(up
      ? { left: r.left, width: r.width, bottom: window.innerHeight - r.top + GAP, maxH }
      : { left: r.left, width: r.width, top: r.bottom + GAP, maxH });
  }, []);

  useLayoutEffect(() => { if (open) place(); }, [open, place]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !btn.current?.contains(t)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey, true);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey, true);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  const picked = options.filter((o) => value.includes(o.value));
  const summary = picked.length === 0 ? placeholder : picked.length === 1 ? picked[0].label : `${picked[0].label} +${picked.length - 1}`;
  const shown = options.filter((o) => o.label.toLowerCase().includes(q.trim().toLowerCase()));

  const toggle = (v: string) => {
    if (!multi) { onChange([v]); setOpen(false); return; }
    onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v]);
  };

  return (
    <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
      {label && <FieldLabel>{label}</FieldLabel>}
      <button
        ref={btn} onClick={() => { setQ(''); setOpen((o) => !o); }} aria-haspopup="listbox" aria-expanded={open}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 9, height: 46, padding: '0 12px 0 14px', borderRadius: 14,
          border: `1.5px solid ${open || picked.length ? 'var(--cp-ink)' : 'var(--cp-line)'}`, background: 'var(--cp-surface)', color: 'var(--cp-ink)',
          font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box',
          boxShadow: open ? '0 0 0 3px var(--cp-pulse-soft)' : 'none', transition: 'border-color .15s,box-shadow .15s',
        }}
      >
        <i className={`ph-bold ${icon}`} style={{ color: 'var(--cp-ink-3)', fontSize: 16, flex: 'none' }} />
        <span style={{ flex: 1, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: picked.length ? 'var(--cp-ink)' : 'var(--cp-ink-3)' }}>{summary}</span>
        {multi && picked.length > 0 && (
          <span style={{ flex: 'none', minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center' }}>{picked.length}</span>
        )}
        <i className="ph-bold ph-caret-down" style={{ color: 'var(--cp-ink-3)', fontSize: 14, flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      {open && pos && createPortal(
        <div
          ref={menu} role="listbox"
          style={{
            position: 'fixed', zIndex: 400, left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom, maxHeight: pos.maxH,
            display: 'flex', flexDirection: 'column', borderRadius: 16, background: 'var(--cp-surface)', color: 'var(--cp-ink)',
            border: '1px solid var(--cp-line)', boxShadow: '0 22px 48px -18px rgb(0 0 0 / .35)', animation: 'cp-pop2 .18s both', overflow: 'hidden', boxSizing: 'border-box',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 44, padding: '0 12px', borderBottom: '1px solid var(--cp-line)', flex: 'none' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ color: 'var(--cp-ink-3)' }} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder}
              style={{ flex: 1, minWidth: 0, border: 'none', background: 'none', outline: 'none', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif' }} />
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: 6 }}>
            {shown.map((o) => {
              const on = value.includes(o.value);
              return (
                <button key={o.value} role="option" aria-selected={on} onClick={() => toggle(o.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', minHeight: 42, padding: '6px 10px', border: 'none', borderRadius: 10, background: on ? 'var(--cp-surface-2)' : 'transparent', color: 'var(--cp-ink)', cursor: 'pointer', textAlign: 'left' }}>
                  <span style={{ width: 18, height: 18, flex: 'none', borderRadius: multi ? 5 : '50%', border: `1.5px solid ${on ? 'var(--cp-ink)' : 'var(--cp-edge)'}`, background: on ? 'var(--cp-ink)' : 'transparent', display: 'grid', placeItems: 'center', boxSizing: 'border-box' }}>
                    {on && <i className="ph-bold ph-check" style={{ fontSize: 11, color: 'var(--cp-bg)' }} />}
                  </span>
                  {o.icon && <i className={`ph-bold ${o.icon}`} style={{ fontSize: 15, color: 'var(--cp-ink-2)', flex: 'none' }} />}
                  <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ font: '600 13px/1.15 Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.label}</span>
                    {o.sub && <span style={{ font: '500 11.5px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{o.sub}</span>}
                  </span>
                  {o.count != null && <span style={{ font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{o.count}</span>}
                </button>
              );
            })}
            {shown.length === 0 && <div style={{ padding: 18, textAlign: 'center', font: '600 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>No matches</div>}
          </div>
          {multi && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderTop: '1px solid var(--cp-line)', flex: 'none' }}>
              <button onClick={() => onChange([])} style={{ height: 34, padding: '0 10px', border: 'none', background: 'none', color: 'var(--cp-ink-2)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>Clear</button>
              <div style={{ flex: 1 }} />
              <button onClick={() => setOpen(false)} style={{ height: 34, padding: '0 16px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>Done</button>
            </div>
          )}
        </div>,
        document.body,
      )}
    </div>
  );
}
