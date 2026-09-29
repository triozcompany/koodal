'use client';

const MAX_EDGE = 1600;
const WEBP_QUALITY = 0.8;

/** Downscale + re-encode as a WebP data URL — same sizing as the eventual
 * Cloudinary upload (see lib/cloudinary/upload.ts), just kept local until
 * the report is actually submitted. Any failure falls back to the raw file
 * read as-is, so a compression problem never blocks capturing a photo. */
export async function fileToDataUrl(file: File): Promise<string> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    return canvas.toDataURL('image/webp', WEBP_QUALITY);
  } catch (err) {
    console.error('fileToDataUrl compression failed, using raw file:', err);
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

/** Reverses fileToDataUrl at submit time, so the already-compressed local
 * preview can be handed to uploadPhoto() as a real File. */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, b64] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? 'image/webp';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}
