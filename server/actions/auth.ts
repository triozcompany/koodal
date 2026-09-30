'use server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import type { Me } from '@/lib/domain/types';

/** One phone number always maps to the same uid — this is what makes "every
 * unique number gets one user entity" true across sign-in/sign-out cycles. */
function uidForPhone(phone: string): string {
  return `ph_${phone.replace(/\D/g, '')}`;
}

/**
 * The one moment a real identity is created. OTP verification itself stays
 * mocked (checked client-side before this is called) — what's real is that
 * the resulting uid is durable: get-or-create the Firestore user doc, then
 * mint a Firebase Auth custom token so the client gets a real, persistent
 * signed-in session for that uid.
 */
export async function signInWithPhone(phone: string) {
  try {
    const uid = uidForPhone(phone);
    const ref = adminDb.doc(`users/${uid}`);
    const snap = await ref.get();
    const isNewUser = !snap.exists;

    if (isNewUser) {
      await ref.set({
        uid, phone, name: '', area: '', anonDefault: false,
        verified: false, votes: {}, createdAt: Date.now(),
      });
    }

    const data = isNewUser ? undefined : snap.data();
    const token = await adminAuth.createCustomToken(uid);

    return {
      token,
      uid,
      isNewUser,
      verified: !!data?.verified,
      name: (data?.name as string) ?? '',
      area: (data?.area as string) ?? '',
    };
  } catch (err) {
    // An uncaught rejection here crashes the whole Server Action (a hard
    // 500), which corrupts the client's expected response and surfaces as a
    // generic, undebuggable React error instead of the message below —
    // logging the real cause server-side (Vercel's function logs) first.
    console.error('signInWithPhone failed:', err);
    throw new Error("Couldn't sign you in right now. Please try again shortly.");
  }
}

/** Mocked e-KYC — no real UIDAI call, just records that this uid passed the
 * (fake) check, matching the original demo's "stores only a verified flag." */
export async function verifyAadhaar(uid: string) {
  try {
    await adminDb.doc(`users/${uid}`).update({ verified: true, verifiedAt: Date.now() });
  } catch (err) {
    console.error('verifyAadhaar failed:', err);
    throw new Error("Couldn't verify right now. Please try again shortly.");
  }
}

export async function updateProfile(uid: string, patch: Partial<Pick<Me, 'name' | 'area' | 'anonDefault' | 'votes'>>) {
  try {
    await adminDb.doc(`users/${uid}`).set(patch, { merge: true });
  } catch (err) {
    console.error('updateProfile failed:', err);
    throw new Error("Couldn't save your profile right now. Please try again shortly.");
  }
}
