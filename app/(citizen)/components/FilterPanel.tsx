'use client';
import { useState } from 'react';
import { CATS } from '@/lib/domain/constants';

export interface FilterState {
  region: string;
  cat: string[];
  stage: string[];
  sev: string[];
}

const STG_OPTS: [string, string, string][] = [
  ['new', 'New', 'var(--cp-ink-3)'], ['gathering', 'Gathering', 'var(--cp-marigold)'],
  ['govt', 'With govt', 'var(--cp-peacock-soft)'], ['case', 'Official case', 'var(--cp-peacock)'],
  ['progress', 'In progress', 'var(--cp-pulse)'], ['fixed', 'Fixed', 'var(--cp-leaf)'],
];
const SEV_OPTS: [string, string][] = [['critical', 'Critical'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']];

interface Props {
  f: FilterState;
  onChange: (f: FilterState) => void;
  onClose: () => void;
  desktop?: boolean;
}

function chipOpt(on: boolean) {
  return {
    bg: on ? 'var(--cp-ink)' : 'var(--cp-surface)',
    fg: on ? 'var(--cp-bg)' : 'var(--cp-ink)',
    bd: on ? 'var(--cp-edge)' : 'var(--cp-line)',
  };
}

function toggle(arr: string[], v: string) {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

export function FilterPanel({ f, onChange, onClose, desktop }: Props) {
  const [draft, setDraft] = useState({ cat: [...f.cat], stage: [...f.stage], sev: [...f.sev] });

  const draftN = draft.cat.length + draft.stage.length + draft.sev.length;

  function apply() {
    onChange({ ...f, cat: draft.cat, stage: draft.stage, sev: draft.sev });
    onClose();
  }

  function clearAll() {
    setDraft({ cat: [], stage: [], sev: [] });
  }

  const filterContent = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 12px', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Category */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '22px 0', borderBottom: '1px solid var(--cp-line)' }}>
        <span style={{ font: '600 18px/1.2 Outfit,sans-serif' }}>Problem type</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(118px,1fr))', gap: 10 }}>
          {Object.entries(CATS).map(([k, c]) => {
            const on = draft.cat.includes(k);
            const o = chipOpt(on);
            return (
              <button key={k} onClick={() => setDraft(d => ({ ...d, cat: toggle(d.cat, k) }))} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, height: 96, padding: 14, borderRadius: 16, border: on ? '2px solid var(--cp-ink)' : '1px solid var(--cp-line)', background: o.bg, color: 'var(--cp-ink)', font: '600 13px/1.2 Outfit,sans-serif', cursor: 'pointer', textAlign: 'left', boxSizing: 'border-box' }}>
                <i className={`ph-bold ${c.icon}`} style={{ fontSize: 28 }}></i>
                {c.l}
              </button>
            );
          })}
        </div>
      </div>
      {/* Status */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '22px 0', borderBottom: '1px solid var(--cp-line)' }}>
        <span style={{ font: '600 18px/1.2 Outfit,sans-serif' }}>Status</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {STG_OPTS.map(([k, l, dot]) => {
            const on = draft.stage.includes(k);
            const o = chipOpt(on);
            return (
              <button key={k} onClick={() => setDraft(d => ({ ...d, stage: toggle(d.stage, k) }))} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 13px', borderRadius: 999, border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: dot }} />
                {l}
              </button>
            );
          })}
        </div>
      </div>
      {/* Severity */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '22px 0' }}>
        <span style={{ font: '600 18px/1.2 Outfit,sans-serif' }}>Severity</span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SEV_OPTS.map(([k, l]) => {
            const on = draft.sev.includes(k);
            const o = chipOpt(on);
            return <button key={k} onClick={() => setDraft(d => ({ ...d, sev: toggle(d.sev, k) }))} style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 13px', borderRadius: 999, border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap' }}>{l}</button>;
          })}
        </div>
      </div>
    </div>
  );

  const footer = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px 24px', flexShrink: 0, borderTop: '1px solid var(--cp-line)' }}>
      <button onClick={clearAll} style={{ flex: '3 1 0', minWidth: 0, height: 52, border: 'none', background: 'none', color: 'var(--cp-ink)', font: '600 14px/1 Outfit,sans-serif', textDecoration: 'underline', textUnderlineOffset: 4, cursor: 'pointer' }}>Clear all</button>
      <button onClick={apply} style={{ flex: '7 1 0', minWidth: 0, height: 52, borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: 'none', font: '600 15px/1 Outfit,sans-serif', cursor: 'pointer' }}>
        {draftN ? `Show results · ${draftN} filter${draftN > 1 ? 's' : ''}` : 'Show results'}
      </button>
    </div>
  );

  if (desktop) {
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
        <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 420, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
            <span style={{ flex: 1, font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.025em' }}>Filters</span>
            {draftN > 0 && (
              <span style={{ height: 22, padding: '0 8px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 11px/22px Outfit,sans-serif' }}>{draftN}</span>
            )}
            <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-x" />
            </button>
          </div>
          {filterContent}
          {footer}
        </div>
      </>
    );
  }

  // Mobile — floating bottom sheet
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, maxHeight: 'calc(90% - 10px)', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--cp-line)', margin: '12px auto 0', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px 8px', flexShrink: 0 }}>
          <span style={{ width: 36, flexShrink: 0 }} />
          <span style={{ flex: 1, textAlign: 'center', font: '600 16px/1 Outfit,sans-serif' }}>Filters</span>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>
        {filterContent}
        {footer}
      </div>
    </>
  );
}
