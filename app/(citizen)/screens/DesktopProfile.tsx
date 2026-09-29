'use client';
import { useState } from 'react';
import type { Issue, Me } from '@/lib/domain/types';
import { FeedCard } from './FeedScreen';
import { PROFILE_TABS, profileSets, type ProfileTab } from './ProfileScreen';

function ProfileTabButton({ icon, label, count, active, onClick }: { icon: string; label: string; count: number; active: boolean; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  const color = active ? 'var(--cp-ink)' : hover ? 'var(--cp-ink-2)' : 'var(--cp-ink-3)';
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 0 12px', border: 'none', background: 'none', cursor: 'pointer', color, borderBottom: active ? '2px solid var(--cp-ink)' : hover ? '2px solid var(--cp-line)' : '2px solid transparent', font: '600 13px/1 Outfit,sans-serif', transition: 'color .15s,border-color .15s' }}
    >
      <i className={`ph-bold ${icon}`} style={{ fontSize: 17 }} />{label}<span style={{ color: 'var(--cp-ink-3)' }}>{count}</span>
    </button>
  );
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
}

export function DesktopProfile({ issues, supported, opposed, me, meInitials, initialTab, onOpen, onSupport, onOppose, onComments }: Props) {
  const [tab, setTab] = useState<ProfileTab>(initialTab);
  const { myReports, backed, fixed } = profileSets(issues, supported);

  const counts: Record<ProfileTab, number> = { reports: myReports.length, activity: backed.length };
  const rows: Record<ProfileTab, Issue[]> = { reports: myReports, activity: backed };
  const list = rows[tab];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', animation: 'cp-in .35s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '22px 32px 0' }}>
        <span style={{ flex: 1, font: "400 32px/1 'DM Serif Display',serif", letterSpacing: '-.03em' }}>Profile</span>
      </div>

      <div style={{ maxWidth: 1240, margin: 0, width: '100%', padding: '16px 32px 64px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
          <span style={{ width: 84, height: 84, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', display: 'grid', placeItems: 'center', font: '600 26px/1 Outfit,sans-serif' }}>{meInitials}</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 7, font: '600 22px/1.2 Outfit,sans-serif' }}>
              {me.name}
              {me.verified && <i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 18 }} />}
            </span>
            <span style={{ font: '500 13px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{me.area} · civic member since Aug 2026</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(90px,1fr))', gap: 10 }}>
            {[['Reports', myReports.length], ['Supported', backed.length], ['Fixed', fixed]].map(([l, v]) => (
              <div key={l as string} style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px 16px', borderRadius: 14, background: 'var(--cp-surface-2)', textAlign: 'center' }}>
                <span style={{ font: '700 22px/1 Outfit,sans-serif' }}>{v}</span>
                <span style={{ font: '500 11.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-2)' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 28, borderBottom: '1px solid var(--cp-line)', marginBottom: 20 }}>
          {PROFILE_TABS.map(([k, icon, label]) => (
            <ProfileTabButton key={k} icon={icon} label={label} count={counts[k]} active={tab === k} onClick={() => setTab(k)} />
          ))}
        </div>

        {list.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--cp-ink-3)', font: '600 13px/1.4 Outfit,sans-serif' }}>{EMPTY_TXT[tab]}</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(360px,1fr))', gap: 16 }}>
            {list.map(i => (
              <FeedCard key={i.id} issue={i} supported={!!supported[i.id]} opposed={!!opposed[i.id]} mob={false} onOpen={onOpen} onSupport={onSupport} onComments={onComments} onOppose={onOppose} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
