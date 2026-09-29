'use client';
import { useState } from 'react';
import type { Issue, Me } from '@/lib/domain/types';
import { FeedCard } from './FeedScreen';

export type ProfileTab = 'reports' | 'activity';

export const PROFILE_TABS: [ProfileTab, string, string][] = [
  ['reports', 'ph-camera', 'Reports'],
  ['activity', 'ph-arrow-fat-up', 'Activity'],
];

export function profileSets(issues: Issue[], supported: Record<string, boolean>) {
  const myReports = issues.filter(i => i.mine);
  const backed = issues.filter(i => supported[i.id] && !i.mine);
  const fixed = [...myReports, ...backed].filter(i => i.stage === 'closed').length;
  return { myReports, backed, fixed };
}

const EMPTY_TXT: Record<ProfileTab, string> = {
  reports: "You haven't reported anything yet.",
  activity: 'Reports you support show up here.',
};

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  opposed: Record<string, boolean>;
  me: Me;
  meInitials: string;
  initialTab: ProfileTab;
  onOpen: (id: string) => void;
  onSupport: (id: string) => void;
  onOppose: (id: string) => void;
  onComments: (id: string) => void;
  onBack: () => void;
  onSettings: () => void;
}

export function ProfileScreen({ issues, supported, opposed, me, meInitials, initialTab, onOpen, onSupport, onOppose, onComments, onBack, onSettings }: Props) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const { myReports, backed, fixed } = profileSets(issues, supported);

  const counts: Record<ProfileTab, number> = { reports: myReports.length, activity: backed.length };
  const rows: Record<ProfileTab, Issue[]> = { reports: myReports, activity: backed };
  const list = rows[tab];

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px', flexShrink: 0 }}>
        <button onClick={onBack} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', boxShadow: '0 2px 0 var(--cp-edge),0 8px 14px -10px rgb(0 0 0 / .25)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}>
          <i className="ph-bold ph-arrow-left" />
        </button>
        <span style={{ flex: 1, textAlign: 'center', font: '600 16px/1 Outfit,sans-serif' }}>Profile</span>
        <button onClick={onSettings} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-surface-2)', border: '1px solid var(--cp-line)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
          <i className="ph-bold ph-gear-six" />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 110px' }}>
        {/* Identity card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '10px 0 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 72, height: 72, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', display: 'grid', placeItems: 'center', font: '600 22px/1 Outfit,sans-serif' }}>{meInitials}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 19px/1.2 Outfit,sans-serif' }}>
                {me.name}
                {me.verified && <i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 16 }} />}
              </span>
              <span style={{ font: '500 12.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{me.area} · civic member since Aug 2026</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {[['Reports', myReports.length], ['Supported', backed.length], ['Fixed', fixed]].map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 10px', borderRadius: 14, background: 'var(--cp-surface-2)', textAlign: 'center' }}>
                <span style={{ font: '700 20px/1 Outfit,sans-serif' }}>{v}</span>
                <span style={{ font: '500 11px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs — underline indicator */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--cp-line)', marginBottom: 16 }}>
          {PROFILE_TABS.map(([k, icon, label]) => {
            const on = tab === k;
            return (
              <button
                key={k}
                onClick={() => setTab(k)}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 0 10px', border: 'none', background: 'none', cursor: 'pointer', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-3)', borderBottom: on ? '2px solid var(--cp-ink)' : '2px solid transparent' }}
              >
                <i className={`ph-bold ${icon}`} style={{ fontSize: 18 }} />
                <span style={{ font: '600 11px/1 Outfit,sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}>{label}<span style={{ color: 'var(--cp-ink-3)' }}>{counts[k]}</span></span>
              </button>
            );
          })}
        </div>

        {list.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>{EMPTY_TXT[tab]}</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map(i => (
              <FeedCard key={i.id} issue={i} supported={!!supported[i.id]} opposed={!!opposed[i.id]} mob onOpen={onOpen} onSupport={onSupport} onComments={onComments} onOppose={onOppose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
