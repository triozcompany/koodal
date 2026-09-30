import Link from 'next/link';
import { s } from './s';

const GROUPS: [string, [string, string][]][] = [
  ['Product', [['Koodal app', '/nearby'], ['Koodal Console', '/console/sign-in'], ['Join an organization', '/nearby'], ['Pricing', '/#pricing']]],
  ['Platform', [['How it works', '/#product'], ['Platform guide', '/guide'], ['Get started', '/console/get-started']]],
  ['Company', [['Pitch deck', '/pitch'], ['Contact us', 'mailto:hello@koodal.app'], ['Privacy & terms', '#']]],
];

export function Footer() {
  return (
    <footer className="kd-foot" style={s('max-width:1120px;margin:0 auto;padding:80px 20px 36px;box-sizing:border-box;display:flex;flex-direction:column;gap:44px')}>
      <div className="kd-foot-grid">
        <div style={s('display:flex;flex-direction:column;gap:16px')}>
          <div style={s('display:flex;align-items:center;gap:10px')}>
            <span style={s('width:36px;height:36px;border-radius:50%;background:#0f0f0f;display:grid;place-items:center')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/koodal-mark.png" alt="Koodal" style={s('width:25px;height:25px;object-fit:contain;filter:invert(1)')} />
            </span>
            <span style={s('font:700 17px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
          </div>
          <p style={s('margin:0;max-width:300px;font:400 14px/1.6 Outfit,sans-serif;color:#6b6b6b')}>கூடல் · where communities come together. One open loop for every city, apartment, campus and institution.</p>
        </div>
        {GROUPS.map(([t, items]) => (
          <div key={t} style={s('display:flex;flex-direction:column;gap:12px')}>
            <span style={s('font:600 12px/1 Outfit,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8a8a8a;margin-bottom:4px')}>{t}</span>
            {items.map(([l, href]) => (href.startsWith('mailto:') || href === '#'
              ? <a key={l} href={href}>{l}</a>
              : <Link key={l} href={href}>{l}</Link>))}
          </div>
        ))}
      </div>
      <div style={s('display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding-top:24px;border-top:1px solid #ece5dd;font:500 13px/1.4 Outfit,sans-serif;color:#8a8a8a')}>
        <span style={s('flex:1 1 260px;display:flex;align-items:center;gap:6px;flex-wrap:wrap')}>Developed with <i className="ph-fill ph-heart" style={s('color:#e8590c;font-size:15px;animation:kd-beat 1.4s ease-in-out infinite')} /> by <b style={{ color: '#0f0f0f' }}>TRIOZ</b></span>
        <span>© 2026 Koodal · Made in Tamil Nadu</span>
      </div>
    </footer>
  );
}
