'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Tooltip } from './Tooltip';

interface Props {
  /** A frame grabbed from the live preview. */
  onFile: (file: File) => void;
  onGallery: () => void;
  /** Used when the live preview can't start (no API, denied, insecure page): open the phone's camera app. */
  onNativeCapture: () => void;
  busy: boolean;
  /** Overlay mode (adding another photo): shows a Done button. */
  onClose?: () => void;
}

const CTRL = { width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.14)', border: 'none', color: '#fff', fontSize: 20, display: 'grid', placeItems: 'center', cursor: 'pointer' } as const;

export function LiveCamera({ onFile, onGallery, onNativeCapture, busy, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facing, setFacing] = useState<'environment' | 'user'>('environment');
  const [ready, setReady] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [canSwitch, setCanSwitch] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [torch, setTorch] = useState(false);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setReady(false);
    setTorch(false);
  }, []);

  const start = useCallback(async () => {
    stop();
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia || !window.isSecureContext) {
      setProblem('Live camera needs a secure (https) connection. Tap the button to open your camera app.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1920 } },
        audio: false,
      });
      streamRef.current = stream;
      const v = videoRef.current;
      if (v) { v.srcObject = stream; await v.play().catch(() => {}); }
      const caps = stream.getVideoTracks()[0]?.getCapabilities?.() as { torch?: boolean } | undefined;
      setHasTorch(!!caps?.torch);
      setProblem(null);
      setReady(true);
      navigator.mediaDevices.enumerateDevices().then((d) => setCanSwitch(d.filter((x) => x.kind === 'videoinput').length > 1)).catch(() => {});
    } catch {
      setProblem("Camera access isn't available. Tap the button to open your camera app.");
    }
  }, [facing, stop]);

  useEffect(() => {
    start();
    // Release the camera when the tab is hidden and take it back when it returns.
    const onVis = () => { if (document.hidden) stop(); else start(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { document.removeEventListener('visibilitychange', onVis); stop(); };
  }, [start, stop]);

  const toggleTorch = async () => {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] });
      setTorch(!torch);
    } catch { setHasTorch(false); }
  };

  const shoot = () => {
    if (busy) return;
    const v = videoRef.current;
    if (!ready || !v || !v.videoWidth) { onNativeCapture(); return; }
    const c = document.createElement('canvas');
    c.width = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext('2d')!.drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((b) => {
      if (b) onFile(new File([b], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' }));
      else onNativeCapture();
    }, 'image/jpeg', 0.92);
  };

  return (
    <>
      <video
        ref={videoRef} playsInline muted autoPlay
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: facing === 'user' ? 'scaleX(-1)' : undefined, opacity: ready ? 1 : 0, transition: 'opacity .25s' }}
      />
      <div style={{ position: 'absolute', left: '50%', top: '50%', width: 220, height: 220, marginLeft: -110, marginTop: -110, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 34, height: 34, borderLeft: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '12px 0 0 0' }} />
        <div style={{ position: 'absolute', right: 0, top: 0, width: 34, height: 34, borderRight: '3px solid #fff', borderTop: '3px solid #fff', borderRadius: '0 12px 0 0' }} />
        <div style={{ position: 'absolute', left: 0, bottom: 0, width: 34, height: 34, borderLeft: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 0 12px' }} />
        <div style={{ position: 'absolute', right: 0, bottom: 0, width: 34, height: 34, borderRight: '3px solid #fff', borderBottom: '3px solid #fff', borderRadius: '0 0 12px 0' }} />
      </div>
      <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', maxWidth: 'calc(100% - 32px)', display: 'flex', alignItems: 'center', gap: 7, minHeight: 34, padding: '8px 13px', borderRadius: 17, background: 'rgba(12,13,16,.72)', font: '600 12px/1.3 Outfit,sans-serif', textAlign: 'center' }}>
        <span style={{ width: 7, height: 7, flex: 'none', borderRadius: '50%', background: 'var(--cp-marigold)' }} />
        {problem ?? 'Point at the issue'}
      </div>
      {onClose && (
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, height: 34, padding: '0 14px', borderRadius: 17, border: 'none', background: 'rgba(12,13,16,.72)', color: '#fff', font: '600 12.5px/1 Outfit,sans-serif', cursor: 'pointer' }}>Done</button>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 40 }}>
          <Tooltip label="Choose from gallery">
            <button aria-label="Choose from gallery" onClick={onGallery} style={CTRL}><i className="ph-bold ph-images" /></button>
          </Tooltip>
          <Tooltip label="Capture photo">
            <button aria-label="Capture photo" onClick={shoot} disabled={busy} style={{ width: 80, height: 80, borderRadius: '50%', border: '5px solid #fff', background: 'transparent', padding: 5, cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1 }}>
              {busy
                ? <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', border: '3px solid rgba(255,255,255,.35)', borderTopColor: '#fff', animation: 'cp-spin .7s linear infinite' }} />
                : <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', background: 'oklch(0.63 0.19 32)' }} />}
            </button>
          </Tooltip>
          {/* Placeholders keep the shutter centred when a control isn't supported on this device. */}
          {canSwitch ? (
            <Tooltip label="Switch camera">
              <button aria-label="Switch camera" onClick={() => setFacing((f) => (f === 'environment' ? 'user' : 'environment'))} style={CTRL}><i className="ph-bold ph-camera-rotate" /></button>
            </Tooltip>
          ) : <span style={{ width: 46 }} />}
        </div>
        {hasTorch && (
          <button aria-label="Toggle flash" aria-pressed={torch} onClick={toggleTorch} style={{ ...CTRL, position: 'absolute', right: 16, bottom: 30, background: torch ? 'var(--cp-marigold)' : CTRL.background, color: torch ? '#0f0f0f' : '#fff' }}><i className={`ph-${torch ? 'fill' : 'bold'} ph-lightning`} /></button>
        )}
      </div>
    </>
  );
}
