'use client';
import { useRef, useState } from 'react';
import { s } from './s';
import { Reveal } from './Reveal';

const SRC = '/videos/koodal-product.mp4';
const POSTER = '/videos/koodal-product-poster.jpg';

export function ProductVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  const play = () => { setStarted(true); ref.current?.play().catch(() => {}); };
  return (
    <Reveal id="video" className="kd-sec" style={s('max-width:1120px;padding:110px 20px 20px')}>
      <span className="kd-chip"><span style={s('width:8px;height:8px;border-radius:50%;background:#e8590c')} />Watch</span>
      <h2 className="kd-h2">See Koodal in <span className="kd-hi">24 seconds</span></h2>
      <p className="kd-lede">Report, verify, resolve: one open loop from the first photo to the community’s confirmation.</p>
      <div className="kd-card kd-video">
        {/* Native controls take over once playing; the poster button only starts it. */}
        <video ref={ref} src={SRC} poster={POSTER} preload="metadata" playsInline controls={started} onPlay={() => setStarted(true)} aria-label="Koodal product video" />
        {!started && (
          <button className="kd-video-play" onClick={play} aria-label="Play the Koodal product video">
            <span><i className="ph-fill ph-play" />Play video · 0:24</span>
          </button>
        )}
      </div>
    </Reveal>
  );
}
