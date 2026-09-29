import Link from 'next/link';
import { s } from './s';
import { Reveal } from './Reveal';

const DESTINATIONS = [
  {
    href: '/nearby',
    icon: 'ph-bold ph-user',
    bg: '#fff4ec',
    fg: '#c2410c',
    title: 'Koodal App',
    sub: 'The member/citizen flow: report an issue, support and verify nearby reports, follow a case to resolution.',
    cta: 'Open Koodal App',
  },
  {
    href: '/get-started',
    icon: 'ph-bold ph-identification-badge',
    bg: '#eaf7f5',
    fg: '#0f8b83',
    title: 'Koodal Console',
    sub: 'The staff/admin flow: create your organization, then review incoming cases, assign work and post proof once an issue is fixed.',
    cta: 'Open Koodal Console',
  },
] as const;

export function TryIt() {
  return (
    <Reveal id="demo" className="kd-sec" style={s('max-width:1120px;padding:60px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#0f8b83')} />For judges</span>
      <h2 className="kd-h2">Try it yourself.</h2>
      <p className="kd-lede">No sign-up needed to look around — jump straight into either side of the loop, or read the full story first.</p>
      <div className="kd-bento" style={s('margin-top:30px')}>
        {DESTINATIONS.map((d) => (
          <Link key={d.href} href={d.href} className="kd-card" style={s('padding:28px;display:flex;flex-direction:column;gap:14px;text-decoration:none;color:inherit')}>
            <span className="kd-typeicon" style={{ ...s('width:48px;height:48px;border-radius:14px;display:grid;place-items:center;font-size:22px'), background: d.bg, color: d.fg }}><i className={d.icon} /></span>
            <span style={s('font:600 19px/1.2 Outfit,sans-serif')}>{d.title}</span>
            <span style={s('font:400 14.5px/1.5 Outfit,sans-serif;color:#6b6b6b')}>{d.sub}</span>
            <span style={{ ...s('display:flex;align-items:center;gap:8px;margin-top:auto;font:600 14px/1 Outfit,sans-serif'), color: d.fg }}>
              {d.cta}<i className="ph-bold ph-arrow-right" />
            </span>
          </Link>
        ))}
        <Link href="/pitch" className="kd-card" style={{ ...s('padding:28px;display:flex;align-items:center;gap:20px;text-decoration:none;color:inherit'), gridColumn: '1 / -1' }}>
          <span style={s('width:48px;height:48px;flex:none;border-radius:14px;display:grid;place-items:center;font-size:22px;background:#f6f4fe;color:#6b5bd6')}><i className="ph-bold ph-presentation-chart" /></span>
          <span style={s('flex:1;min-width:0;display:flex;flex-direction:column;gap:4px')}>
            <span style={s('font:600 19px/1.2 Outfit,sans-serif')}>Pitch deck</span>
            <span style={s('font:400 14.5px/1.5 Outfit,sans-serif;color:#6b6b6b')}>The Koodal story: problem, product and roadmap, viewable in the browser or as a PDF download.</span>
          </span>
          <span style={s('flex:none;display:flex;align-items:center;gap:8px;font:600 14px/1 Outfit,sans-serif;color:#6b5bd6')}>
            View deck<i className="ph-bold ph-arrow-right" />
          </span>
        </Link>
      </div>
    </Reveal>
  );
}
