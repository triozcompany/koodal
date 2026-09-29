'use client';
import { useState } from 'react';
import type { Me } from '@/lib/domain/types';

interface ToggleDef { icon: string; label: string; sub: string; value: boolean; onChange: (v: boolean) => void; }

/** Desktop hover feedback for otherwise-static rows — this codebase renders
 * everything with raw inline styles (no CSS modules for most components), so
 * hover has to be tracked as local state rather than a `:hover` rule. */
function useHover() {
  const [hover, setHover] = useState(false);
  return { hover, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) };
}

function ToggleRow({ icon, label, sub, value, onChange }: ToggleDef) {
  const h = useHover();
  return (
    <div onMouseEnter={h.onMouseEnter} onMouseLeave={h.onMouseLeave} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', margin: '0 -8px', borderRadius: 14, background: h.hover ? 'var(--cp-surface-2)' : 'transparent', transition: 'background .15s' }}>
      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 12, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 17 }}>
        <i className={`ph-bold ${icon}`} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{label}</span>
        <span style={{ font: '500 11.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sub}</span>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{ position: 'relative', width: 46, height: 28, flexShrink: 0, borderRadius: 14, background: value ? 'var(--cp-leaf)' : 'var(--cp-surface-2)', border: '1px solid var(--cp-line)', cursor: 'pointer', boxSizing: 'border-box' }}
      >
        <span style={{ position: 'absolute', top: 1, left: value ? 20 : 1, width: 24, height: 24, borderRadius: '50%', background: '#fff', border: '1px solid var(--cp-line)', boxSizing: 'border-box', transition: 'left .25s cubic-bezier(.3,1.6,.5,1)' }} />
      </button>
    </div>
  );
}

function InfoRow({ icon, label, sub, trailing, onClick }: { icon: string; label: string; sub: string; trailing?: string; onClick?: () => void }) {
  const h = useHover();
  return (
    <div
      onClick={onClick}
      onMouseEnter={h.onMouseEnter}
      onMouseLeave={h.onMouseLeave}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', margin: '0 -8px', borderRadius: 14, background: h.hover ? 'var(--cp-surface-2)' : 'transparent', cursor: onClick ? 'pointer' : 'default', transition: 'background .15s' }}
    >
      <span style={{ width: 38, height: 38, flexShrink: 0, borderRadius: 12, background: 'var(--cp-surface-2)', display: 'grid', placeItems: 'center', fontSize: 17 }}>
        <i className={`ph-bold ${icon}`} />
      </span>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>{label}</span>
        <span style={{ font: '500 11.5px/1.3 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sub}</span>
      </div>
      {trailing && <i className={`ph-bold ${trailing}`} style={{ fontSize: 15, color: 'var(--cp-ink-3)', flexShrink: 0 }} />}
    </div>
  );
}

function HoverTile({ icon, title, sub, onClick }: { icon: string; title: string; sub: string; onClick: () => void }) {
  const h = useHover();
  return (
    <button
      onClick={onClick}
      onMouseEnter={h.onMouseEnter}
      onMouseLeave={h.onMouseLeave}
      style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 14, borderRadius: 16, border: '1px solid var(--cp-line)', background: h.hover ? 'var(--cp-surface-2)' : 'var(--cp-surface)', cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)', transition: 'background .15s' }}
    >
      <i className={`ph-bold ${icon}`} style={{ fontSize: 20 }} />
      <span style={{ font: '600 12.5px/1.2 Outfit,sans-serif' }}>{title}</span>
      <span style={{ font: '500 11px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{sub}</span>
    </button>
  );
}

function HoverButton({ onClick, style, children }: { onClick: () => void; style: React.CSSProperties; children: React.ReactNode }) {
  const h = useHover();
  return (
    <button
      onClick={onClick}
      onMouseEnter={h.onMouseEnter}
      onMouseLeave={h.onMouseLeave}
      style={{ height: 50, borderRadius: 999, font: '600 14px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: h.hover ? 0.85 : 1, transition: 'opacity .15s', ...style }}
    >
      {children}
    </button>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span style={{ display: 'block', font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)', margin: '22px 4px 4px' }}>{children}</span>;
}

const LANGUAGES: [string, string, string][] = [
  ['en', 'English', 'English'],
  ['ta', 'தமிழ்', 'Tamil'],
  ['hi', 'हिन्दी', 'Hindi'],
  ['te', 'తెలుగు', 'Telugu'],
  ['kn', 'ಕನ್ನಡ', 'Kannada'],
  ['ml', 'മലയാളം', 'Malayalam'],
  ['bn', 'বাংলা', 'Bengali'],
  ['mr', 'मराठी', 'Marathi'],
  ['gu', 'ગુજરાતી', 'Gujarati'],
  ['pa', 'ਪੰਜਾਬੀ', 'Punjabi'],
  ['or', 'ଓଡ଼ିଆ', 'Odia'],
];

function LanguagePicker({ lang, onPick, onClose }: { lang: string; onPick: (code: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const filtered = LANGUAGES.filter(([, native, en]) => `${native} ${en}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
      <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 'min(420px, calc(100vw - 32px))', zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>Settings</span>
            <span style={{ font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.025em' }}>App language</span>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>

        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, height: 46, padding: '0 14px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)' }}>
            <i className="ph-bold ph-magnifying-glass" style={{ fontSize: 16 }} />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search languages" style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
          {filtered.map(([code, native, en]) => {
            const on = code === lang;
            return (
              <button
                key={code}
                onClick={() => onPick(code)}
                style={{ display: 'flex', alignItems: 'center', width: '100%', gap: 10, padding: '12px 10px', border: 'none', background: on ? 'var(--cp-surface-2)' : 'none', borderRadius: 14, cursor: 'pointer', textAlign: 'left', color: 'var(--cp-ink)' }}
              >
                <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ font: '600 14px/1.2 Outfit,sans-serif' }}>{native}</span>
                  <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{en}</span>
                </span>
                {on && <i className="ph-bold ph-check" style={{ color: 'var(--cp-peacock)', fontSize: 16 }} />}
              </button>
            );
          })}
        </div>

        <div style={{ padding: '14px 20px 20px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <span style={{ font: '500 12px/1.4 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>
            You can still report in any language. Voice notes in Tamil, Tanglish and more are understood.
          </span>
        </div>
      </div>
    </>
  );
}

function EditProfileDrawer({ name, area, onSave, onClose }: { name: string; area: string; onSave: (name: string, area: string) => void; onClose: () => void }) {
  const [pName, setPName] = useState(name);
  const [pArea, setPArea] = useState(area);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 80, background: 'var(--cp-scrim)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', animation: 'cp-in .2s both' }} />
      <div style={{ position: 'fixed', top: 10, right: 10, bottom: 10, width: 'min(420px, calc(100vw - 32px))', zIndex: 81, background: 'var(--cp-surface)', borderRadius: 20, border: '1px solid var(--cp-line)', display: 'flex', flexDirection: 'column', animation: 'cp-side .32s cubic-bezier(.2,.9,.3,1.1) both', boxShadow: '0 24px 60px -20px rgb(0 0 0 / .35)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ font: '600 11px/1 Outfit,sans-serif', letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--cp-ink-3)' }}>Settings</span>
            <span style={{ font: "400 22px/1.1 'DM Serif Display',serif", letterSpacing: '-.025em' }}>Edit profile</span>
          </div>
          <button onClick={onClose} style={{ width: 36, height: 36, flexShrink: 0, borderRadius: '50%', border: 'none', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 16, display: 'grid', placeItems: 'center' }}>
            <i className="ph-bold ph-x" />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '600 10.5px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>NAME</span>
            <input value={pName} onChange={e => setPName(e.target.value)} placeholder="Your name" style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: '600 10.5px/1 Outfit,sans-serif', letterSpacing: '.1em', color: 'var(--cp-ink-3)' }}>AREA / WARD</span>
            <input value={pArea} onChange={e => setPArea(e.target.value)} placeholder="e.g. Velachery, Chennai" style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--cp-line)', background: 'var(--cp-bg)', color: 'var(--cp-ink)', font: '500 14px/1 Outfit,sans-serif', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, padding: '14px 20px 20px', borderTop: '1px solid var(--cp-line)', flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 3, minWidth: 0, height: 52, borderRadius: 999, border: '1px solid var(--cp-line)', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', color: 'var(--cp-ink)', font: '600 13.5px/1 Outfit,sans-serif', cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onSave(pName, pArea)} style={{ flex: 7, minWidth: 0, height: 52, borderRadius: 999, border: 'none', background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 14.5px/1 Outfit,sans-serif', cursor: 'pointer' }}>Save profile</button>
        </div>
      </div>
    </>
  );
}

interface Props {
  me: Me;
  meInitials: string;
  mob: boolean;
  setMe: (patch: Partial<Me>) => void;
  clearVotes: () => void;
  onBack: () => void;
  onLogout: () => void;
}

export function SettingsScreen({ me, meInitials, mob, setMe, clearVotes, onBack, onLogout }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const [haptics, setHaptics] = useState(true);
  const [caseUpdates, setCaseUpdates] = useState(true);
  const [waUpdates, setWaUpdates] = useState(true);
  const [precise, setPrecise] = useState(true);
  const [lang, setLang] = useState('en');
  const [langPickerOpen, setLangPickerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  function toast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2600);
  }

  function saveProfile(name: string, area: string) {
    setMe({ name: name.trim() || me.name, area: area.trim() || me.area });
    setEditOpen(false);
    toast('Profile saved');
  }

  const verifiedLine = me.verified
    ? `Aadhaar e-KYC (mock) · verified ${new Date(me.verifiedAt ?? Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : 'Not verified';

  return (
    <div data-cp-theme="dark" style={{ position: 'absolute', inset: 0, overflowY: 'auto', background: 'var(--cp-bg)', animation: 'cp-in .32s cubic-bezier(.2,.9,.25,1.1) both' }}>
      <div style={{ maxWidth: mob ? '100%' : 760, margin: 0, padding: mob ? '14px 16px 40px' : '24px 32px 64px', boxSizing: 'border-box' }}>

        {mob ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <button onClick={onBack} style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: 'linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2))', border: '1px solid var(--cp-line)', color: 'var(--cp-ink)', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 19 }}>
              <i className="ph-bold ph-arrow-left" />
            </button>
            <span style={{ flex: 1, textAlign: 'center', font: "400 20px/1 'DM Serif Display',serif" }}>Settings</span>
            <span style={{ width: 44, flexShrink: 0 }} />
          </div>
        ) : (
          <div style={{ font: "400 32px/1 'DM Serif Display',serif", letterSpacing: '-.03em', marginBottom: 20 }}>Settings</div>
        )}

        {/* Account card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderRadius: 18, background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
          <span style={{ width: 60, height: 60, flexShrink: 0, borderRadius: '50%', background: 'var(--cp-marigold)', color: 'var(--cp-on-marigold)', display: 'grid', placeItems: 'center', font: '600 18px/1 Outfit,sans-serif' }}>{meInitials}</span>
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, font: '600 15px/1.2 Outfit,sans-serif' }}>
              {me.name}<i className="ph-fill ph-seal-check" style={{ color: 'var(--cp-peacock)', fontSize: 14 }} />
            </span>
            <span style={{ font: '500 12px/1.2 Outfit,sans-serif', color: 'var(--cp-ink-3)' }}>{me.phone} · {me.area}</span>
          </div>
          <button
            onClick={() => setEditOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, height: 36, padding: '0 12px', borderRadius: 999, border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', color: 'var(--cp-ink)', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', flexShrink: 0 }}
          >
            <i className="ph-bold ph-pencil-simple" />Edit
          </button>
        </div>

        <SectionLabel>Preferences</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ToggleRow icon="ph-detective" label="Post anonymously by default" sub="Neighbours won't see your name" value={me.anonDefault} onChange={v => setMe({ anonDefault: v })} />
          <ToggleRow icon="ph-vibrate" label="Haptic feedback" sub="A slight vibration on taps and holds" value={haptics} onChange={setHaptics} />
          <ToggleRow icon="ph-bell-ringing" label="Case updates" sub="Notify me when a case I follow changes status" value={caseUpdates} onChange={setCaseUpdates} />
          <ToggleRow icon="ph-whatsapp-logo" label="WhatsApp updates" sub={`Status messages on ${me.phone ?? 'WhatsApp'}`} value={waUpdates} onChange={setWaUpdates} />
          <ToggleRow icon="ph-crosshair" label="Precise location" sub="Pin reports to within ±10 m" value={precise} onChange={setPrecise} />
        </div>

        <SectionLabel>Language</SectionLabel>
        <InfoRow
          icon="ph-translate"
          label={LANGUAGES.find(([code]) => code === lang)?.[2] ?? 'English'}
          sub="App language · reports stay in the language they were written in"
          trailing="ph-caret-right"
          onClick={() => setLangPickerOpen(true)}
        />

        <SectionLabel>Account</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <InfoRow icon="ph-identification-badge" label="Identity verified" sub={verifiedLine} trailing="ph-seal-check" />
          <InfoRow icon="ph-phone" label="Mobile number" sub={me.phone ?? '—'} trailing="ph-lock-simple" />
          <InfoRow icon="ph-shield-check" label="Data & privacy" sub="Your identity is never shown on anonymous posts" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 20 }}>
          <HoverTile icon="ph-lifebuoy" title="Help & feedback" sub="FAQs, contact support" onClick={() => toast('Help centre · support@koodal.in')} />
          <HoverTile icon="ph-info" title="About" sub="Koodal v1.0 · terms" onClick={() => toast('Koodal v1.0 · made in Tamil Nadu')} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 24 }}>
          <HoverButton onClick={() => toast('Demo: account deletion needs OTP confirmation')} style={{ color: 'var(--cp-pulse)', background: 'var(--cp-surface)', border: '1px solid var(--cp-line)' }}>
            Delete account
          </HoverButton>
          <HoverButton onClick={onLogout} style={{ background: 'var(--cp-ink)', color: 'var(--cp-bg)', border: 'none' }}>
            <i className="ph-bold ph-sign-out" />Log out
          </HoverButton>
          <button
            onClick={() => { clearVotes(); toast('Demo reset'); }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, height: 40, border: 'none', background: 'none', color: 'var(--cp-ink-3)', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer' }}
          >
            <i className="ph-bold ph-arrow-counter-clockwise" />Reset demo data
          </button>
        </div>
      </div>

      {editOpen && (
        <EditProfileDrawer name={me.name} area={me.area} onSave={saveProfile} onClose={() => setEditOpen(false)} />
      )}

      {toastMsg && (
        <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', height: 44, padding: '0 20px', borderRadius: 999, background: 'var(--cp-ink)', color: 'var(--cp-bg)', font: '600 13px/44px Outfit,sans-serif', whiteSpace: 'nowrap', boxShadow: '0 8px 24px -8px rgb(0 0 0 / .4)', animation: 'cp-toast .4s cubic-bezier(.2,.9,.3,1.3) both', zIndex: 100 }}>
          {toastMsg}
        </div>
      )}

      {langPickerOpen && (
        <LanguagePicker lang={lang} onPick={code => { setLang(code); setLangPickerOpen(false); }} onClose={() => setLangPickerOpen(false)} />
      )}
    </div>
  );
}
