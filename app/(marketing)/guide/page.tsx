import type { Metadata } from 'next';
import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import { s } from '../_components/s';
import { Footer } from '../_components/Footer';
import { SECTIONS, CITIZENS, STAFF, SCENARIOS, type Shot } from './content';
import { GuideToc, GuideLightbox } from './GuideClient';

export const metadata: Metadata = {
  title: 'Koodal · Platform guide',
  description: 'How to use Koodal: sign in, report and support issues, work cases in the Console, read analytics and set thresholds.',
};

// **bold** and `code` only; the content file never needs more.
function rich(t: string): ReactNode {
  return t.split(/(\*\*[^*]+\*\*|`[^`]+`)/).map((part, i) =>
    part.startsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code>
        : <Fragment key={i}>{part}</Fragment>);
}

function Shots({ shots }: { shots: Shot[] }) {
  return (
    <div className="kd-guide-shots">
      {shots.map((sh) => (
        <figure key={sh.src} className={`kd-guide-shot ${sh.kind}`}>
          <button type="button" data-zoom={sh.src} aria-label={`Enlarge: ${sh.alt}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sh.src} alt={sh.alt} loading="lazy" width={sh.kind === 'phone' ? 520 : 1200} height={sh.kind === 'phone' ? 1125 : 750} />
          </button>
          <figcaption>{sh.alt}</figcaption>
        </figure>
      ))}
    </div>
  );
}

function Table({ head, rows, codeCol = 1 }: { head: string[]; rows: [string, string, string][]; codeCol?: number }) {
  return (
    <div className="kd-guide-tbl">
      <table>
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r) => <tr key={r[0] + r[1]}>{r.map((c, i) => <td key={i}>{i === codeCol ? <code>{c}</code> : c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

const TOC = [...SECTIONS.map(({ id, nav }) => ({ id, nav })), { id: 'demo', nav: 'Demo accounts' }];

export default function GuidePage() {
  return (
    <div className="kd-root" data-cp-theme="light">
      <header style={s('position:sticky;top:14px;z-index:60;padding:0 16px;margin-top:14px')}>
        <div style={s('max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:10px;height:64px;padding:0 10px 0 18px;box-sizing:border-box;border-radius:20px;background:rgb(255 255 255 / .82);border:1px solid #efe7df;box-shadow:0 16px 40px -24px rgb(0 0 0 / .3);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%)')}>
          <Link href="/" style={s('display:flex;align-items:center;gap:10px;flex:1;min-width:0;color:#0f0f0f;text-decoration:none')}>
            <span style={s('width:34px;height:34px;border-radius:50%;background:#0f0f0f;display:grid;place-items:center;flex:none')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/koodal-mark.png" alt="Koodal" style={s('width:24px;height:24px;object-fit:contain;filter:invert(1)')} />
            </span>
            <span style={s('font:700 16px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
            <span className="kd-desk-only" style={s('font:600 13.5px/1 Outfit,sans-serif;color:#8a8a8a;padding-left:10px;border-left:1px solid #e9e1d8')}>Guide</span>
          </Link>
          <Link href="/" className="kd-navlink kd-desk-only"><i className="ph-bold ph-arrow-left" style={{ marginRight: 6 }} />Back to home</Link>
          <Link href="/nearby" className="kd-btn nav light"><i className="ph-bold ph-user" /><span className="kd-desk-only">Koodal App</span><span className="kd-mob-only">App</span></Link>
          <Link href="/console/sign-in" className="kd-btn nav"><i className="ph-bold ph-identification-badge" /><span className="kd-desk-only">Koodal Console</span><span className="kd-mob-only">Console</span></Link>
        </div>
      </header>

      <div className="kd-guide-hero">
        <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />Platform guide</span>
        <h1 className="kd-h2">Everything you need to use <span className="kd-hi">Koodal</span></h1>
        <p className="kd-lede">Step-by-step help for citizens, department staff and admins. In every screenshot, the <span className="kd-guide-mark" aria-hidden="true">1</span> red numbered boxes show what to tap, in order. Tap a screenshot to enlarge it.</p>
      </div>

      <div className="kd-guide">
        <GuideToc items={TOC} />
        <main className="kd-guide-main">
          {SECTIONS.map((sec) => (
            <section key={sec.id} id={sec.id} className="kd-guide-sec">
              <span className="kd-guide-eyebrow">{sec.eyebrow}</span>
              <h2>{sec.title}</h2>
              <p className="kd-guide-lede">{rich(sec.lede)}</p>
              {sec.groups.map((g, gi) => (
                <div key={gi} className="kd-guide-group">
                  {g.title && <h3>{g.title}</h3>}
                  {g.intro && <p>{rich(g.intro)}</p>}
                  {g.steps && (
                    <ol className="kd-guide-steps">
                      {g.steps.map((st, si) => (
                        <li key={si}>
                          <p>{rich(st.text)}</p>
                          {st.shots && <Shots shots={st.shots} />}
                        </li>
                      ))}
                    </ol>
                  )}
                  {g.shots && <Shots shots={g.shots} />}
                  {g.note && <p className="kd-guide-note"><i className="ph-bold ph-info" />{rich(g.note)}</p>}
                </div>
              ))}
            </section>
          ))}

          <section id="demo" className="kd-guide-sec">
            <span className="kd-guide-eyebrow">Try it</span>
            <h2>Demo accounts</h2>
            <p className="kd-guide-lede">While an admin has <strong>test mode</strong> on, both sign-in pages list these accounts: tap one to sign in. The code fills itself in, and the Aadhaar step offers <strong>Use demo Aadhaar</strong>. Console password: <code>koodal-demo</code>, code <code>123456</code>.</p>
            <div className="kd-guide-group">
              <h3>Koodal app</h3>
              <Table head={['Citizen', 'Phone', 'Use it for']} rows={CITIZENS} />
            </div>
            <div className="kd-guide-group">
              <h3>Koodal Console</h3>
              <Table head={['Staff', 'Employee ID', 'Access']} rows={STAFF} />
            </div>
            <div className="kd-guide-group">
              <h3>Sample issues to explore</h3>
              <p>Seeded in Chennai with the default thresholds. Open one at <code>/issues/&lt;ID&gt;</code>.</p>
              <Table head={['ID', 'Issue', 'What it shows']} rows={SCENARIOS} codeCol={0} />
            </div>
          </section>
        </main>
      </div>
      <GuideLightbox />
      <Footer />
    </div>
  );
}
