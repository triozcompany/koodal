'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { s } from './s';
import { PLANS, TRIAL_DAYS, TYPES, planPer, planPrice, type Cycle } from './data';

type Screen = 'account' | 'type' | 'details' | 'plan' | 'creating' | 'done';
const SIZES: [string, string][] = [['s', 'Up to 100'], ['m', '100 – 500'], ['l', '500 – 3,000'], ['xl', '3,000+']];
const GOV_SIZES: Record<string, string> = { s: 'Up to 50k', m: '50k – 2 lakh', l: '2 – 10 lakh', xl: '10 lakh+' };
const slugify = (v: string) => v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32);
const initials = (v: string) => {
  const w = v.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean);
  return ((w[0] || 'K')[0] + ((w[1] || w[0] || 'O')[w[1] ? 0 : 1] || '')).toUpperCase();
};
const BACK: Partial<Record<Screen, Screen | 'home'>> = { account: 'home', type: 'account', details: 'type', plan: 'details' };

export function GetStarted() {
  const router = useRouter();
  const params = useSearchParams();
  const [screen, setScreen] = useState<Screen>('account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [org, setOrg] = useState('');
  const [city, setCity] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(params.get('plan'));
  const [cycle, setCycle] = useState<Cycle>('yearly');
  const [bi, setBi] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<{ bt?: ReturnType<typeof setInterval>; tt?: ReturnType<typeof setTimeout> }>({});
  useEffect(() => () => { clearInterval(timers.current.bt); clearTimeout(timers.current.tt); }, []);

  const T = TYPES.find((t) => t.k === type);
  const rec = type === 'gov' || size === 'xl' ? 'civic' : size === 'l' ? 'institution' : size === 'm' ? 'community' : 'starter';
  const P = PLANS.find((p) => p.k === (plan || rec)) ?? PLANS[0];
  const orgName = org.trim() || (T ? T.ph.replace(/^e\.g\. /, '') : 'Your organization');
  const vocab0 = T ? T.v[0] : 'members';
  const vocab1 = T ? T.v[1] : 'teams';

  const go = (sc: Screen) => { setScreen(sc); setErr(''); window.scrollTo(0, 0); };
  const showToast = (m: string) => { setToast(m); clearTimeout(timers.current.tt); timers.current.tt = setTimeout(() => setToast(null), 2400); };

  const accNext = () => {
    if (!otpSent) {
      if (!name.trim() || !email.trim()) return setErr('Enter your name and a work email or phone.');
      setOtpSent(true); setErr(''); return;
    }
    if (otp.length !== 6) return setErr('Enter all six digits.');
    go('type');
  };
  const detNext = () => {
    if (!org.trim()) return setErr('Give your organization a name.');
    if (slug.length < 3) return setErr('Pick a Koodal address with at least 3 characters.');
    if (!size) return setErr('Tell us roughly how big it is, so we can suggest a plan.');
    go('plan');
  };
  const back = () => {
    if (screen === 'account' && otpSent) { setOtpSent(false); setOtp(''); setErr(''); return; }
    const b = BACK[screen];
    if (b === 'home') router.push('/'); else if (b) go(b);
  };
  const create = () => {
    setPlan(P.k); setScreen('creating'); setBi(0);
    clearInterval(timers.current.bt);
    let n = 0;
    timers.current.bt = setInterval(() => {
      n += 1;
      if (n > 3) {
        clearInterval(timers.current.bt);
        try {
          const L = JSON.parse(localStorage.getItem('koodal-created-orgs') || '[]');
          L.unshift({ id: 'o' + Date.now().toString(36), name: org.trim(), tk: type, city: city.trim(), slug, plan: P.k, cycle, size, created: Date.now(), trialDays: TRIAL_DAYS });
          localStorage.setItem('koodal-created-orgs', JSON.stringify(L.slice(0, 6)));
        } catch { /* storage unavailable: the flow still completes */ }
        setScreen('done');
      } else setBi(n);
    }, 650);
  };

  const at = screen === 'creating' || screen === 'done' ? 4 : ['account', 'type', 'details', 'plan'].indexOf(screen);
  const STEP_LABELS = ['Your account', 'Organization type', 'Details', 'Plan'];
  const pv = { ini: initials(orgName), bg: T ? T.bg : '#262626', fg: T ? T.fg : '#bdbdbd' };
  const radio = (on: boolean) => ({ bd: on ? 'var(--cp-ink)' : 'var(--cp-line)', rbg: on ? 'var(--cp-surface-2)' : 'var(--cp-surface)', dot: on ? 'var(--cp-ink)' : 'transparent' });
  const seg = (on: boolean) => ({ background: on ? 'var(--cp-surface)' : 'transparent', color: on ? 'var(--cp-ink)' : 'var(--cp-ink-2)', boxShadow: on ? '0 2px 6px -2px rgb(0 0 0 / .2)' : 'none' });
  const Radio = ({ on }: { on: boolean }) => (
    <span style={{ ...s('width:22px;height:22px;flex:none;border-radius:50%;box-sizing:border-box;display:grid;place-items:center'), border: `2px solid ${on ? 'var(--cp-ink)' : 'var(--cp-line)'}` }}>
      <span style={{ ...s('width:10px;height:10px;border-radius:50%'), background: radio(on).dot }} />
    </span>
  );
  const Err = () => err ? <span style={s('display:flex;align-items:center;gap:6px;font:600 12.5px/1.3 Outfit,sans-serif;color:var(--cp-pulse-deep)')}><i className="ph-bold ph-warning-circle" />{err}</span> : null;
  const Cycles = () => (
    <div style={s('display:flex;gap:4px;padding:4px;border-radius:999px;background:var(--cp-surface-2);align-self:flex-start')}>
      {(['monthly', 'yearly'] as const).map((k) => (
        <button key={k} onClick={() => setCycle(k)} style={{ ...s('height:36px;padding:0 16px;border-radius:999px;border:none;font:600 13px/1 Outfit,sans-serif;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap'), ...seg(cycle === k) }}>
          {k === 'monthly' ? 'Monthly' : 'Yearly'}
          {k === 'yearly' && <span style={s('height:18px;padding:0 6px;border-radius:999px;background:var(--cp-leaf-soft);color:var(--cp-leaf);font:700 10px/18px Outfit,sans-serif;white-space:nowrap')}>2 MONTHS FREE</span>}
        </button>
      ))}
    </div>
  );

  const buildSteps = [
    `Creating ${orgName}`,
    `Adding ${T && T.chips.length ? T.chips.slice(0, 3).join(', ').toLowerCase() + ' categories' : 'default categories'}`,
    `Setting up ${vocab1}`,
    'Starting your trial',
  ];
  const nextSteps: [string, string, string][] = [
    ['ph-users-three', `Add your ${vocab1}`, `Who fixes what. We added ${T && T.chips.length ? T.chips.length : 4} to start.`],
    ['ph-map-pin', 'Set up your areas', type === 'gov' ? 'Zones and wards members report from' : type === 'apt' ? 'Blocks, floors and common areas' : type === 'uni' ? 'Buildings and spaces on campus' : 'Locations members report from'],
    ['ph-user-plus', `Invite ${vocab0} and staff`, 'Share a link, a join code or email invites'],
  ];

  return (
    <div className="kd-flow" data-cp-theme="light">
      {toast && <div style={s('position:fixed;top:16px;left:50%;z-index:150;display:flex;align-items:center;gap:8px;padding:11px 16px;border-radius:14px;background:var(--cp-ink);color:var(--cp-bg);font:600 12.5px/1.25 Outfit,sans-serif;animation:kd-toast .35s cubic-bezier(.2,.9,.3,1.3) both;box-shadow:0 10px 30px -10px rgba(0,0,0,.4)')}><i className="ph-fill ph-check-circle" style={s('color:var(--cp-leaf);font-size:17px')} />{toast}</div>}

      <aside className="kd-flow-rail" data-cp-theme="dark">
        <Link href="/" style={s('align-self:flex-start;display:flex;align-items:center;gap:10px;color:#f5f5f5;text-decoration:none')}>
          <span style={s('width:38px;height:38px;border-radius:50%;background:#fff;display:grid;place-items:center')}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/koodal-mark.png" alt="Koodal" style={s('width:28px;height:28px;object-fit:contain')} />
          </span>
          <span style={s('font:700 18px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
        </Link>
        <div style={s('display:flex;flex-direction:column;gap:4px')}>
          {STEP_LABELS.map((l, k) => {
            const done = k < at, cur = k === at;
            return (
              <div key={l} style={s('display:flex;align-items:center;gap:12px;height:44px')}>
                <span style={{ ...s('width:28px;height:28px;flex:none;border-radius:50%;box-sizing:border-box;display:grid;place-items:center;font:700 12px/1 Outfit,sans-serif;border-width:1.5px;border-style:solid'), background: done ? 'var(--cp-leaf)' : cur ? '#fff' : 'transparent', color: done ? '#fff' : cur ? '#0f0f0f' : '#7c7c7c', borderColor: done ? 'var(--cp-leaf)' : cur ? '#fff' : '#2e2e2e' }}>
                  {done ? <i className="ph-bold ph-check" style={{ fontSize: 13 }} /> : k + 1}
                </span>
                <span style={{ ...s('font:600 14px/1 Outfit,sans-serif'), color: done || cur ? '#f5f5f5' : '#7c7c7c' }}>{l}</span>
              </div>
            );
          })}
        </div>
        <div style={{ flex: 1 }} />
        <div style={s('display:flex;flex-direction:column;gap:12px')}>
          <span style={s('font:600 11px/1 Outfit,sans-serif;letter-spacing:.16em;color:#7c7c7c')}>HOW IT WILL LOOK</span>
          <div style={s('width:236px;padding:14px 12px;border-radius:18px;background:#0d0d0d;border:1px solid #1e1e1e;display:flex;flex-direction:column;gap:8px')}>
            <div style={s('display:flex;align-items:center;gap:10px;height:56px;padding:0 8px;border:1px solid #262626;border-radius:16px;background:#141414')}>
              <span style={{ ...s('width:34px;height:34px;flex:none;border-radius:10px;font:700 12.5px/34px Outfit,sans-serif;text-align:center;transition:background .25s'), background: pv.bg, color: pv.fg }}>{pv.ini}</span>
              <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:5px')}>
                <span style={s('font:600 13.5px/1.1 Outfit,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{orgName}</span>
                <span style={s('font:600 9px/1 Outfit,sans-serif;letter-spacing:.18em;color:var(--cp-marigold);white-space:nowrap')}>{(T ? T.l.split(' ')[0] : 'Organization').toUpperCase()} · OWNER</span>
              </span>
              <i className="ph-bold ph-caret-up-down" style={s('font-size:15px;color:#8a8a8a')} />
            </div>
            <div style={s('display:flex;align-items:center;gap:12px;height:40px;padding:0 14px;border-radius:999px;background:#1e1e1e;font:600 13px/1 Outfit,sans-serif')}><i className="ph-fill ph-house" style={{ fontSize: 18 }} />Home</div>
            <div style={s('display:flex;align-items:center;gap:12px;height:40px;padding:0 14px;color:#8a8a8a;font:600 13px/1 Outfit,sans-serif')}><i className="ph-bold ph-folders" style={{ fontSize: 18 }} />Cases</div>
          </div>
          <span style={s('font:500 12.5px/1.45 Outfit,sans-serif;color:#bdbdbd;max-width:280px')}>{T ? `Members are called ${T.v[0]}. Teams are called ${T.v[1]}. Cases, map and insights work the same for every type.` : 'Pick a type and we’ll set the right words, categories and teams.'}</span>
        </div>
      </aside>

      <main className="kd-flow-main">
        <div className="kd-flow-mobbar" style={s('width:100%;max-width:460px;align-items:center;gap:10px;margin-bottom:24px')}>
          <Link href="/" style={s('display:flex;align-items:center;gap:8px;color:var(--cp-ink);flex:1;text-decoration:none')}>
            <span style={s('width:34px;height:34px;border-radius:50%;background:var(--cp-ink);display:grid;place-items:center')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/koodal-mark.png" alt="Koodal" style={s('width:24px;height:24px;object-fit:contain;filter:invert(1)')} />
            </span>
            <span style={s('font:700 15px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
          </Link>
          <span style={s('font:600 12px/1 Outfit,sans-serif;color:var(--cp-ink-3)')}>{at < 4 ? `Step ${at + 1} of 4` : ''}</span>
        </div>

        <div style={s('width:100%;max-width:460px;display:flex;flex-direction:column;gap:22px;margin:auto 0')}>
          {BACK[screen] && (
            <button onClick={back} style={s('align-self:flex-start;display:flex;align-items:center;gap:6px;height:36px;padding:0 12px 0 8px;border:none;border-radius:999px;background:var(--cp-surface-2);color:var(--cp-ink-2);font:600 12.5px/1 Outfit,sans-serif;cursor:pointer')}><i className="ph-bold ph-arrow-left" />Back</button>
          )}

          {screen === 'account' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:22px')}>
              <div style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-title">Create your Koodal account</span><span className="kd-sub">You&apos;ll be the owner of the organization. One account works for every organization you join later.</span></div>
              {!otpSent ? (
                <>
                  <label style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-label">Your name</span><input className="kd-field" value={name} onChange={(e) => { setName(e.target.value); setErr(''); }} placeholder="e.g. R. Ganesan" /></label>
                  <label style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-label">Work email or phone</span><input className="kd-field" value={email} onChange={(e) => { setEmail(e.target.value); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && accNext()} placeholder="name@organization.org" /></label>
                </>
              ) : (
                <>
                  <span style={s('font:500 13.5px/1.45 Outfit,sans-serif;color:var(--cp-ink-2)')}>We sent a 6-digit code to <b style={{ color: 'var(--cp-ink)' }}>{email}</b>. Demo: any six digits.</span>
                  <input className="kd-field" value={otp} onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErr(''); }} onKeyDown={(e) => e.key === 'Enter' && accNext()} placeholder="000000" style={s('height:68px;border-radius:18px;font:600 30px/1 Outfit,sans-serif;letter-spacing:.5em;text-align:center')} />
                </>
              )}
              <Err />
              <button className="kd-primary" onClick={accNext}>{otpSent ? 'Verify & continue' : 'Send code'}<i className="ph-bold ph-arrow-right" /></button>
              <span style={s('align-self:center;font:500 13px/1.3 Outfit,sans-serif;color:var(--cp-ink-3)')}>Already on Koodal? <Link href="/console/sign-in" style={{ fontWeight: 600, color: 'var(--cp-pulse)' }}>Sign in</Link></span>
            </div>
          )}

          {screen === 'type' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:22px')}>
              <div style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-title">What kind of organization is it?</span><span className="kd-sub">We&apos;ll start you with the right words, categories and teams. You can change all of them later.</span></div>
              <div style={s('display:flex;flex-direction:column;gap:10px')}>
                {TYPES.map((t) => {
                  const on = type === t.k, r = radio(on);
                  return (
                    <button key={t.k} className="kd-option" onClick={() => { setType(t.k); setPlan(null); }} style={{ ...s('display:flex;align-items:center;gap:14px;padding:12px 16px 12px 12px;border-radius:20px'), border: `1.5px solid ${r.bd}`, background: r.rbg }}>
                      <span style={{ ...s('width:44px;height:44px;flex:none;border-radius:12px;display:grid;place-items:center;font-size:20px'), background: t.bg, color: t.fg }}><i className={`ph-bold ${t.icon}`} /></span>
                      <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}><span style={s('font:600 15px/1.2 Outfit,sans-serif')}>{t.l}</span><span style={s('font:500 12.5px/1.35 Outfit,sans-serif;color:var(--cp-ink-3)')}>{t.ex}</span></span>
                      <Radio on={on} />
                    </button>
                  );
                })}
              </div>
              <button className="kd-primary" disabled={!type} onClick={() => type && go('details')}>Continue<i className="ph-bold ph-arrow-right" /></button>
            </div>
          )}

          {screen === 'details' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:22px')}>
              <div style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-title">Tell us about it</span><span className="kd-sub">This is what your members will see when they join.</span></div>
              <label style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-label">Organization name</span><input className="kd-field" value={org} onChange={(e) => { setOrg(e.target.value); setErr(''); if (!slugEdited) setSlug(slugify(e.target.value)); }} placeholder={T ? T.ph : 'Organization name'} /></label>
              <label style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-label">City</span><input className="kd-field" value={city} onChange={(e) => { setCity(e.target.value); setErr(''); }} placeholder="e.g. Chennai" /></label>
              <label style={s('display:flex;flex-direction:column;gap:8px')}>
                <span className="kd-label">Koodal address</span>
                <span style={s('display:flex;align-items:center;height:54px;padding:0 6px 0 18px;border-radius:16px;border:1.5px solid var(--cp-line);background:var(--cp-surface-2);box-sizing:border-box')}>
                  <span style={s('font:600 15px/1 Outfit,sans-serif;color:var(--cp-ink-3)')}>koodal.app/</span>
                  <input value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugEdited(true); setErr(''); }} placeholder="your-org" style={s('flex:1;min-width:0;height:100%;padding:0;border:none;background:transparent;color:var(--cp-ink);font:600 15px/1 Outfit,sans-serif;outline:none')} />
                  {slug.length >= 3 && <span style={s('display:flex;align-items:center;gap:5px;height:30px;padding:0 10px;border-radius:999px;background:var(--cp-leaf-soft);color:var(--cp-leaf);font:600 11.5px/1 Outfit,sans-serif;flex:none')}><i className="ph-bold ph-check" />Available</span>}
                </span>
                <span style={s('font:500 12px/1.35 Outfit,sans-serif;color:var(--cp-ink-3)')}>Members join from this link.</span>
              </label>
              <div style={s('display:flex;flex-direction:column;gap:8px')}>
                <span className="kd-label">{type === 'gov' ? 'Population served' : `How many ${vocab0}?`}</span>
                <div style={s('display:flex;gap:4px;padding:4px;border-radius:999px;background:var(--cp-surface-2)')}>
                  {SIZES.map(([k, l]) => (
                    <button key={k} onClick={() => { setSize(k); setPlan(null); setErr(''); }} style={{ ...s('flex:1;height:40px;border-radius:999px;border:none;font:600 13px/1 Outfit,sans-serif;cursor:pointer;white-space:nowrap'), ...seg(size === k) }}>{type === 'gov' ? GOV_SIZES[k] : l}</button>
                  ))}
                </div>
              </div>
              <Err />
              <button className="kd-primary" onClick={detNext}>Continue<i className="ph-bold ph-arrow-right" /></button>
            </div>
          )}

          {screen === 'plan' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:22px')}>
              <div style={s('display:flex;flex-direction:column;gap:8px')}><span className="kd-title">Choose a plan</span><span className="kd-sub">We recommend {PLANS.find((p) => p.k === rec)?.l} for {orgName}. You can change plans at any time.</span></div>
              <Cycles />
              <div style={s('display:flex;flex-direction:column;gap:10px')}>
                {PLANS.map((p) => {
                  const on = P.k === p.k, r = radio(on);
                  return (
                    <button key={p.k} className="kd-option" onClick={() => setPlan(p.k)} style={{ ...s('display:flex;align-items:flex-start;gap:14px;padding:16px;border-radius:20px'), border: `1.5px solid ${r.bd}`, background: r.rbg }}>
                      <span style={s('margin-top:1px;flex:none')}><Radio on={on} /></span>
                      <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:5px')}>
                        <span style={s('display:flex;align-items:center;gap:8px;flex-wrap:wrap;font:600 15px/1.2 Outfit,sans-serif')}>{p.l}{p.k === rec && <span style={s('height:20px;padding:0 8px;border-radius:999px;background:var(--cp-marigold);color:#0f0f0f;font:600 10.5px/20px Outfit,sans-serif')}>Recommended</span>}</span>
                        <span style={s('font:500 12.5px/1.35 Outfit,sans-serif;color:var(--cp-ink-3)')}>{p.lim}</span>
                      </span>
                      <span style={s('flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:4px')}>
                        <span style={s("font:400 20px/1 'DM Serif Display',serif")}>{planPrice(p, cycle)}</span>
                        <span style={s('font:500 11.5px/1 Outfit,sans-serif;color:var(--cp-ink-3);white-space:nowrap')}>{planPer(p, cycle)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div style={s('display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:16px;background:var(--cp-surface-2)')}>
                <span style={s('display:flex;gap:10px;align-items:flex-start;font:500 13px/1.45 Outfit,sans-serif')}><i className="ph-bold ph-gift" style={s('font-size:17px;color:var(--cp-pulse);flex:none;margin-top:1px')} /><span style={s('flex:1;min-width:0')}><b>{TRIAL_DAYS} days free, no card needed.</b> {P.m == null ? 'After the trial, you pay a custom yearly price agreed with our team.' : `After that, ${planPrice(P, cycle)} ${planPer(P, cycle)}. We’ll remind you 3 days before it ends.`}</span></span>
                {P.k === 'civic' && <span style={s('display:flex;gap:10px;align-items:flex-start;font:500 13px/1.45 Outfit,sans-serif;color:var(--cp-ink-2)')}><i className="ph-bold ph-phone" style={s('font-size:17px;color:var(--cp-peacock);flex:none;margin-top:1px')} /><span style={s('flex:1;min-width:0')}>Our team will call within a day to set up SSO, public joining and your quote. You can start using Koodal right away.</span></span>}
              </div>
              <button className="kd-primary" onClick={create}>Start free trial<i className="ph-bold ph-arrow-right" /></button>
              <span style={s('align-self:center;text-align:center;font:500 12px/1.4 Outfit,sans-serif;color:var(--cp-ink-3)')}>By continuing you agree to the Koodal terms and data processing agreement.</span>
            </div>
          )}

          {screen === 'creating' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:24px;align-items:flex-start')}>
              <span style={s('width:52px;height:52px;border-radius:50%;border:3px solid var(--cp-line);border-top-color:var(--cp-pulse);box-sizing:border-box;animation:cp-spin .8s linear infinite')} />
              <span className="kd-title">Setting up {orgName}</span>
              <div style={s('display:flex;flex-direction:column;gap:12px')}>
                {buildSteps.map((l, k) => {
                  const done = k < bi, cur = k === bi;
                  return (
                    <span key={l} style={{ ...s('display:flex;align-items:center;gap:10px;font:500 14px/1.3 Outfit,sans-serif'), color: done || cur ? 'var(--cp-ink)' : 'var(--cp-ink-3)' }}>
                      <i className={done ? 'ph-fill ph-check-circle' : cur ? 'ph-bold ph-circle-notch' : 'ph-bold ph-circle'} style={{ fontSize: 17, color: done ? 'var(--cp-leaf)' : cur ? 'var(--cp-pulse)' : 'var(--cp-line)' }} />{l}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {screen === 'done' && (
            <div className="kd-in" style={s('display:flex;flex-direction:column;gap:22px')}>
              <span style={{ ...s('width:64px;height:64px;border-radius:18px;font:700 22px/64px Outfit,sans-serif;text-align:center;animation:kd-badge .5s cubic-bezier(.3,1.6,.5,1) both'), background: pv.bg, color: pv.fg }}>{pv.ini}</span>
              <div style={s('display:flex;flex-direction:column;gap:8px')}>
                <span className="kd-title" style={{ textWrap: 'balance' }}>{orgName} is ready.</span>
                <span className="kd-sub">Your {TRIAL_DAYS}-day trial of {P.l} has started. Three things to do before you invite {vocab0}:</span>
              </div>
              <div style={s('display:flex;flex-direction:column;border-radius:20px;border:1px solid var(--cp-line);overflow:hidden')}>
                {nextSteps.map(([icon, l, sub], k) => (
                  <div key={l} style={{ ...s('display:flex;align-items:center;gap:14px;padding:14px 16px'), borderTop: k ? '1px solid var(--cp-line)' : 'none' }}>
                    <span style={s('width:36px;height:36px;flex:none;border-radius:50%;background:var(--cp-surface-2);display:grid;place-items:center;font-size:17px')}><i className={`ph-bold ${icon}`} /></span>
                    <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}><span style={s('font:600 14px/1.2 Outfit,sans-serif')}>{l}</span><span style={s('font:500 12.5px/1.35 Outfit,sans-serif;color:var(--cp-ink-3)')}>{sub}</span></span>
                  </div>
                ))}
              </div>
              <Link href="/console/sign-in" className="kd-primary">Open Koodal Console<i className="ph-bold ph-arrow-right" /></Link>
              <button onClick={() => { try { navigator.clipboard.writeText('https://koodal.app/' + slug); } catch { /* clipboard blocked */ } showToast('Join link copied'); }} style={s('height:48px;border-radius:999px;background:linear-gradient(180deg,var(--cp-surface),var(--cp-surface-2));border:1px solid var(--cp-line);box-shadow:0 2px 0 var(--cp-edge);color:var(--cp-ink);font:600 14px/1 Outfit,sans-serif;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px')}><i className="ph-bold ph-link-simple" />Copy join link · koodal.app/{slug}</button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
