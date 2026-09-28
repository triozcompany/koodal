'use client';
import type { Issue } from '@/lib/domain/types';
import { CATS } from '@/lib/domain/constants';
import { ago, step } from '@/lib/domain/rules';
import { StagePill, pillColors } from './StagePill';
import { ProgressBar } from './ProgressBar';

const SEGC = ['var(--cp-ink-3)', 'var(--cp-marigold)', 'var(--cp-peacock)', 'var(--cp-pulse)', 'var(--cp-leaf)'];

interface Props {
  issue: Issue;
  supported: boolean;
  onOpen: () => void;
  onSupport: (e: React.MouseEvent) => void;
  why?: string;
  feedStyle?: boolean;
}

export function IssueCard({ issue, supported, onOpen, onSupport, why, feedStyle }: Props) {
  const cat = CATS[issue.cat];
  const dist = issue.city === 'Chennai' && issue.km < 3
    ? (issue.km < 1 ? Math.round(issue.km * 1000) + ' m' : issue.km + ' km')
    : issue.city;
  const meta = `${issue.area} · ${dist} · ${ago(issue.created)}`;
  const [pc, pfg] = pillColors(issue.stage);

  if (feedStyle) {
    return (
      <article onClick={onOpen} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--cp-surface)', borderRadius: 0, border: 'none', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', animation: 'cp-row .35s ease-out both' }}>
        {why && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
            <i className="ph-fill ph-trend-up" style={{ color: 'var(--cp-pulse)', fontSize: 14 }}></i>
            {why}
          </span>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <i className={`ph-bold ${cat.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }}></i>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <div style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</div>
            <div style={{ font: '600 14px/1.25 Outfit,sans-serif', textWrap: 'pretty' }}>{issue.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <StagePill stage={issue.stage} />
              <ProgressBar stage={issue.stage} />
              {issue.sev === 'critical' && <i className="ph-fill ph-warning" style={{ color: 'var(--cp-pulse)', fontSize: 14 }}></i>}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto', paddingTop: 6 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-bold ph-arrow-fat-up"></i>{issue.sup}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>
            <i className="ph-bold ph-chat-circle"></i>{issue.comments?.length ?? 0}
          </span>
        </div>
      </article>
    );
  }

  return (
    <div style={{ boxShadow: 'inset 3px 0 0 transparent' }}>
      <div onClick={onOpen} style={{ display: 'grid', gridTemplateColumns: '46px minmax(0,1fr) 54px', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--cp-line)', cursor: 'pointer', alignItems: 'start', background: 'var(--cp-surface)' }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center' }}>
          <i className={`ph-bold ${cat.icon}`} style={{ fontSize: 22, color: 'var(--cp-bg)' }}></i>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <div style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{meta}</div>
          <div style={{ font: '600 14px/1.25 Outfit,sans-serif', textWrap: 'pretty' }}>{issue.title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
            <StagePill stage={issue.stage} />
            <ProgressBar stage={issue.stage} />
            {issue.sev === 'critical' && <i className="ph-fill ph-warning" style={{ color: 'var(--cp-pulse)', fontSize: 14 }}></i>}
          </div>
        </div>
        <button
          onClick={onSupport}
          style={{ width: 54, height: 60, borderRadius: 999, border: '1px solid var(--cp-line)', background: supported ? 'var(--cp-pulse)' : 'var(--cp-surface)', color: supported ? '#fff' : 'var(--cp-ink)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3, cursor: 'pointer', transition: 'transform .25s cubic-bezier(.3,1.6,.5,1),background .15s' }}
        >
          <i className={`ph-${supported ? 'fill' : 'bold'} ph-arrow-fat-up`} style={{ fontSize: 20 }} />
          <span style={{ font: '700 12px/1 Outfit,sans-serif' }}>{issue.sup}</span>
        </button>
      </div>
    </div>
  );
}
