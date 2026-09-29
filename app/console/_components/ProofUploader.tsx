'use client';
import { useEffect, useRef, useState } from 'react';
import { uploadPhoto } from '@/lib/cloudinary/upload';
import { deleteCloudinaryImages } from '@/server/actions/cloudinary';

export interface UploadedProof { url: string; publicId: string }

/** Small square preview from Cloudinary (auto format, cropped) instead of the full 1600px image. */
export const thumb = (url: string, px = 240) => url.replace('/upload/', `/upload/w_${px},h_${px},c_fill,f_auto,q_auto/`);

interface Pending { key: string; preview: string; error?: string }
interface Props {
  value: UploadedProof[];
  onChange: (next: UploadedProof[]) => void;
  /** True while any photo is still compressing/uploading, so the caller can hold its submit button. */
  onBusyChange?: (busy: boolean) => void;
  max?: number;
}

const tile = { position: 'relative', aspectRatio: '1', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--cp-line)', background: 'var(--cp-surface-2)', animation: 'cp-pop2 .2s both' } as const;

// Photos are compressed to WebP and uploaded straight to Cloudinary (lib/cloudinary/upload.ts, the same
// pipeline the citizen app uses). Removing an uploaded photo deletes the Cloudinary asset again.
export function ProofUploader({ value, onChange, onBusyChange, max = 6 }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const valueRef = useRef(value);
  valueRef.current = value;
  // Keep the local preview for photos uploaded in this session: Cloudinary builds the resized
  // thumbnail on first request, which can take a few seconds.
  const previews = useRef<Record<string, string>>({});

  const inFlight = pending.filter((p) => !p.error).length;
  useEffect(() => { onBusyChange?.(inFlight > 0); }, [inFlight, onBusyChange]);
  useEffect(() => () => { Object.values(previews.current).forEach((u) => URL.revokeObjectURL(u)); }, []);

  async function add(files: FileList | null) {
    if (!files) return;
    const room = max - valueRef.current.length - pending.length;
    const picked = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, Math.max(0, room));
    await Promise.all(picked.map(async (file) => {
      const key = `${file.name}-${file.size}-${Math.random().toString(36).slice(2)}`;
      const preview = URL.createObjectURL(file);
      setPending((p) => [...p, { key, preview }]);
      try {
        const up = await uploadPhoto(file);
        previews.current[up.publicId] = preview;
        onChange([...valueRef.current, up]);
        valueRef.current = [...valueRef.current, up];
        setPending((p) => p.filter((x) => x.key !== key));
      } catch (e) {
        setPending((p) => p.map((x) => (x.key === key ? { ...x, error: e instanceof Error ? e.message : 'Upload failed' } : x)));
      }
    }));
    if (input.current) input.current.value = '';
  }

  function remove(idx: number) {
    const gone = value[idx];
    onChange(value.filter((_, i) => i !== idx));
    deleteCloudinaryImages([gone.publicId]).catch(() => {});
  }

  const full = value.length + pending.length >= max;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(100px,1fr))', gap: 8 }}>
      {value.map((p, k) => (
        <div key={p.publicId} style={tile}>
          <img src={previews.current[p.publicId] ?? thumb(p.url)} alt={`Photo ${k + 1}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => remove(k)} aria-label={`Remove photo ${k + 1}`} style={{ position: 'absolute', right: 6, top: 6, width: 24, height: 24, borderRadius: '50%', border: 'none', background: 'var(--cp-surface)', color: 'var(--cp-ink)', cursor: 'pointer', fontSize: 11 }}><i className="ph-bold ph-x" /></button>
        </div>
      ))}
      {pending.map((p) => (
        <div key={p.key} style={tile}>
          <img src={p.preview} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: p.error ? 0.4 : 0.55 }} />
          {p.error ? (
            <>
              <span style={{ position: 'absolute', left: 6, right: 6, bottom: 34, font: '600 10.5px/1.2 Outfit,sans-serif', color: 'var(--cp-pulse-deep)' }}>Upload failed</span>
              <button onClick={() => { URL.revokeObjectURL(p.preview); setPending((x) => x.filter((y) => y.key !== p.key)); }} style={{ position: 'absolute', left: 6, right: 6, bottom: 6, height: 24, borderRadius: 8, border: 'none', background: 'var(--cp-surface)', color: 'var(--cp-ink)', font: '600 11px/1 Outfit,sans-serif', cursor: 'pointer' }}>Dismiss</button>
            </>
          ) : (
            <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}><span style={{ width: 22, height: 22, borderRadius: '50%', border: '2.5px solid var(--cp-line)', borderTopColor: 'var(--cp-ink)', animation: 'cp-spin .7s linear infinite' }} /></span>
          )}
        </div>
      ))}
      {!full && (
        <button onClick={() => input.current?.click()} style={{ aspectRatio: '1', borderRadius: 14, border: '1.5px dashed var(--cp-ink-3)', background: 'none', color: 'var(--cp-ink-2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, font: '600 11.5px/1.2 Outfit,sans-serif' }}>
          <i className="ph-bold ph-camera" style={{ fontSize: 20 }} />Add photos
        </button>
      )}
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => add(e.target.files)} />
    </div>
  );
}
