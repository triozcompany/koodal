'use client';
import styles from './IssueTopBar.module.css';

const floatBtnBase: React.CSSProperties = {
  width: 44, height: 44, flexShrink: 0, borderRadius: '50%',
  background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))',
  border: '1px solid var(--cp-line)',
  boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)',
  color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18,
};

interface Props {
  backLabel: string;
  caseOrId: string;
  shares?: number;
  onBack: () => void;
  onShare?: () => void;
  showComment?: boolean;
  onComments?: () => void;
  showEdit?: boolean;
  onEdit?: () => void;
}

/** The fixed/sticky desktop header shared by the issue detail page and the
 * evidences (photo gallery) route — same chrome, different action set. */
export function IssueTopBar({ backLabel, caseOrId, shares, onBack, onShare, showComment = true, onComments, showEdit = false, onEdit }: Props) {
  return (
    <div style={{ flexShrink: 0, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--cp-bg)', borderBottom: '1px solid var(--cp-line)', zIndex: 10 }}>
      <button onClick={onBack} className={styles.btn} style={floatBtnBase} aria-label="Back">
        <i className="ph-bold ph-arrow-left" />
      </button>
      <span style={{ font: '500 12.5px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>
        {backLabel} <span style={{ margin: '0 4px' }}>/</span>
        <span style={{ color: 'var(--cp-ink-2)' }}>{caseOrId}</span>
      </span>
      <div style={{ flex: 1 }} />
      {showComment && (
        <button onClick={onComments} className={styles.btn} style={{ ...floatBtnBase, borderRadius: '50%' }} aria-label="Comments">
          <i className="ph-bold ph-chat-circle" />
        </button>
      )}
      {showEdit && (
        <button onClick={onEdit} className={styles.btn} style={{ height: 44, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 7, alignItems: 'center' }}>
          <i className="ph-bold ph-pencil-simple" />Edit
        </button>
      )}
      <button onClick={onShare} className={styles.btn} style={{ flexShrink: 0, height: 44, padding: '0 14px', borderRadius: 999, background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', font: '600 13px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 7, alignItems: 'center', whiteSpace: 'nowrap' }}>
        <i className="ph-bold ph-share-fat" />Share{shares !== undefined ? ` · ${shares}` : ''}
      </button>
    </div>
  );
}
