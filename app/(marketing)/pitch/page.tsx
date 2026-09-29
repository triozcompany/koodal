import type { Metadata } from 'next';
import Link from 'next/link';
import { s } from '../_components/s';
import { Footer } from '../_components/Footer';

export const metadata: Metadata = {
  title: 'Koodal · Pitch Deck',
  description: 'Koodal Platform pitch deck: view online or download the PDF.',
};

const DECK = '/docs/Koodal_Platform_Pitch_Deck.pdf';

export default function PitchPage() {
  return (
    <div className="kd-root" data-cp-theme="light">
      <header style={s('position:sticky;top:14px;z-index:60;padding:0 16px;margin-top:14px')}>
        <div style={s('max-width:1120px;margin:0 auto;display:flex;align-items:center;gap:14px;height:64px;padding:0 10px 0 18px;box-sizing:border-box;border-radius:20px;background:rgb(255 255 255 / .82);border:1px solid #efe7df;box-shadow:0 16px 40px -24px rgb(0 0 0 / .3);backdrop-filter:blur(16px) saturate(160%);-webkit-backdrop-filter:blur(16px) saturate(160%)')}>
          <Link href="/" style={s('display:flex;align-items:center;gap:10px;flex:1;min-width:0;color:#0f0f0f;text-decoration:none')}>
            <span style={s('width:34px;height:34px;border-radius:50%;background:#0f0f0f;display:grid;place-items:center;flex:none')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/koodal-mark.png" alt="Koodal" style={s('width:24px;height:24px;object-fit:contain;filter:invert(1)')} />
            </span>
            <span style={s('font:700 16px/1 Outfit,sans-serif;letter-spacing:.06em')}>KOODAL</span>
          </Link>
          <Link href="/" className="kd-navlink"><i className="ph-bold ph-arrow-left" style={{ marginRight: 6 }} />Back to home</Link>
          <a href={DECK} download className="kd-btn nav"><span className="kd-desk-only">Download PDF</span><span className="kd-mob-only">PDF</span><i className="ph-bold ph-download-simple" /></a>
        </div>
      </header>

      <section style={s('padding:0 16px;margin-top:-78px')}>
        <div className="kd-hero-in" style={s('position:relative;max-width:1400px;margin:0 auto;border-radius:0 0 40px 40px;overflow:hidden;background:radial-gradient(120% 70% at 50% 110%,#f08a4b 0%,#f6b489 38%,#fbe3d2 62%,#fbf9f5 84%);box-sizing:border-box;padding-bottom:70px')}>
          <div style={s('position:absolute;left:50%;bottom:-62%;width:1100px;height:1100px;margin-left:-550px;border-radius:50%;border:1px solid rgb(255 255 255 / .55);pointer-events:none')} />
          <div style={s('position:relative;display:flex;flex-direction:column;align-items:center;gap:22px;text-align:center;animation:kd-up .9s cubic-bezier(.2,.9,.25,1) both')}>
            <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />Pitch deck · 20 slides</span>
            <h1 className="kd-h1" style={{ fontSize: 'clamp(38px,6vw,64px)' }}>One platform where any community <span className="kd-hi">reports</span>, <span className="kd-hi">verifies</span> and <span className="kd-hi">resolves</span> its issues.</h1>
            <p style={s('margin:0;max-width:560px;font:400 18px/1.6 Outfit,sans-serif;color:#4d4d4d;text-wrap:pretty')}>Read the Koodal story here, or take the PDF with you.</p>
            <div style={s('display:flex;gap:10px;flex-wrap:wrap;justify-content:center')}>
              <a href={DECK} download className="kd-btn"><i className="ph-bold ph-download-simple" />Download PDF</a>
              <Link href="/" className="kd-btn light"><i className="ph-bold ph-house" style={{ color: '#e8590c' }} />Back to home</Link>
            </div>
          </div>
        </div>
      </section>

      <section style={s('max-width:1120px;margin:0 auto;padding:60px 20px 0;box-sizing:border-box')}>
        <div className="kd-card kd-pitch-viewer" style={s('padding:14px;transform:none')}>
          <object className="kd-pitch-frame" data={`${DECK}#toolbar=0&view=FitH`} type="application/pdf" aria-label="Koodal pitch deck">
            <div style={s('padding:48px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px')}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/koodal-mark.png" alt="" style={s('width:72px;height:72px;object-fit:contain')} />
              <span style={s('font:500 15px/1.5 Outfit,sans-serif;color:#5b5b5b')}>Best viewed as a PDF on your phone.</span>
              <div style={s('display:flex;gap:10px;flex-wrap:wrap;justify-content:center')}>
                <a href={DECK} target="_blank" rel="noreferrer" className="kd-btn"><i className="ph-bold ph-arrow-square-out" />Open deck</a>
                <a href={DECK} download className="kd-btn light"><i className="ph-bold ph-download-simple" />Download</a>
              </div>
            </div>
          </object>
        </div>
      </section>

      <Footer />
    </div>
  );
}
