'use client';
import { useEffect, useRef, useState } from 'react';
import { useApp } from '@/lib/app-context';
import { fileToDataUrl } from '@/lib/local/localPhoto';
import { reverseGeocode, type GeocodeResult } from '@/lib/geo/nominatim';
import { CAT_MOCK } from '@/lib/domain/analyze';
import type { Category } from '@/lib/domain/types';
import { ReportMediaViewer } from '../components/ReportMediaViewer';
import { GoalGradientBar } from '../components/GoalGradientBar';
import { LocationPicker } from '../components/LocationPicker';
import { Tooltip } from '../components/Tooltip';
import { LiveCamera } from '../components/LiveCamera';
import { CATS, ICON_CHOICES } from '@/lib/domain/constants';
import { calcReportSegments, getReportHint } from '@/lib/domain/report-draft';
import type { Shot } from '@/lib/domain/report-draft';

const WAVE = [10, 18, 26, 14, 22, 28, 12, 20, 26, 16, 8, 22, 18, 26, 12, 20, 14, 24, 10, 18];

interface Props {
  cat: Category;
  icon: string | null;
  anon: boolean;
  title: string;
  desc: string;
  tags: string[];
  shots: Shot[];
  location: GeocodeResult | null;
  mob: boolean;
  onClose: () => void;
  onIcon: (i: string) => void;
  onAnon: (a: boolean) => void;
  onTitle: (t: string) => void;
  onDesc: (d: string) => void;
  onTags: (t: string[]) => void;
  onLocationPicked: (loc: GeocodeResult) => void;
  onAddShot: (url: string) => void;
  onRemoveShot: (id: string) => void;
  onRestoreShot: (shot: Shot, index: number) => void;
  onRetakeAll: () => void;
  onSlideSubmit: () => void;
}

export function ReportScreen({
  cat, icon, anon, title, desc, tags, shots, location, mob,
  onClose, onIcon, onAnon, onTitle, onDesc, onTags, onLocationPicked,
  onAddShot, onRemoveShot, onRestoreShot, onRetakeAll,
  onSlideSubmit,
}: Props) {
  const { me } = useApp();
  const [locOpen, setLocOpen] = useState(false);
  const [locError, setLocError] = useState<string | null>(null);
  const autoDetectedRef = useRef(false);

  // Silently try to auto-detect location once, as soon as the report flow
  // opens — the tappable location card below is the fallback/manual path
  // (search or pan a real map) for when this fails, is denied, or the user
  // just wants to pick somewhere else.
  useEffect(() => {
    if (location || autoDetectedRef.current) return;
    autoDetectedRef.current = true;
    if (!navigator.geolocation) {
      setLocError('Location isn’t available on this device — tap to search or set it on the map.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const r = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        if (r) onLocationPicked(r);
        else setLocError("Couldn't figure out the address — tap to search or set it on the map.");
      },
      err => {
        // GeolocationPositionError's code/message are inherited getters, not
        // own enumerable properties, so logging the raw object prints "{}".
        console.error(`auto geolocation failed: [${err.code}] ${err.message}`);
        setLocError("Couldn't detect your location — tap to search or set it on the map.");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const captured = shots.length > 0;
  const [flash, setFlash] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [cameraOpen, setCameraOpen] = useState(false); // live camera over an existing photo, to add another
  const [descMode, setDescMode] = useState<'text' | 'voice'>('text');
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'done'>('idle');
  const [tagDraft, setTagDraft] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pendingUndo, setPendingUndo] = useState<{ shot: Shot; index: number } | null>(null);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Slide-to-report — window listeners so drag works outside the element
  const [slideX, setSlideX] = useState(0);
  const slideXRef = useRef(0);
  const slideStartX = useRef(0);
  const isDragging = useRef(false);
  const onSlideSubmitRef = useRef(onSlideSubmit);
  onSlideSubmitRef.current = onSlideSubmit;

  // Max drag distance is measured from the track's real rendered width, not a
  // hardcoded constant — the track stretches to fill variable-width containers
  // (mobile full-bleed vs the desktop side panel) while the thumb is fixed-size.
  // The track only exists in the DOM once `captured` is true, so this uses a
  // state-backed callback ref (not useRef+empty-deps-effect) — otherwise the
  // measuring effect fires once at mount, finds no element yet, and never runs again.
  const [trackEl, setTrackEl] = useState<HTMLDivElement | null>(null);
  const maxDragRef = useRef(220);
  const [maxDrag, setMaxDrag] = useState(220);
  const THUMB_W = 56;
  const THUMB_INSET = 4;

  useEffect(() => {
    if (!trackEl) return;
    const measure = () => {
      const w = Math.max(0, trackEl.clientWidth - THUMB_W - THUMB_INSET * 2);
      maxDragRef.current = w;
      setMaxDrag(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackEl);
    return () => ro.disconnect();
  }, [trackEl]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => () => { if (undoTimerRef.current) clearTimeout(undoTimerRef.current); }, []);

  const meInitials = me.name.split(' ').map(s => s[0]).join('');
  const meFirst = me.name.split(' ')[0];

  // Goal-gradient progress — segments 1+2 (Capture/Report) are this screen's
  // responsibility; segments 3+4 (Analyze/Match) stay at 0 until the citizen
  // actually reaches those screens (see AiScreen/SimilarScreen).
  const hasDesc = desc.trim().length > 0 || voiceState === 'done';
  const hasTag = tags.length > 0;
  const slideFrac = maxDrag > 0 ? slideX / maxDrag : 0;
  const [seg1, seg2] = calcReportSegments({ hasShot: captured, hasDesc, hasTag, slideFrac });
  const pct = Math.round(((seg1 + seg2) / 4) * 100);
  const hint = getReportHint(captured, hasDesc, hasTag);
  const barColor = hint.ready ? 'var(--cp-leaf)' : 'var(--cp-marigold)';
  const canSubmit = hint.ready && title.trim().length > 0 && !!location;

  // Light haptic tick each time a segment completes (rising edge only)
  const prevSeg = useRef({ shot: captured, desc: hasDesc, tag: hasTag });
  useEffect(() => {
    const prev = prevSeg.current;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (!prev.shot && captured) navigator.vibrate(6);
      else if (!prev.desc && hasDesc) navigator.vibrate(6);
      else if (!prev.tag && hasTag) navigator.vibrate(6);
    }
    prevSeg.current = { shot: captured, desc: hasDesc, tag: hasTag };
  }, [captured, hasDesc, hasTag]);

  const doCapture = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  // No network call here — the photo is compressed and kept locally (in
  // localStorage) until the report is actually submitted. See AppShell's
  // doPostNew/doJoin for where the real Cloudinary upload happens.
  const addFile = async (file: File) => {
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setFlash(true);
      setTimeout(() => setFlash(false), 250);
      onAddShot(dataUrl);
    } catch (err) {
      console.error('fileToDataUrl failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) addFile(file);
  };

  const handleRemoveShot = (id: string) => {
    const index = shots.findIndex(s => s.id === id);
    const shot = shots[index];
    if (!shot) return;
    onRemoveShot(id);
    setPendingUndo({ shot, index });
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => setPendingUndo(null), 4000);
  };

  const handleUndoRemove = () => {
    if (!pendingUndo) return;
    onRestoreShot(pendingUndo.shot, pendingUndo.index);
    setPendingUndo(null);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
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

  const onSlideDown = (e: React.PointerEvent) => {
    if (!canSubmit) return;
    e.preventDefault();
    const maxDrag = maxDragRef.current;
    slideStartX.current = e.clientX - slideXRef.current;
    isDragging.current = true;

    const onMove = (ev: PointerEvent) => {
      const nx = Math.max(0, Math.min(maxDrag, ev.clientX - slideStartX.current));
      slideXRef.current = nx;
      setSlideX(nx);
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (slideXRef.current >= maxDrag * 0.85) {
        slideXRef.current = maxDrag;
        setSlideX(maxDrag);
        if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([10, 30, 40]);
        setTimeout(() => onSlideSubmitRef.current(), 200);
      } else {
        slideXRef.current = 0;
        setSlideX(0);
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  const slideFillW = `${slideX + THUMB_W + THUMB_INSET * 2}px`;
  const slideTextO = maxDrag > 0 ? Math.max(0, 1 - slideX / (maxDrag * 0.7)) : 1;
  const slideTrans = isDragging.current || reducedMotion ? 'none' : 'transform .4s cubic-bezier(.3,1.4,.5,1)';

  const camMode = mob && !captured;
  const uploadMode = !mob && !captured;
  const cPadX = mob ? '16px' : 'max(24px, calc((100% - 760px) / 2))';
  // Before a photo exists there's no form below it to scroll into, so the
  // camera/upload area should fill the whole available height, not just its
  // post-capture fraction (which would otherwise leave dead space below it).
  const photoAreaH = captured
    ? (mob ? 'max(360px, 52vh)' : 'max(400px, 66vh)')
    : '100%';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0c0d10', color: '#fff', animation: 'cp-in .3s ease-out both', display: 'flex', flexDirection: 'column' }}>
      <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />
      <input ref={galleryInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />

      {/* Sticky top bar — close/GPS row, goal-gradient progress, hint+percent */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
        background: scrolled ? 'rgba(12,13,16,.72)' : 'transparent',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        transition: 'background .25s, backdrop-filter .25s',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px 0' }}>
          <Tooltip label="Close report">
            <button aria-label="Close report" onClick={onClose} style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 18 }}>
              <i className="ph-bold ph-x"></i>
            </button>
          </Tooltip>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, height: 30, padding: '0 11px', borderRadius: 15, background: 'rgba(255,255,255,.14)', font: '600 12px/1 Outfit,sans-serif', whiteSpace: 'nowrap' }}>
            <i className="ph-fill ph-navigation-arrow" style={{ color: 'var(--cp-marigold)' }}></i>
            GPS ±8 m
          </span>
          <span style={{ width: 42 }} />
        </div>

        <div style={{ padding: '12px 16px 10px' }}>
          <GoalGradientBar
            segments={[seg1, seg2, 0, 0]}
            color={barColor}
            hintIcon={hint.icon}
            hintText={hint.text}
            pct={pct}
            trackColor="rgba(255,255,255,.14)"
            mutedColor="#9a9ca6"
            reducedMotion={reducedMotion || isDragging.current}
          />
        </div>
      </div>

      {/* Single continuously-scrolling page: photo + form scroll together */}
      <div
        onScroll={e => setScrolled(e.currentTarget.scrollTop > 40)}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', boxSizing: 'border-box' }}
      >
        {/* Photo area */}
        <div style={{ position: 'relative', height: photoAreaH, minHeight: 200, overflow: 'hidden', borderRadius: '0 0 26px 26px', background: 'repeating-linear-gradient(135deg,#1b1d22 0 10px,#16181c 10px 20px)' }}>
          {camMode && (
            <LiveCamera onFile={addFile} onGallery={() => galleryInputRef.current?.click()} onNativeCapture={doCapture} busy={uploading} />
          )}

          {uploadMode && (
            <div style={{ position: 'absolute', inset: '20px 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 18, borderRadius: 24, border: '2px dashed #3a3c44', background: '#131418', textAlign: 'center', padding: 24 }}>
              <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,.08)', display: 'grid', placeItems: 'center', fontSize: 30 }}>
                <i className="ph-bold ph-upload-simple"></i>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ font: "400 23px/1.1 'DM Serif Display',serif" }}>Upload photos or a short video</span>
                <span style={{ font: '500 13px/1.4 Outfit,sans-serif', color: '#9a9ca6', maxWidth: 420 }}>Drag files here. Location is read from the photo, or you can set it next.</span>
              </div>
              <button data-glare="1" onClick={doCapture} style={{ height: 48, padding: '0 22px', borderRadius: 999, border: 'none', background: '#fff', color: '#0c0d10', font: '600 14px/1 Outfit,sans-serif', letterSpacing: '.01em', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'transform .12s' }}>
                Choose from computer
              </button>
            </div>
          )}

          {captured && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <ReportMediaViewer
                shots={shots}
                aiHint={`${CATS[cat].l} spotted`}
                onAdd={mob ? () => setCameraOpen(true) : doCapture}
                onRemove={handleRemoveShot}
                onRetakeAll={onRetakeAll}
                street={location?.address || 'Locating…'}
              />
            </div>
          )}

          {captured && mob && cameraOpen && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 5, background: '#0c0d10' }}>
              <LiveCamera onFile={addFile} onGallery={() => galleryInputRef.current?.click()} onNativeCapture={doCapture} busy={uploading} onClose={() => setCameraOpen(false)} />
            </div>
          )}

          {flash && <div style={{ position: 'absolute', inset: 0, zIndex: 6, background: '#fff', animation: 'cp-flash .3s ease-out both' }} />}
        </div>

        {/* Form (after at least one photo) */}
        {captured && (
          <div style={{ padding: `14px ${cPadX} 24px`, display: 'flex', flexDirection: 'column', gap: 12, animation: 'cp-row .35s ease-out both', boxSizing: 'border-box' }}>

            {/* Title */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
              <span style={{ font: '600 12px/1 Outfit,sans-serif', color: '#b9bbc4' }}>Title</span>
              <input
                value={title}
                onChange={e => onTitle(e.target.value)}
                placeholder="What's the issue? e.g. Deep pothole outside the bus stop"
                style={{ height: 26, padding: 0, border: 'none', outline: 'none', background: 'transparent', color: '#fff', font: '600 15px/1.3 Outfit,sans-serif' }}
              />
            </div>

            {/* Location card — tappable, opens the map picker */}
            <button
              onClick={() => setLocOpen(true)}
              style={{ display: 'flex', gap: 10, alignItems: 'center', padding: 10, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33', cursor: 'pointer', textAlign: 'left', width: '100%' }}
            >
              <div style={{ width: 38, height: 38, flex: 'none', borderRadius: 11, background: 'oklch(0.63 0.19 32)', display: 'grid', placeItems: 'center', fontSize: 19 }}>
                <i className="ph-fill ph-map-pin"></i>
              </div>
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{ font: '600 13px/1.1 Outfit,sans-serif', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {location?.address || (locError ? 'Location not set' : 'Detecting your location…')}
                </span>
                <span style={{ font: '500 11.5px/1 Outfit,sans-serif', color: locError ? 'var(--cp-pulse)' : '#8d8f99' }}>
                  {location ? 'Tap to change' : locError || 'Or tap to search / set it on the map'}
                </span>
              </div>
              <i className="ph-bold ph-caret-right" style={{ color: '#8d8f99', fontSize: 15, flexShrink: 0 }} />
            </button>

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
                        {CAT_MOCK[cat].voice.text}
                      </span>
                      <span style={{ font: '500 12px/1.3 Outfit,sans-serif', color: '#8d8f99' }}>
                        {CAT_MOCK[cat].voice.en}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Icon */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
              <span style={{ font: '600 12px/1 Outfit,sans-serif', color: '#b9bbc4' }}>Icon</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {ICON_CHOICES.map(c => {
                  const on = icon ? icon === c.icon : CATS[cat].icon === c.icon;
                  return (
                    <Tooltip key={c.icon} label={c.label}>
                      <button aria-label={c.label} aria-pressed={on} onClick={() => onIcon(c.icon)}
                        style={{ width: 44, height: 44, borderRadius: 12, border: `2px solid ${on ? 'rgba(255,255,255,.7)' : '#2a2c33'}`, background: on ? 'rgba(255,255,255,.14)' : '#0c0d10', color: on ? 'var(--cp-marigold)' : '#9a9ca6', cursor: 'pointer', fontSize: 20, display: 'grid', placeItems: 'center' }}>
                        <i className={`ph-bold ${c.icon}`}></i>
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
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
                <Tooltip label="Add tag">
                  <button aria-label="Add tag" onClick={addTag} style={{ width: 40, height: 40, flex: 'none', borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.14)', color: '#fff', cursor: 'pointer', fontSize: 17 }}>
                    <i className="ph-bold ph-plus"></i>
                  </button>
                </Tooltip>
              </div>
            </div>

            {/* Identity toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, padding: 4, borderRadius: 16, background: '#1a1c21', border: '1.5px solid #2a2c33' }}>
              <button
                onClick={() => onAnon(false)}
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

            {/* Hint mirrors the top-bar state, directly above the slide-to-report bar */}
            <span style={{ textAlign: 'center', font: '600 12px/1 Outfit,sans-serif', color: barColor }}>{hint.text}</span>

            {/* Slide to report — end of form, not pinned to viewport bottom */}
            <div ref={setTrackEl} style={{ position: 'relative', height: 64, borderRadius: 20, background: '#1a1c21', overflow: 'hidden', touchAction: 'none' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: slideFillW, background: 'oklch(0.63 0.19 32 / .28)' }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingLeft: 40, font: '400 15px/1 "DM Serif Display",serif', opacity: slideTextO, color: '#d8d9de', pointerEvents: 'none' }}>
                {!hint.ready ? 'Add a photo and description first' : !title.trim() ? 'Give it a title' : !location ? 'Set a location' : 'Slide to report'}<i className="ph-bold ph-caret-double-right"></i>
              </div>
              <div
                onPointerDown={onSlideDown}
                aria-disabled={!canSubmit}
                style={{ position: 'absolute', left: 4, top: 4, width: 56, height: 56, borderRadius: 16, background: 'oklch(0.63 0.19 32)', display: 'grid', placeItems: 'center', fontSize: 24, cursor: canSubmit ? 'grab' : 'not-allowed', opacity: canSubmit ? 1 : 0.45, transform: `translateX(${slideX}px)`, transition: slideTrans, boxShadow: '0 4px 14px rgba(0,0,0,.35)', touchAction: 'none' }}
              >
                <i className="ph-bold ph-arrow-right"></i>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Undo toast — lives at the screen root so it survives the capture ↔ form transition */}
      {pendingUndo && (
        <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 250, display: 'flex', alignItems: 'center', gap: 10, height: 44, padding: '0 8px 0 16px', borderRadius: 14, background: '#fff', color: '#0c0d10', font: '600 12.5px/1.2 Outfit,sans-serif', boxShadow: '0 8px 24px -8px rgb(0 0 0 / .5)', animation: 'cp-toast .35s cubic-bezier(.2,.9,.3,1.3) both' }}>
          Photo removed
          <button onClick={handleUndoRemove} style={{ height: 32, padding: '0 12px', borderRadius: 999, border: 'none', background: '#0c0d10', color: '#fff', font: '700 12px/1 Outfit,sans-serif', cursor: 'pointer' }}>
            Undo
          </button>
        </div>
      )}

      {locOpen && (
        <LocationPicker
          initial={location}
          onConfirm={loc => { onLocationPicked(loc); setLocOpen(false); }}
          onClose={() => setLocOpen(false)}
        />
      )}
    </div>
  );
}
