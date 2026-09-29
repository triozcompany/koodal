'use client';
import { useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { caseRow, govStage, PIN_COLOR, type GovStage } from '@/lib/console/derive';
import { haptic } from '@/lib/haptics';
import { DemoTag } from './DemoTag';

// Column order, hint text and drag rules come straight from the design's board view. Only these
// moves are real actions; anything else explains why it is not allowed.
const COLUMNS: [GovStage, string, string][] = [
  ['pending', 'Pending approval', 'Decide'], ['assigned', 'Assigned', 'Start work'], ['progress', 'In progress', 'Mark fixed'], ['reopened', 'Reopened', 'Fix again'],
  ['fixed', 'Fixed · confirming', 'Citizens confirm'], ['closed', 'Closed', 'By citizens'], ['rejected', 'Rejected', ''],
];
export const ALLOW: Partial<Record<GovStage, GovStage[]>> = { pending: ['assigned', 'rejected'], assigned: ['progress'], progress: ['fixed'], reopened: ['fixed'] };
const DROP_LABEL: Record<string, string> = {
  'pending>assigned': 'Drop to approve', 'pending>rejected': 'Drop to reject', 'assigned>progress': 'Drop to start work', 'progress>fixed': 'Drop to mark fixed', 'reopened>fixed': 'Drop to mark fixed',
};

interface Props {
  issues: Issue[];
  statusFilter: GovStage[];
  mob: boolean;
  onOpen: (id: string) => void;
  onMove: (issue: Issue, to: GovStage) => void;
}

export function CasesBoard({ issues, statusFilter, mob, onOpen, onMove }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<GovStage | null>(null);
  const dragged = dragId ? issues.find((i) => i.id === dragId) : undefined;
  const from = dragged ? govStage(dragged) : null;
  const cols = COLUMNS.filter(([k]) => !statusFilter.length || statusFilter.includes(k));

  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto', margin: mob ? '0 -16px' : '0 -28px', padding: mob ? '2px 16px 14px' : '2px 28px 14px', scrollSnapType: 'x proximity', alignItems: 'flex-start' }}>
      {cols.map(([k, label, hint]) => {
        const cards = issues.filter((i) => govStage(i) === k);
        const ok = !!from && (ALLOW[from] ?? []).includes(k);
        const hot = over === k && !!from;
        return (
          <div key={k}
            onDragOver={(e) => { e.preventDefault(); if (over !== k) setOver(k); }}
            onDrop={(e) => { e.preventDefault(); const id = dragId; setDragId(null); setOver(null); const it = id ? issues.find((i) => i.id === id) : undefined; if (it) onMove(it, k); }}
            style={{ flex: 'none', width: mob ? 280 : 300, scrollSnapAlign: 'start', display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 10px 10px', borderRadius: 22, boxSizing: 'border-box', maxHeight: 'calc(100dvh - 300px)', minHeight: 160,
              background: hot ? (ok ? 'var(--cp-leaf-soft)' : 'var(--cp-pulse-soft)') : ok ? 'color-mix(in oklch,var(--cp-leaf-soft) 55%,var(--cp-surface-2))' : 'var(--cp-surface-2)',
              border: `1.5px dashed ${hot ? (ok ? 'var(--cp-leaf)' : 'var(--cp-pulse)') : ok ? 'var(--cp-leaf)' : 'transparent'}`, transition: 'background .15s,border-color .15s' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 6px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: PIN_COLOR[k] }} />
              <span style={{ font: '600 13.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{label}</span>
              <span style={{ minWidth: 20, height: 20, padding: '0 6px', boxSizing: 'border-box', borderRadius: 10, background: 'var(--cp-surface)', font: '700 11px/20px Outfit,sans-serif', textAlign: 'center', color: 'var(--cp-ink-2)' }}>{cards.length}</span>
              <div style={{ flex: 1 }} />
              <span style={{ font: '500 11px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{from ? (k === from ? '' : ok ? DROP_LABEL[`${from}>${k}`] : 'Not allowed') : hint}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, minHeight: 90, padding: 2 }}>
              {cards.map((i) => {
                const r = caseRow(i);
                const can = !!ALLOW[k];
                const dragging = dragId === i.id;
                return (
                  <div key={i.id} draggable={can} onClick={() => onOpen(i.id)}
                    onDragStart={(e) => { if (!can) { e.preventDefault(); return; } try { e.dataTransfer.setData('text/plain', i.id); e.dataTransfer.effectAllowed = 'move'; } catch {} haptic(); setTimeout(() => setDragId(i.id), 0); }}
                    onDragEnd={() => { setDragId(null); setOver(null); }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 9, padding: '8px 8px 12px', borderRadius: 16, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 10px 20px -16px rgb(0 0 0 / .35)', cursor: can ? 'grab' : 'pointer', opacity: dragging ? 0.45 : 1, transform: dragging ? 'rotate(2deg) scale(.97)' : 'none', transition: 'transform .22s cubic-bezier(.3,1.6,.5,1),opacity .15s' }}>
                    <div style={{ position: 'relative', aspectRatio: '16/8', borderRadius: 11, overflow: 'hidden', border: '1px solid var(--cp-line)', flex: 'none', background: r.photoUrl ? `center/cover url(${r.photoUrl})` : `repeating-linear-gradient(${r.ang},var(--cp-ph-a) 0 10px,var(--cp-ph-b) 10px 20px)` }}>
                      <span style={{ position: 'absolute', left: 6, top: 6, width: 24, height: 24, borderRadius: 8, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}><i className={`ph-bold ${r.icon}`} style={{ fontSize: 13, color: 'var(--cp-bg)' }} /></span>
                      <span style={{ position: 'absolute', right: 6, bottom: 6, height: 20, padding: '0 6px', borderRadius: 6, background: 'var(--cp-surface)', font: '700 10.5px/20px Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 3 }}><i className="ph-bold ph-images" />{r.photoN}</span>
                      {r.bar === 'var(--cp-pulse)' && k !== 'reopened' && <span style={{ position: 'absolute', left: 6, bottom: 6, height: 20, padding: '0 7px', borderRadius: 6, background: 'var(--cp-pulse)', color: '#fff', font: '700 10.5px/20px Outfit,sans-serif' }}>Overdue</span>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '0 4px', minWidth: 0 }}>
                      <span style={{ font: '500 11.5px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.ref} · {i.area}{r.demo && <DemoTag />}</span>
                      <span style={{ font: '600 13.5px/1.25 Outfit,sans-serif', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 4px' }}>
                      <span style={{ height: 22, padding: '0 8px', borderRadius: 11, background: r.slaBg, color: r.slaFg, font: '600 11px/22px Outfit,sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '62%' }}>{r.sla}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, font: '600 11.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}><i className="ph-bold ph-users-three" />{r.sup}</span>
                    </div>
                  </div>
                );
              })}
              {cards.length === 0 && <span style={{ padding: '18px 8px', textAlign: 'center', font: '600 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{ok ? 'Drop here' : 'No cases'}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
