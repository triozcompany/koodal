import Link from 'next/link';
import { s } from './s';
import { Reveal } from './Reveal';

const CARDS: { k: string; l: string; icon: string; bg: string; fg: string; shot: string; alt: string; topics: [string, string][] }[] = [
  { k: 'citizens', l: 'For citizens', icon: 'ph-user', bg: '#f5b30a', fg: '#0f0f0f', shot: '/guide/01-new-form.jpg', alt: 'Reporting an issue in the Koodal app',
    topics: [['Create your account', 'citizens'], ['Report an issue', 'citizens'], ['Support and join issues', 'citizens'], ['Confirm a fix', 'citizens']] },
  { k: 'staff', l: 'For department staff', icon: 'ph-identification-badge', bg: '#0f8b83', fg: '#fff', shot: '/guide/06-s5-console-start.jpg', alt: 'A case in the Koodal Console',
    topics: [['Decide on new cases', 'staff'], ['Start work and mark fixed', 'staff'], ['Read your analytics', 'analytics']] },
  { k: 'admins', l: 'For admins', icon: 'ph-sliders-horizontal', bg: '#0f0f0f', fg: '#fff', shot: '/guide/00-settings-thresholds.jpg', alt: 'Thresholds in Console settings',
    topics: [['Set case thresholds', 'admins'], ['Test mode and demo data', 'admins'], ['Demo accounts', 'demo']] },
];

export function GuideSection() {
  return (
    <Reveal id="guide" className="kd-sec" style={s('max-width:1120px;padding:120px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />Guide</span>
      <h2 className="kd-h2">Learn Koodal in <span className="kd-hi">minutes</span></h2>
      <p className="kd-lede">Step-by-step help with real screenshots, for everyone who uses Koodal: the people who report, the teams who fix, and the admins who set the rules.</p>
      <div className="kd-guide-cards">
        {CARDS.map((c) => (
          <div key={c.k} className="kd-card" style={s('display:flex;flex-direction:column;overflow:hidden')}>
            <Link href={`/guide#${c.k}`} aria-label={`${c.l} guide`} style={s('display:block;height:180px;overflow:hidden;background:#f7f2ec;border-bottom:1px solid #f0ebe5')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.shot} alt={c.alt} loading="lazy" style={s('display:block;width:100%;height:100%;object-fit:cover;object-position:top')} />
            </Link>
            <div style={s('padding:22px 24px 24px;display:flex;flex-direction:column;gap:14px;flex:1')}>
              <span style={s('display:flex;align-items:center;gap:12px')}>
                <span className="kd-typeicon" style={{ ...s('width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:19px;flex:none'), background: c.bg, color: c.fg }}><i className={`ph-bold ${c.icon}`} /></span>
                <span style={s('font:600 19px/1.2 Outfit,sans-serif')}>{c.l}</span>
              </span>
              <div className="kd-guide-topics">
                {c.topics.map(([t, id]) => <Link key={t} href={`/guide#${id}`}>{t}<i className="ph-bold ph-arrow-right" /></Link>)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <Link href="/guide" className="kd-btn" style={s('align-self:center;margin-top:18px')}>Open the guide<i className="ph-bold ph-arrow-right" /></Link>
    </Reveal>
  );
}
