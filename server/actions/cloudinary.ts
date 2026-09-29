'use server';
import { v2 as cloudinary } from 'cloudinary';

/** Deleting an asset needs a real signed request (the API key + secret) —
 * unlike the unsigned upload preset, this can only run server-side, and only
 * here. Used to roll back photos that made it to Cloudinary during a report
 * submission that then failed (upload succeeded, Firestore write didn't, or
 * vice-versa mid-batch) — see AppShell's doPostNew/doJoin. */
export async function deleteCloudinaryImages(publicIds: string[]): Promise<void> {
  if (!publicIds.length) return;
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    console.error('deleteCloudinaryImages skipped — Cloudinary API key/secret not configured.');
    return;
  }
  cloudinary.config({ cloud_name, api_key, api_secret });
  await Promise.all(
    publicIds.map(id =>
      cloudinary.uploader.destroy(id).catch(err => console.error(`deleteCloudinaryImages failed for ${id}:`, err))
    ),
  );
}
