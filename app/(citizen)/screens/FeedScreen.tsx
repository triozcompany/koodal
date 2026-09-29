'use client';
import type { Issue } from '@/lib/domain/types';
import { CATS, issueIcon } from '@/lib/domain/constants';
import { PILL, AVB } from '@/lib/domain/stage-style';
import { ago, score, topTags } from '@/lib/domain/rules';
import { ImageCarousel } from '../components/ImageCarousel';
import styles from './FeedScreen.module.css';

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  opposed?: Record<string, boolean>;
  meInitials: string;
  meVerified: boolean;
  mob?: boolean;
  wide?: boolean;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  onComments: (id: string) => void;
  onOppose: (id: string) => void;
  onProfile: () => void;
}

function nameHash(s: string): number {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

function initials(name: string): string {
  return name.split(' ').filter(Boolean).map(s => s[0]).join('').slice(0, 2).toUpperCase();
}

function confColor(conf: number): string {
  if (conf >= 80) return 'var(--cp-leaf)';
  if (conf >= 50) return 'var(--cp-peacock)';
  return 'var(--cp-marigold)';
}

export function FeedScreen({ issues, supported, opposed = {}, meInitials, meVerified, mob = false, wide = false, onOpen, onSupport, onComments, onOppose, onProfile }: Props) {
  const showSidebar = !mob && wide;

  const trending = issues
    .filter(i => i.city === 'Chennai' && i.km < 6 && ['community', 'review'].includes(i.stage))
    .sort((a, b) => score(b) - score(a))
    .slice(0, 5);

  const tags = topTags(issues, 10);

  const feedList = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mob ? 8 : 16 }}>
      {issues.length === 0
        ? <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>No reports match these filters.</div>
        : issues.map(issue => <FeedCard key={issue.id} issue={issue} supported={!!supported[issue.id]} opposed={!!opposed[issue.id]} mob={mob} onOpen={onOpen} onSupport={onSupport} onComments={onComments} onOppose={onOppose} />)
      }
    </div>
  );

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: mob ? '14px 16px 10px' : '24px 32px 6px', flexShrink: 0 }}>
        <div style={{ flex: 1 }}>
          <div style={{ font: "400 26px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Feed</div>
          {!mob && <div style={{ font: '500 13px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)', marginTop: 6 }}>Latest and trending civic reports from around you.</div>}
        </div>
        <button
          onClick={onProfile}
          className={styles.avatarBtn}
          title="Profile"
          style={{ position: 'relative', width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer' }}
        >
          {meInitials}
          {meVerified && (
            <span style={{ position: 'absolute', right: -6, bottom: -6, width: 18, height: 18, borderRadius: '50%', background: 'var(--cp-peacock)', border: '2px solid var(--cp-surface)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10 }}>
              <i className="ph-bold ph-check" />
            </span>
          )}
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: mob ? '0 0 110px' : '18px 32px 64px', background: 'var(--cp-bg)' }}>
        <div style={{ maxWidth: mob ? '100%' : 1240, margin: mob ? undefined : '0 auto', display: 'grid', gridTemplateColumns: showSidebar ? 'minmax(0,1fr) 300px' : 'minmax(0,1fr)', gap: 24, alignItems: 'start' }}>
          <div style={{ minWidth: 0, maxWidth: showSidebar ? undefined : (mob ? undefined : 720) }}>{feedList}</div>

          {showSidebar && (
            <aside style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 0 }}>
              <div style={{ border: '1px solid var(--cp-line)', borderRadius: 18, padding: 16, background: 'var(--cp-surface)' }}>
                <span style={{ display: 'block', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', marginBottom: 14 }}>Trending near you</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {trending.length === 0 && <span style={{ font: '500 12.5px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Nothing trending right now.</span>}
                  {trending.map((i, k) => (
                    <button
                      key={i.id}
                      onClick={() => onOpen(i.id)}
                      style={{ display: 'flex', gap: 10, alignItems: 'flex-start', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, color: 'var(--cp-ink)' }}
                    >
                      <span style={{ font: "400 18px/1.1 'DM Serif Display',serif", color: 'var(--cp-ink-3)', flexShrink: 0, width: 18 }}>{k + 1}</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ font: '600 13px/1.3 Outfit,sans-serif' }}>{i.title}</span>
                        <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{i.sup} citizens · {i.area}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ border: '1px solid var(--cp-line)', borderRadius: 18, padding: 16, background: 'var(--cp-surface)' }}>
                <span style={{ display: 'block', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', marginBottom: 14 }}>Popular tags</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 12px' }}>
                  {tags.map(({ t }) => (
                    <span key={t} style={{ font: '600 12.5px/1 Outfit,sans-serif', color: 'var(--cp-peacock)', cursor: 'pointer' }}>#{t}</span>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

export function FeedCard({ issue, supported, opposed, mob, onOpen, onSupport, onComments, onOppose }: { issue: Issue; supported: boolean; opposed: boolean; mob: boolean; onOpen: (id: string) => void; onSupport: (id: string) => void; onComments: (id: string) => void; onOppose: (id: string) => void; }) {
  const [pc, pfg, pl] = PILL[issue.stage] ?? PILL.reported;
  const abg    = AVB[nameHash(issue.by) % AVB.length];
  const ai     = issue.anon ? '' : initials(issue.by);
  const place  = `${issue.area}${issue.street ? ', ' + issue.street : ''}`;
  const photoN = Math.max(1, issue.evidence?.length ?? 1);
  const contribN = Math.max(1, (issue.merged?.length ?? 0) + 1);
  const preCase  = issue.stage === 'reported' || issue.stage === 'community';
  const isCase   = !!issue.caseId;
  const supBg    = supported ? 'var(--cp-pulse)' : 'var(--cp-surface)';
  const supFg    = supported ? '#fff' : 'var(--cp-ink)';
  const supIcon  = supported ? 'ph-fill ph-arrow-fat-up' : 'ph-bold ph-arrow-fat-up';
  const oppBg    = opposed ? 'var(--cp-ink)' : 'var(--cp-surface)';
  const oppFg    = opposed ? 'var(--cp-bg)' : 'var(--cp-ink)';
  const oppIcon  = opposed ? 'ph-fill ph-thumbs-down' : 'ph-bold ph-thumbs-down';

  // Desktop cards get a raised "physical" treatment; mobile stays flush.
  const postR  = mob ? 0 : 22;
  const postB  = mob ? 'none' : '2px solid var(--cp-edge)';
  const postSh = mob ? 'none' : '0 4px 0 var(--cp-edge)';

  return (
    <article
      onClick={() => onOpen(issue.id)}
      style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 16, background: 'var(--cp-surface)', borderRadius: postR, border: postB, boxShadow: postSh, cursor: 'pointer', animation: 'cp-row .35s ease-out both' }}
    >
      {/* Author row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 13, background: abg, display: 'grid', placeItems: 'center', font: '700 12px/1 Outfit,sans-serif', color: 'var(--cp-ink)' }}>
          {issue.anon
            ? <i className="ph-bold ph-detective" style={{ fontSize: 20 }} />
            : ai
          }
        </span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, font: '600 13px/1.1 Outfit,sans-serif', whiteSpace: 'nowrap', minWidth: 0 }}>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{issue.anon ? 'Anonymous' : issue.by}</span>
            <span style={{ color: 'var(--cp-ink-3)', fontWeight: 500, flexShrink: 0 }}>· {ago(issue.created)}</span>
          </span>
          <span style={{ font: '500 12px/1.1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place}</span>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', height: 22, padding: '0 8px', borderRadius: 999, background: pc, color: pfg, font: '600 11.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap', flexShrink: 0 }}>{pl}</span>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ font: '700 16px/1.25 Outfit,sans-serif', textWrap: 'pretty' } as React.CSSProperties}>{issue.title}</span>
        {issue.text && (
          <span style={{ font: '400 13.5px/1.45 Outfit,sans-serif', color: 'var(--cp-ink-2)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
            {issue.text}
          </span>
        )}
        {issue.voice && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 12, background: 'var(--cp-surface-2)', font: "500 12px/1.3 'Noto Sans Tamil',Outfit,sans-serif", color: 'var(--cp-ink)' }}>
            <i className="ph-fill ph-waveform" style={{ fontSize: 18, color: 'var(--cp-pulse)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{issue.voice.text}</span>
          </span>
        )}
      </div>

      {/* Photo carousel */}
      <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--cp-line)' }}>
        <ImageCarousel count={photoN} urls={issue.evidence?.map(e => e.url)}>
          <div style={{ position: 'absolute', left: 12, top: 12, width: 34, height: 34, borderRadius: 10, background: 'var(--cp-ink)', display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
            <i className={`ph-bold ${issueIcon(issue)}`} style={{ color: 'var(--cp-bg)', fontSize: 17 }} />
          </div>
          <span onClick={() => onOpen(issue.id)} style={{ position: 'absolute', right: 10, bottom: 10, display: 'flex', alignItems: 'center', gap: 6, height: 28, padding: '0 10px', borderRadius: 9, background: 'var(--cp-surface)', font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap', cursor: 'pointer' }}>
            <i className="ph-bold ph-images" />
            {photoN} · {contribN} people
          </span>
        </ImageCarousel>
      </div>

      {/* Tags */}
      {(issue.tags?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 10px' }}>
          {issue.tags.map(t => (
            <span key={t} style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-peacock)' }}>#{t}</span>
          ))}
        </div>
      )}

      {/* Confidence bar */}
      {preCase && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ position: 'relative', flex: 1, height: 8, borderRadius: 4, background: 'var(--cp-surface-2)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${issue.conf}%`, borderRadius: 4, background: confColor(issue.conf), transition: 'width .6s cubic-bezier(.3,1.4,.5,1)' }} />
              <div style={{ position: 'absolute', left: '80%', top: -3, bottom: -3, width: 2, background: 'var(--cp-ink)' }} />
            </div>
            <span style={{ font: '700 12.5px/1 Outfit,sans-serif' }}>{issue.conf}%</span>
          </div>
        </div>
      )}

      {/* Official case row */}
      {isCase && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, background: 'var(--cp-peacock-soft)' }}>
          <i className="ph-fill ph-bank" style={{ color: 'var(--cp-peacock)', fontSize: 17, flexShrink: 0 }} />
          <span style={{ font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>{issue.caseId}</span>
          <span style={{ font: '500 12.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl} · {issue.dept || 'GCC'}</span>
        </div>
      )}

      {/* Action row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button
          onClick={e => { e.stopPropagation(); onSupport(issue.id); }}
          title="Support"
          className={styles.supportBtn}
          style={{ display: 'flex', alignItems: 'center', gap: 7, height: 40, padding: '0 13px', borderRadius: 999, border: '1px solid var(--cp-line)', background: supBg, color: supFg, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '700 13px/1 Outfit,sans-serif', cursor: 'pointer', transition: 'transform .25s cubic-bezier(.3,1.6,.5,1),background .15s', flexShrink: 0 }}
        >
          <i className={supIcon} style={{ fontSize: 18 }} />
          {issue.sup}
        </button>
        {!issue.mine && (
          <button
            onClick={e => { e.stopPropagation(); onOppose(issue.id); }}
            title="Not an issue"
            className={styles.opposeBtn}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 11px', borderRadius: 999, border: '1px solid var(--cp-line)', background: oppBg, color: oppFg, boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', font: '700 12px/1 Outfit,sans-serif', cursor: 'pointer', flexShrink: 0, transition: 'background .15s,color .15s' }}
          >
            <i className={oppIcon} style={{ fontSize: 17 }} />
            {issue.opp}
          </button>
        )}
        <button
          onClick={e => { e.stopPropagation(); onComments(issue.id); }}
          title="Comments"
          className={styles.commentBtn}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 10px', border: 'none', borderRadius: 999, background: 'transparent', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer' }}
        >
          <i className="ph-bold ph-chat-circle" style={{ fontSize: 20 }} />
          {issue.comments?.length ?? 0}
        </button>
        <button
          onClick={e => e.stopPropagation()}
          title="Share"
          className={styles.shareBtn}
          style={{ display: 'flex', alignItems: 'center', gap: 6, height: 40, padding: '0 10px', border: 'none', borderRadius: 999, background: 'transparent', color: 'var(--cp-ink)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer' }}
        >
          <i className="ph-bold ph-share-fat" style={{ fontSize: 19 }} />
        </button>
        <div style={{ flex: 1 }} />
        <span style={{ font: '500 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)', whiteSpace: 'nowrap' }}>{CATS[issue.cat]?.l}</span>
      </div>
    </article>
  );
}
