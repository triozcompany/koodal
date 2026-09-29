'use client';

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.8;

/** Downscale + re-encode as WebP. Any failure (undecodable file, browser without
 * WebP encoding — it silently returns PNG —, or no size win) falls back to the
 * original so a compression problem never blocks an upload. */
async function compressToWebp(file: File): Promise<File> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', WEBP_QUALITY));
    if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, '') + '.webp', { type: 'image/webp' });
  } catch {
    return file;
  }
}

export interface UploadedPhoto { url: string; publicId: string; }

/** Client-side unsigned upload — no server round trip, no secret key needed
 * (the upload preset itself is what's restricted, in the Cloudinary console).
 * `publicId` is returned alongside the URL so a failed report submission can
 * roll this upload back (see server/actions/cloudinary.ts — deleting an
 * asset does need the secret, so that part is server-only). */
export async function uploadPhoto(file: File): Promise<UploadedPhoto> {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) throw new Error('Cloudinary is not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.');

  const form = new FormData();
  form.append('file', await compressToWebp(file));
  form.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
  const data = await res.json();
  return { url: data.secure_url as string, publicId: data.public_id as string };
}
