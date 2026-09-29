'use client';
import { useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { ago } from '@/lib/domain/rules';
import { AVB } from '@/lib/domain/stage-style';
import { ME } from '@/lib/domain/constants';

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

interface Props {
  issue: Issue;
  mob: boolean;
  desktop?: boolean;
  onSend?: (text: string) => Promise<void>;
  onEditComment?: (commentId: string, text: string) => Promise<void>;
  onDeleteComment?: (commentId: string) => Promise<void>;
  onClose: () => void;
}

const PAGE = 20;

export function CommentsSheet({ issue, mob, desktop = false, onSend, onEditComment, onDeleteComment, onClose }: Props) {
  const [input, setInput]           = useState('');
  const [local, setLocal]           = useState<Array<{ text: string; ts: number }>>([]);
  const [loadedCount, setLoadedCount] = useState(PAGE);
  const [sending, setSending]       = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editDraft, setEditDraft]   = useState('');

  const canEditComments = !issue.caseId;

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditDraft(text);
  };

  const saveEdit = async () => {
    const t = editDraft.trim();
    if (!t || !editingId || !onEditComment) return;
    await onEditComment(editingId, t);
    setEditingId(null);
  };

  const baseComments = issue.comments ?? [];
  const allComments  = [
    ...baseComments,
    ...local.map(c => ({ by: 'You', text: c.text, ts: c.ts, me: true })),
  ].sort((a, b) => b.ts - a.ts);

  const visible = allComments.slice(0, loadedCount);
  const hasMore = allComments.length > loadedCount;

  const send = async () => {
    const t = input.trim();
    if (!t || sending) return;
    setInput('');
    if (onSend) {
      setSending(true);
      try {
        await onSend(t);
      } finally {
        setSending(false);
      }
    } else {
      setLocal(prev => [...prev, { text: t, ts: Date.now() }]);
    }
  };

  const commentsList = (
    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {hasMore && (
        <button
          onClick={() => setLoadedCount(c => c + PAGE)}
          style={{ alignSelf: 'center', border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', borderRadius: 999, height: 32, padding: '0 14px', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', margin: '8px 0' }}
        >
          Load earlier comments
        </button>
      )}
      {visible.length === 0 && (
        <span style={{ display: 'block', font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', paddingTop: 16, textAlign: 'center' }}>
          No comments yet. Be the first.
        </span>
      )}
      {[...visible].reverse().map((c, i) => {
        const commentId = (c as { id?: string }).id;
        const isMine = (c as { uid?: string }).uid === ME.uid;
        const canManage = isMine && !!commentId && canEditComments && (onEditComment || onDeleteComment);
        const isEditing = editingId === commentId;
        return (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', animation: 'cp-row .3s ease-out both' }}>
            <span style={{ width: 34, height: 34, flexShrink: 0, borderRadius: 11, background: (c as { me?: boolean }).me ? 'var(--cp-marigold)' : AVB[nameHash(c.by) % AVB.length], display: 'grid', placeItems: 'center', font: '700 11px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>
              {initials(c.by).slice(0, 2) || '?'}
            </span>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ font: '600 12px/1.1 Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ flex: 1, minWidth: 0 }}>
                  {c.by || 'Anonymous'} <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500 }}>· {ago(c.ts)}{(c as { edited?: boolean }).edited ? ' · edited' : ''}</span>
                </span>
                {canManage && !isEditing && (
                  <>
                    {onEditComment && (
                      <button onClick={() => startEdit(commentId!, c.text)} aria-label="Edit comment" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>
                        <i className="ph-bold ph-pencil-simple" />
                      </button>
                    )}
                    {onDeleteComment && (
                      <button onClick={() => onDeleteComment(commentId!)} aria-label="Delete comment" style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0 }}>
                        <i className="ph-bold ph-trash" />
                      </button>
                    )}
                  </>
                )}
              </span>
              {isEditing ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditingId(null); }}
                    autoFocus
                    style={{ flex: 1, minWidth: 0, height: 32, padding: '0 10px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 12.5px/1 Outfit,sans-serif', outline: 'none' }}
                  />
                  <button onClick={saveEdit} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>Save</button>
                </div>
              ) : (
                <span style={{ font: "400 13px/1.4 Outfit,'Noto Sans Tamil',sans-serif" }}>{c.text}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const inputBar = (
    <div style={{ display: 'flex', gap: 8, padding: '12px 16px 24px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder="Add a comment..."
        style={{ flex: 1, minWidth: 0, height: 44, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif', outline: 'none' }}
      />
      <button
        onClick={send}
        style={{ width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', cursor: 'pointer', fontSize: 18, display: 'grid', placeItems: 'center', opacity: input.trim() ? 1 : 0.45, transition: 'opacity .15s' }}
      >
        <i className="ph-fill ph-paper-plane-tilt" />
      </button>
    </div>
  );

  /* ── Desktop right panel ── */
  if (desktop) {
    return (
      <>
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }}
        />
        <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 420, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '20px 20px 12px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
            <span style={{ flex: 1, font: "400 21px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Comments</span>
            <span style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{allComments.length}</span>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-x" />
            </button>
          </div>
          <div style={{ font: '500 12px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', padding: '8px 20px 4px', flexShrink: 0 }}>{issue.title}</div>
          {commentsList}
          {inputBar}
        </div>
      </>
    );
  }

  /* ── Mobile bottom sheet ── */
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }}
      />
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, minHeight: '70%', maxHeight: '82%', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '10px auto 0', flexShrink: 0 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 4px', flexShrink: 0 }}>
          <span style={{ flex: 1, font: "400 21px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Comments</span>
          <span style={{ font: '600 13px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{allComments.length}</span>
          <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>
        <div style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)', padding: '0 20px 8px', flexShrink: 0 }}>{issue.title}</div>
        {commentsList}
        {inputBar}
      </div>
    </>
  );
}
