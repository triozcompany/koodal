'use client';
import { useState } from 'react';
import type { Issue } from '@/lib/domain/types';
import { ago } from '@/lib/domain/rules';

interface EImg { ago: string; }
interface ETag { t: string; remove: () => void; }

interface Props {
  issue: Issue;
  mob: boolean;
  onClose: () => void;
  onSave: (title: string, text: string, tags: string[]) => void;
  onDelete: () => void;
}

export function EditReportScreen({ issue, mob, onClose, onSave, onDelete }: Props) {
  const [eTitle, setETitle] = useState(issue.title);
  const [eText, setEText] = useState(issue.text ?? '');
  const [eTags, setETags] = useState<string[]>(issue.tags ?? []);
  const [eTag, setETag] = useState('');
  const [delAsk, setDelAsk] = useState(false);
  const [eImgs, setEImgs] = useState<EImg[]>(() =>
    (issue.evidence?.length ? issue.evidence : [{ ts: Date.now() - 3600000, by: 'me', uid: 'me' }])
      .slice(0, 6)
      .map(e => ({ ago: ago(e.ts) }))
  );

  const norm = (s: string) => s.trim().replace(/^#/, '').replace(/\s+/g, '-').toLowerCase();

  const addETag = () => {
    const t = norm(eTag);
    if (t && !eTags.includes(t)) setETags(prev => [...prev, t]);
    setETag('');
  };

  const eTagList: ETag[] = eTags.map(t => ({ t, remove: () => setETags(prev => prev.filter(x => x !== t)) }));

  const bodyContent = (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px 8px', flexShrink: 0 }}>
        <span style={{ flex: 1, font: "400 21px/1 'DM Serif Display',serif", letterSpacing: '-.02em' }}>Edit report</span>
        <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
          <i className="ph-bold ph-x"></i>
        </button>
      </div>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 26px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Title */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>TITLE</span>
          <input
            value={eTitle}
            onChange={e => setETitle(e.target.value)}
            placeholder="Short title"
            style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif', outline: 'none', boxSizing: 'border-box', width: '100%' }}
          />
        </label>

        {/* Description */}
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>DESCRIPTION</span>
          <textarea
            value={eText}
            onChange={e => setEText(e.target.value)}
            rows={4}
            style={{ width: '100%', boxSizing: 'border-box', resize: 'none', padding: '12px 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: "500 13.5px/1.45 Outfit,'Noto Sans Tamil',sans-serif", outline: 'none' }}
          />
        </label>

        {/* Photos */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>YOUR PHOTOS · {eImgs.length || issue.evidence?.length || 1}</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
            {eImgs.map((im, k) => (
              <div key={k} style={{ position: 'relative', aspectRatio: '1', borderRadius: 12, background: 'repeating-linear-gradient(135deg,var(--cp-ph-a) 0 6px,var(--cp-ph-b) 6px 12px)', animation: 'cp-pop2 .2s ease-out both' }}>
                <button onClick={() => setEImgs(prev => prev.filter((_, i) => i !== k))} title="Remove photo" style={{ position: 'absolute', right: 4, top: 4, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', cursor: 'pointer', fontSize: 11, display: 'grid', placeItems: 'center' }}>
                  <i className="ph-bold ph-x"></i>
                </button>
                <span style={{ position: 'absolute', left: 5, bottom: 5, font: '600 9.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{im.ago}</span>
              </div>
            ))}
            <button style={{ aspectRatio: '1', borderRadius: 12, border: '1.5px dashed var(--cp-ink-3)', background: 'transparent', color: 'var(--cp-ink-2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', font: '600 11px/1 Outfit,sans-serif' }}>
              <i className="ph-bold ph-plus" style={{ fontSize: 18 }}></i>Add
            </button>
          </div>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>TAGS</span>
          {eTagList.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {eTagList.map(({ t, remove }) => (
                <button key={t} onClick={remove} style={{ height: 32, padding: '0 10px', borderRadius: 999, border: 'none', background: 'var(--cp-peacock-soft)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                  #{t}<i className="ph-bold ph-x" style={{ fontSize: 11 }}></i>
                </button>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              value={eTag}
              onChange={e => setETag(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addETag(); } }}
              placeholder="Add tag"
              style={{ flex: 1, minWidth: 0, height: 44, padding: '0 12px', borderRadius: 12, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 13px/1 Outfit,sans-serif', outline: 'none' }}
            />
            <button onClick={addETag} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 17, display: 'grid', placeItems: 'center' }}>
              <i className="ph-bold ph-plus"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '12px 20px 24px', borderTop: '1px solid var(--cp-line)', flexShrink: 0, background: 'var(--cp-surface)' }}>
        {delAsk && (
          <span style={{ font: '600 12.5px/1.35 Outfit,sans-serif', color: 'var(--cp-ink-2)', animation: 'cp-row .2s both' }}>
            Delete this report? Its {issue.sup} supporters will be notified.
          </span>
        )}
        <div style={{ display: 'flex', gap: 10 }}>
          {!delAsk ? (
            <>
              <button
                onClick={() => setDelAsk(true)}
                style={{ flex: 3, minWidth: 0, height: 54, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-pulse)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'transform .12s' }}
              >
                <i className="ph-bold ph-trash"></i> Delete
              </button>
              <button
                onClick={() => onSave(eTitle.trim() || issue.title, eText.trim(), eTags)}
                style={{ flex: 7, minWidth: 0, height: 54, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform .12s' }}
              >
                Save changes
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setDelAsk(false)}
                style={{ flex: 3, minWidth: 0, height: 54, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'transform .12s' }}
              >
                Keep it
              </button>
              <button
                onClick={onDelete}
                style={{ flex: 7, minWidth: 0, height: 54, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 15px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform .12s' }}
              >
                Delete report
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );

  /* ── Desktop right panel ── */
  if (!mob) {
    return (
      <>
        <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
        <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 420, zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', overflow: 'hidden' }}>
          {bodyContent}
        </div>
      </>
    );
  }

  /* ── Mobile bottom sheet ── */
  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
      <div style={{ position: 'absolute', left: 10, right: 10, bottom: 10, maxHeight: '82%', zIndex: 71, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-sheet .4s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ width: 40, height: 5, borderRadius: 3, background: 'var(--cp-line)', margin: '10px auto 0', flexShrink: 0 }} />
        {bodyContent}
      </div>
    </>
  );
}
