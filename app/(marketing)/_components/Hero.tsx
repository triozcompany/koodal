'use client';
import Link from 'next/link';
import { s } from './s';
import { TRIAL_DAYS } from './data';
import { useInstall } from '@/components/pwa/PwaProvider';
import { scrollToSection } from './Navbar';

export function Hero() {
  const { showInstall, promptInstall } = useInstall();
  return (
    <section style={s('padding:0 16px;margin-top:-78px')}>
      <div className="kd-hero-in" style={s('position:relative;max-width:1400px;margin:0 auto;border-radius:0 0 40px 40px;overflow:hidden;background:radial-gradient(120% 70% at 50% 110%,#f08a4b 0%,#f6b489 38%,#fbe3d2 62%,#fbf9f5 84%);box-sizing:border-box')}>
        <div style={s('position:absolute;left:50%;bottom:-62%;width:1100px;height:1100px;margin-left:-550px;border-radius:50%;border:1px solid rgb(255 255 255 / .55);pointer-events:none')} />
        <div style={s('position:absolute;left:50%;bottom:-78%;width:1500px;height:1500px;margin-left:-750px;border-radius:50%;border:1px solid rgb(255 255 255 / .35);pointer-events:none')} />
        <div style={s('position:relative;display:flex;flex-direction:column;align-items:center;gap:24px;text-align:center;animation:kd-up .9s cubic-bezier(.2,.9,.25,1) both')}>
          <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />For cities, apartments, campuses and institutions</span>
          <h1 className="kd-h1">Every issue <span className="kd-hi">reported</span>, <span className="kd-hi">resolved</span> and confirmed by your community.</h1>
          <p style={s('margin:0;max-width:620px;font:400 18px/1.6 Outfit,sans-serif;color:#4d4d4d;text-wrap:pretty')}>Koodal gives your organization one open loop: members report and verify, your team fixes, and members confirm it&apos;s done.</p>
          <div style={s('display:flex;gap:10px;flex-wrap:wrap;justify-content:center')}>
            <Link href="/pitch" className="kd-btn">See pitch<i className="ph-bold ph-arrow-right" /></Link>
            <Link href="/guide" className="kd-btn light"><i className="ph-fill ph-book-open-text" style={s('color:#e8590c;font-size:18px')} />See guide</Link>
            <button className="kd-btn light" onClick={() => scrollToSection('video')}><i className="ph-fill ph-play-circle" style={s('color:#e8590c;font-size:18px')} />Watch video</button>
          </div>
          <span style={s('font:500 13px/1 Outfit,sans-serif;color:#6b5a4c')}>{TRIAL_DAYS}-day free trial · No card needed · 12 Indian languages</span>
          {showInstall && (
            <button className="kd-navlink" onClick={promptInstall} style={s('height:36px;border:1px solid #eadfd4;background:#fff')}><i className="ph-bold ph-download-simple" style={{ marginRight: 6, color: '#e8590c' }} />Install the app</button>
          )}
        </div>

        <div className="kd-hero-shots">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="kd-console" src="/shots/01-console.png" alt="Koodal Console dashboard" />
          <div className="kd-phone">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/shots/m-home.png" alt="Koodal app on a phone" style={s('display:block;width:100%;border-radius:34px')} />
          </div>
          <div className="kd-herochip kd-herochip-a">
            <span style={s('width:34px;height:34px;border-radius:10px;background:#e8f7ee;color:#12a150;display:grid;place-items:center;font-size:18px')}><i className="ph-fill ph-seal-check" /></span>
            <span style={s('display:flex;flex-direction:column;gap:4px;text-align:left')}>
              <span style={s('font:600 13px/1 Outfit,sans-serif')}>Fixed · 25 of 25 confirmed</span>
              <span style={s('font:500 11.5px/1 Outfit,sans-serif;color:#8a8a8a')}>Closed by residents</span>
            </span>
          </div>
          <div className="kd-herochip kd-herochip-b">
            <span style={s('width:34px;height:34px;border-radius:10px;background:#f6f4fe;color:#6b5bd6;display:grid;place-items:center;font-size:18px')}><i className="ph-fill ph-sparkle" /></span>
            <span style={s('display:flex;flex-direction:column;gap:4px;text-align:left')}>
              <span style={s('font:600 13px/1 Outfit,sans-serif')}>Voice note → report</span>
              <span style={s('font:500 11.5px/1 Outfit,sans-serif;color:#8a8a8a')}>Tamil · 96% sure it&apos;s sewage</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
