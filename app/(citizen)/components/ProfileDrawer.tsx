'use client';
import { useRouter } from 'next/navigation';
import type { Issue } from '@/lib/domain/types';

interface Props {
  issues: Issue[];
  supported: Record<string, boolean>;
  meInitials: string;
  meVerified: boolean;
  meName: string;
  meArea: string;
  onClose: () => void;
  onLogout: () => void;
}

/** Mobile-only profile drawer — drops from the top (design's `36-profile-drawer`).
 * Desktop skips this entirely: clicking the rail avatar goes straight to /profile
 * (see openProfile() in app-context.tsx); Settings also lives in the rail there,
 * not in this drawer. */
export function ProfileDrawer({ issues, supported, meInitials, meVerified, meName, meArea, onClose, onLogout }: Props) {
  const router = useRouter();

  const myReports = issues.filter(i => i.mine);
  const backed = issues.filter(i => supported[i.id] && !i.mine);

  function go(path: string) {
    router.push(path);
    onClose();
  }

  const rows = [
    { icon: 'ph-camera', label: 'My reports', sub: 'Posts you created', n: myReports.length, tab: 'reports' },
    { icon: 'ph-arrow-fat-up', label: 'Activity', sub: "Reports you've supported", n: backed.length, tab: 'activity' },
  ];

  return (
    <>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'var(--cp-scrim)', backdropFilter: 'blur(6px) saturate(120%)', WebkitBackdropFilter: 'blur(6px) saturate(120%)', animation: 'cp-row .2s both' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, zIndex: 71, background: 'var(--cp-surface)', borderRadius: '0 0 24px 24px', border: '1px solid var(--cp-line)', borderTop: 'none', display: 'flex', flexDirection: 'column', animation: 'cp-drop .35s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ position: 'relative', width: 56, height: 56, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', display: 'grid', placeItems: 'center', font: '600 18px/1 Outfit,sans-serif' }}>
            {meInitials}
            {meVerified && (
              <span style={{ position: 'absolute', right: -4, bottom: -4, width: 20, height: 20, borderRadius: '50%', background: 'var(--cp-peacock)', border: '2px solid var(--cp-surface)', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                <i className="ph-bold ph-check" />
              </span>
            )}
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 0 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 16px/1.2 Outfit,sans-serif' }}>
              {meName}
              {meVerified && <i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 15 }} />}
            </span>
            <span style={{ font: '500 12.5px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{meArea}</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', padding: '0 8px' }}>
          {rows.map((r, i) => (
            <button
              key={r.tab}
              onClick={() => go(`/profile?tab=${r.tab}`)}
              style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)', borderRadius: 14, animation: `cp-row .3s ${i * 0.03}s ease-out both` }}
            >
              <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
                <i className={`ph-bold ${r.icon}`} />
              </span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>{r.label}</span>
                <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{r.sub}</span>
              </span>
              {r.n !== null && (
                <span style={{ font: '600 12px/1 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{r.n}</span>
              )}
              <i className="ph-bold ph-caret-right" style={{ fontSize: 14, color: 'var(--cp-ink-3)' }} />
            </button>
          ))}
          <button
            onClick={() => go('/settings')}
            style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)', borderRadius: 14, animation: 'cp-row .3s .12s ease-out both' }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 18 }}>
              <i className="ph-bold ph-gear-six" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>Settings & theme</span>
              <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Profile, privacy, appearance</span>
            </span>
            <i className="ph-bold ph-caret-right" style={{ fontSize: 14, color: 'var(--cp-ink-3)' }} />
          </button>
          <button
            onClick={() => { onLogout(); onClose(); }}
            style={{ display: 'grid', gridTemplateColumns: '40px 1fr auto', gap: 12, alignItems: 'center', padding: '10px 12px', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-pulse)', borderRadius: 14, animation: 'cp-row .3s .15s ease-out both' }}
          >
            <span style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 18, color: 'var(--cp-pulse)' }}>
              <i className="ph-bold ph-sign-out" />
            </span>
            <span style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <span style={{ font: '600 13.5px/1.2 Outfit,sans-serif' }}>Log out</span>
              <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>Sign out of Koodal</span>
            </span>
          </button>
        </div>

        <div style={{ padding: '10px 20px 24px' }}>
          <button data-glare="1"
            onClick={() => go('/profile')}
            style={{ width: '100%', height: 50, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer' }}
          >
            Open profile
          </button>
        </div>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--cp-line)', margin: '0 auto 14px', flexShrink: 0 }} />
      </div>
    </>
  );
}
