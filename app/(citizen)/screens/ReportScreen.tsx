'use client';
import { useState, useRef, useCallback } from 'react';
import { ME } from '@/lib/domain/constants';
import type { SceneKey } from '@/lib/domain/analyze';
import { IdSheet } from '../components/IdSheet';

const WAVE = [10, 18, 26, 14, 22, 28, 12, 20, 26, 16, 8, 22, 18, 26, 12, 20, 14, 24, 10, 18];

const SCENE_ICONS: Record<SceneKey, string> = {
  sewage: 'ph-drop',
  pothole: 'ph-road-horizon',
  garbage: 'ph-trash',
  light: 'ph-lightbulb',
};

const SCENE_LABELS: Record<SceneKey, string> = {
  sewage: 'Sewage overflow',
  pothole: 'Pothole',
  garbage: 'Garbage dump',
  light: 'Streetlight out',
};

const SCENE_STREETS: Record<SceneKey, string> = {
  sewage: '100 Feet Rd, Vijayanagar',
  pothole: 'Taramani Link Rd',
  garbage: 'Velachery Main Rd',
  light: 'Balaji Nagar 2nd St',
};

const SHOTS: { icon: string }[] = [
  { icon: 'ph-image-square' },
];

interface Props {
  scene: SceneKey;
  anon: boolean;
  desc: string;
  tags: string[];
  meVerified: boolean;
  mob: boolean;
  onClose: () => void;
  onScene: (s: SceneKey) => void;
  onAnon: (a: boolean) => void;
  onDesc: (d: string) => void;
  onTags: (t: string[]) => void;
  onSlideSubmit: () => void;
  onVerified: () => void;
}

export function ReportScreen({
  scene, anon, desc, tags, meVerified, mob,
  onClose, onScene, onAnon, onDesc, onTags, onSlideSubmit, onVerified,
}: Props) {
  const [captured, setCaptured] = useState(false);
  const [flash, setFlash] = useState(false);
  const [shots, setShots] = useState<{ icon: string }[]>([]);
  const [descMode, setDescMode] = useState<'text' | 'voice'>('text');
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [tagDraft, setTagDraft] = useState('');
  const [idOpen, setIdOpen] = useState(false);
  const [idStep, setIdStep] = useState(0);
  const [otp, setOtp] = useState(0);

  // Slide-to-report
  const [slideX, setSlideX] = useState(0);
  const [sliding, setSliding] = useState(false);
  const slideStartX = useRef(0);
  const maxSlide = 220;

  const meInitials = ME.name.split(' ').map(s => s[0]).join('');
  const meFirst = ME.name.split(' ')[0];

  const doCapture = () => {
    setFlash(true);
    setTimeout(() => {
      setFlash(false);
      setCaptured(true);
      setShots([{ icon: SCENE_ICONS[scene] }]);
    }, 300);
  };

  const doRetake = () => {
    setCaptured(false);
    setShots([]);
  };

  const addTag = () => {
    const t = tagDraft.trim().replace(/^#/, '').replace(/\s+/g, '-');
    if (t && !tags.includes(t)) onTags([...tags, t]);
    setTagDraft('');
  };

  const removeTag = (t: string) => onTags(tags.filter(x => x !== t));

  const onTagKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag(); }
  };

  const voiceTap = () => {
    if (voiceState === 'idle') {
      setVoiceState('recording');
      setTimeout(() => setVoiceState('done'), 2200);
    } else if (voiceState === 'done') {
      setVoiceState('idle');
    }
  };

  const voiceTag = voiceState === 'idle' ? '' : voiceState === 'recording' ? 'Listening…' : 'Done';

  const openId = () => {
    setIdOpen(true);
    setIdStep(0);
    setOtp(0);
  };

  const idNext = () => {
    if (idStep === 0) {
      setIdStep(1);
      setOtp(0);
      [1, 2, 3, 4].forEach(k => setTimeout(() => setOtp(k), 300 + k * 220));
    } else if (idStep === 1 && otp >= 4) {
      setIdStep(2);
      onVerified();
      setTimeout(() => setIdOpen(false), 700);
    }
  };

  // Slide pointer events
  const onSlideDown = (e: React.PointerEvent) => {
    slideStartX.current = e.clientX - slideX;
    setSliding(true);
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onSlideMove = useCallback((e: React.PointerEvent) => {
    if (!sliding) return;
    const nx = Math.max(0, Math.min(maxSlide, e.clientX - slideStartX.current));
    setSlideX(nx);
  }, [sliding]);

  const onSlideUp = useCallback(() => {
    if (!sliding) return;
    setSliding(false);
    if (slideX >= maxSlide * 0.85) {
      setSlideX(maxSlide);
      setTimeout(() => onSlideSubmit(), 200);
    } else {
      setSlideX(0);
    }
  }, [sliding, slideX, onSlideSubmit]);

  const slideFillW = `${slideX + 64}px`;
  const slideTextO = Math.max(0, 1 - slideX / 160);
  const slideTrans = sliding ? 'none' : 'transform .4s cubic-bezier(.3,1.4,.5,1)';

  const camMode = mob && !captured;
  const uploadMode = !mob && !captured;
  const camH = !mob && !captured ? '0%' : (captured ? '30%' : '70%');
  const cPadX = mob ? '16px' : 'max(24px, calc((100% - 760px) / 2))';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0c0d10', color: '#fff', animation: 'cp-in .3s ease-out both' }}>

      {/* Camera area */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, minHeight: 200, height: camH, overflow: 'hidden', borderRadius: '0 0 26px 26px', background: 'repeating-linear-gradient(135deg,#1b1d22 0 10px,#16181c 10px 20px)', transition: 'height .45s cubic-bezier(.2,.9,.3,1.1)' }}>
        {/* Viewfinder (camera mode — mobile only) */}
        {camMode && (
          <>
            <div style={{ position: 'absolute', left: '50%', top: '50%', width: 220, height: 220, marginLeft: -110, marginTop: -110 }}>
              <div style={{ position: 'absolute', left: 0, top: 0, width: 34, height: 34, borderLeft: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '12px 0 0 0' }} />
              <div style={{ position: 'absolute', right: 0, top: 0, width: 34, height: 34, borderRight: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '0 12px 0 0' }} />
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: 34, height: 34, borderLeft: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 0 12px' }} />
              <div style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRight: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 12px 0' }} />
            </div>
            <div style={{ position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 7, height: 34, padding: '0 13px', borderRadius: 17, background: 'rgba(12,13,16,.72)', font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'oklch(0.8 0.155 75)' }} />
              Point at the issue
            </div>
          </>
        )}

        {/* After capture */}
        {captured && (
          <>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: 64, display: 'flex', alignItems: 'center', gap: 7, height: 32, padding: '0 12px', borderRadius: 16, background: 'rgba(12,13,16,.72)', font: '600 12.5px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
              <i className="ph-fill ph-sparkle" style={{ color: 'oklch(0.8 0.155 75)' }}></i>
              {SCENE_LABELS[scene]}
            </div>
            <button onClick={doRetake} style={{ whiteSpace: 'nowrap', position: 'absolute', right: 14, bottom: 12, height: 32, padding: '0 12px', borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.16)', color: '#fff', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center' }}>
              <i className="ph-bold ph-arrow-counter-clockwise"></i>Retake all
            </button>
            <div style={{ position: 'absolute', left: 14, right: 128, bottom: 12, display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingTop: 7 }}>
              {shots.map((s, k) => (
                <div key={k} style={{ position: 'relative', flex: 'none', width: 56, height: 56, borderRadius: 12, background: 'repeating-linear-gradient(135deg,#2a2c33 0 6px,#1f2126 6px 12px)', border: '2px solid rgba(255,255,255,.85)', display: 'grid', placeItems: 'center', color: '#c9cbd2', fontSize: 20, animation: 'cp-pop .35s cubic-bezier(.3,1.6,.5,1) both' }}>
                  <i className={`ph-bold ${s.icon}`}></i>
                  <button onClick={() => { const n = shots.length - 1; if (n === 0) { setCaptured(false); setShots([]); } else setShots(shots.filter((_, i) => i !== k)); }} title="Remove" style={{ position: 'absolute', right: -6, top: -6, width: 22, height: 22, borderRadius: '50%', border: '2px solid #0c0d10', background: '#fff', color: '#0c0d10', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 10 }}><i className="ph-bold ph-x"></i></button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Flash */}
        {flash && <div style={{ position: 'absolute', inset: 0, background: '#fff', animation: 'cp-flash .3s ease-out both' }} />}
      </div>

      {/* Top bar */}
      <div style={{ position: 'absolute', top: 14, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onClose} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
          <i className="ph-bold ph-x"></i>
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 11px', borderRadius: 15, background: 'rgba(255,255,255,.14)', font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
          <i className="ph-fill ph-navigation-arrow" style={{ color: 'oklch(0.8 0.155 75)' }}></i>
          GPS ±8 m
        </span>
        {mob ? (
          <button style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
            <i className="ph-bold ph-lightning"></i>
          </button>
        ) : (
          <span style={{ width: 42 }} />
        )}
      </div>

      {/* Upload zone (desktop, not captured) */}
      {uploadMode && (
        <div style={{ position: 'absolute', inset: '70px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, borderRadius: 24, border: '2px dashed #3a3c44', background: '#131418', textAlign: 'center', padding: 24 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', fontSize: 30 }}>
            <i className="ph-bold ph-upload-simple"></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ font: "400 23px/1.1 'DM Serif Display',serif" }}>Upload photos or a short video</span>
            <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: '#9a9ca6', maxWidth: 420 }}>Drag files here. Location is read from the photo, or you can set it next.</span>
          </div>
          <button onClick={doCapture} style={{ height: 48, padding: '0 22px', borderRadius: 999, border: 'none', background: '#fff', color: '#0c0d10', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform .12s' }}>
            Choose from computer
          </button>
        </div>
      )}

      {/* Camera controls (mobile, not captured) */}
      {camMode && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '30%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
          {/* Scene picker row */}
          <div style={{ display: 'flex', gap: 8 }}>
            {(Object.keys(SCENE_ICONS) as SceneKey[]).map(k => (
              <button
                key={k}
                onClick={() => onScene(k)}
                style={{
                  width: 54, height: 54, borderRadius: '50%',
                  border: `2px solid ${k === scene ? 'rgba(255,255,255,.7)' : '#2a2c33'}`,
                  background: k === scene
                    ? 'oklch(0.63 0.19 32 / .35)'
                    : 'repeating-linear-gradient(135deg,#23252b 0 6px,#1b1d22 6px 12px)',
                  display: 'grid', placeItems: 'center', color: k === scene ? 'oklch(0.8 0.155 75)' : '#9a9ca6',
                  cursor: 'pointer', fontSize: 19, transition: 'all .2s',
                }}
              >
                <i className={`ph-bold ${SCENE_ICONS[k]}`}></i>
              </button>
            ))}
          </div>
          {/* Capture row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 56 }}>
            <button style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', fontSize: 20, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <i className="ph-bold ph-images"></i>
            </button>
            <button onClick={doCapture} style={{ width: 80, height: 80, borderRadius: '50%', border: '5px solid #fff', background: 'transparent', padding: 5, cursor: 'pointer' }}>
              <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', background: 'oklch(0.63 0.19 32)' }} />
            </button>
            <button style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', fontSize: 20, display: 'grid', placeItems: 'center', cursor: 'pointer' }}>
              <i className="ph-bold ph-camera-rotate"></i>
            </button>
          </div>
        </div>
      )}

      {/* Form (after capture) */}
      {captured && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: `max(200px, ${camH})`, bottom: 0, overflowY: 'auto', padding: `14px ${cPadX} 112px`, display: 'flex', flexDirection: 'column', gap: 12, animation: 'cp-row .35s ease-out both', boxSizing: 'border-box' }}>

          {/* Location card */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
            <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: 'oklch(0.63 0.19 32)', display: 'grid', placeItems: 'center', fontSize: 19 }}>
              <i className="ph-fill ph-map-pin"></i>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ font: '600 13px/1.1 Outfit,sans-serif' }}>{SCENE_STREETS[scene]}</span>
              <span style={{ font: '500 11.5px/1 Outfit,sans-serif', color: '#8d8f99' }}>Velachery, Chennai 600042</span>
            </div>
          </div>

          {/* Describe */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ flex: 1, font: '600 12px/1 Outfit,sans-serif', color: '#b9bbc4' }}>Describe it</span>
              <div style={{ display: 'flex', gap: 3, padding: 3, borderRadius: 10, background: '#0c0d10' }}>
                <button onClick={() => setDescMode('text')} style={{ height: 28, padding: '0 11px', border: 'none', borderRadius: 999, background: descMode === 'text' ? 'rgba(255,255,255,.18)' : 'transparent', color: '#fff', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <i className="ph-bold ph-text-aa"></i>Text
                </button>
                <button onClick={() => setDescMode('voice')} style={{ height: 28, padding: '0 11px', border: 'none', borderRadius: 999, background: descMode === 'voice' ? 'rgba(255,255,255,.18)' : 'transparent', color: '#fff', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 5, alignItems: 'center' }}>
                  <i className="ph-bold ph-microphone"></i>Voice
                </button>
              </div>
            </div>
            {descMode === 'text' && (
              <textarea
                value={desc}
                onChange={e => onDesc(e.target.value)}
                placeholder="What's wrong? Since when? Tamil or English is fine."
                rows={3}
                style={{ width: '100%', boxSizing: 'border-box', resize: 'none', padding: '10px 12px', borderRadius: 12, border: '1.5px solid #2a2c33', background: '#0c0d10', color: '#fff', font: '500 13.5px/1.4 Outfit,"Noto Sans Tamil",sans-serif', outline: 'none' }}
              />
            )}
            {descMode === 'voice' && (
              <>
                <button onClick={voiceTap} style={{ display: 'flex', alignItems: 'center', gap: 12, height: 54, padding: '0 10px', borderRadius: 999, background: voiceState === 'recording' ? 'rgba(255,255,255,.1)' : 'transparent', border: '1.5px solid #2a2c33', color: '#fff', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
                  <span style={{ width: 38, height: 38, borderRadius: 11, background: 'rgba(255,255,255,.14)', display: 'grid', placeItems: 'center', fontSize: 19, flex: 'none' }}>
                    <i className={`ph-bold ${voiceState === 'recording' ? 'ph-stop' : 'ph-microphone'}`}></i>
                  </span>
                  <span style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 3, height: 28, minWidth: 0, overflow: 'hidden' }}>
                    {voiceState === 'idle' && <span style={{ font: '600 13px/1.2 Outfit,sans-serif' }}>Tap and speak</span>}
                    {voiceState !== 'idle' && WAVE.map((h, i) => (
                      <span key={i} style={{ width: 3, flex: 'none', height: h, borderRadius: 2, background: '#fff', animation: voiceState === 'recording' ? `cp-wave .8s ${i * 40}ms ease-in-out infinite` : 'none' }} />
                    ))}
                  </span>
                  <span style={{ font: '600 12px/1 Outfit,sans-serif', color: '#b9bbc4', paddingRight: 6, whiteSpace: 'nowrap' }}>{voiceTag}</span>
                </button>
                {voiceState === 'done' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '0 4px' }}>
                    <span style={{ font: '500 13px/1.35 "Noto Sans Tamil",Outfit,sans-serif' }}>
                      {scene === 'sewage' ? '"Bus stand pakkathula drainage overflow, romba naala ippadi dhaan irukku"'
                        : scene === 'pothole' ? '"ரொம்ப பெரிய பள்ளம், நைட்ல பைக் விழுது"'
                        : scene === 'garbage' ? '"Three days-a garbage edukkala, smell romba jaasthi"'
                        : '"Street full-a dark, ladies nadakka bayapadranga"'}
                    </span>
                    <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: '#8d8f99' }}>
                      {scene === 'sewage' ? 'Drainage overflowing near the bus stand, it has been like this for days'
                        : scene === 'pothole' ? 'Very big pit, bikes fall at night'
                        : scene === 'garbage' ? 'Garbage not collected for three days, the smell is terrible'
                        : 'The street is fully dark, women are afraid to walk'}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
            <span style={{ font: '600 12px/1 Outfit,sans-serif', color: '#b9bbc4' }}>Tags</span>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {tags.map(t => (
                  <button key={t} onClick={() => removeTag(t)} style={{ height: 32, padding: '0 10px', borderRadius: 999, border: 'none', background: 'oklch(0.63 0.19 32)', color: '#fff', font: '600 12px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 6, alignItems: 'center', whiteSpace: 'nowrap' }}>
                    #{t}<i className="ph-bold ph-x" style={{ fontSize: 11 }}></i>
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                value={tagDraft}
                onChange={e => setTagDraft(e.target.value)}
                onKeyDown={onTagKey}
                placeholder="Add your own tag"
                style={{ flex: 1, minWidth: 0, height: 40, padding: '0 12px', borderRadius: 11, border: '1.5px solid #2a2c33', background: '#0c0d10', color: '#fff', font: '500 13px/1 Outfit,sans-serif', outline: 'none' }}
              />
              <button onClick={addTag} style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff', cursor: 'pointer', fontSize: 17 }}>
                <i className="ph-bold ph-plus"></i>
              </button>
            </div>
          </div>

          {/* Identity toggle */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
            <button
              onClick={() => { if (!meVerified) openId(); else onAnon(false); }}
              style={{ height: 48, borderRadius: 999, border: 'none', background: !anon ? 'rgba(255,255,255,.16)' : 'transparent', color: '#fff', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              <span style={{ width: 26, height: 26, borderRadius: 8, background: 'oklch(0.82 0.15 75)', color: 'oklch(0.22 0.03 270)', font: '400 11px/26px "DM Serif Display",serif', textAlign: 'center' }}>{meInitials}</span>
              {meFirst}
              <i className="ph-fill ph-seal-check" style={{ color: 'oklch(0.7 0.1 200)' }}></i>
            </button>
            <button
              onClick={() => onAnon(true)}
              style={{ height: 48, borderRadius: 999, border: 'none', background: anon ? 'rgba(255,255,255,.16)' : 'transparent', color: '#fff', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer', display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap' }}
            >
              <i className="ph-bold ph-detective" style={{ fontSize: 19 }}></i>
              Anonymous
            </button>
          </div>
        </div>
      )}

      {/* Slide to report bar */}
      {captured && (
        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: `12px ${cPadX} 22px`, background: 'linear-gradient(transparent,#0c0d10 30%)' }}
          onPointerMove={onSlideMove}
          onPointerUp={onSlideUp}
        >
          <div style={{ position: 'relative', height: 64, borderRadius: 20, background: '#1a1c21', overflow: 'hidden', touchAction: 'none' }}>
            {/* Fill */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: slideFillW, background: 'oklch(0.63 0.19 32 / .28)' }} />
            {/* Text */}
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingLeft: 40, font: '400 15px/1 "DM Serif Display",serif', opacity: slideTextO, color: '#d8d9de', pointerEvents: 'none' }}>
              Slide to report<i className="ph-bold ph-caret-double-right"></i>
            </div>
            {/* Thumb */}
            <div
              onPointerDown={onSlideDown}
              style={{ position: 'absolute', left: 4, top: 4, width: 56, height: 56, borderRadius: 16, background: 'oklch(0.63 0.19 32)', display: 'grid', placeItems: 'center', fontSize: 24, cursor: 'grab', transform: `translateX(${slideX}px)`, transition: slideTrans, boxShadow: '0 4px 14px rgba(0,0,0,.35)', touchAction: 'none' }}
            >
              <i className="ph-bold ph-arrow-right"></i>
            </div>
          </div>
        </div>
      )}

      {/* Identity sheet overlay */}
      {idOpen && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 90 }}>
          <IdSheet step={idStep} otp={otp} onNext={idNext} onClose={() => setIdOpen(false)} />
        </div>
      )}
    </div>
  );
}
