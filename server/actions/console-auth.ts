'use server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { firebaseConfig } from '@/lib/firebase/config';
import { loadOrgConfig } from '@/lib/console/orgConfig.server';
import { DEFAULT_PREFS, type Prefs } from '@/lib/console/prefs.shared';
import type { OrgConfig } from '@/lib/console/config';

// Staff identity: each staff member is a Firebase Auth user (password hashed and rate-limited by Firebase)
// plus a non-secret profile in `staff/{empId}`. Nothing secret is stored in Firestore.
export interface StaffProfile { id: string; name: string; title: string; depts: string[]; role: 'admin' | 'staff'; email?: string; phone?: string; reportsTo?: string }

const authEmail = (id: string) => `${id.toLowerCase()}@staff.koodal.internal`;
const normId = (s: string) => s.trim().toUpperCase();
const MAX_FAILS = 5;
const LOCK_MS = 5 * 60_000;
const GENERIC = 'Employee ID or password is incorrect.';

type StaffDoc = StaffProfile & { active?: boolean; failedAttempts?: number; lockUntil?: number | null; prefs?: Partial<Prefs> };

const profileOf = (d: StaffDoc): StaffProfile => ({
  id: d.id, name: d.name, title: d.title, depts: d.depts ?? [], role: d.role === 'admin' ? 'admin' : 'staff', email: d.email, phone: d.phone, reportsTo: d.reportsTo,
});

/** Checks the password against Firebase Auth, with a 5-attempt lockout kept on the staff record. */
async function checkPassword(empId: string, password: string): Promise<{ ok: true; doc: StaffDoc } | { ok: false; error: string }> {
  const id = normId(empId);
  if (!id || !password) return { ok: false, error: 'Enter your employee ID and password.' };
  const ref = adminDb.doc(`staff/${id}`);
  let snap;
  try {
    snap = await ref.get();
  } catch (err) {
    // An uncaught rejection here crashes the whole Server Action (a hard
    // 500) instead of returning this same message like every other failure
    // path below — logging the real cause server-side (Vercel's function logs) first.
    console.error('checkPassword (Firestore read) failed:', err);
    return { ok: false, error: 'Could not check your password right now. Try again.' };
  }
  if (!snap.exists || snap.data()!.active === false) return { ok: false, error: GENERIC };
  const doc = { id, ...snap.data() } as StaffDoc;
  if (doc.lockUntil && doc.lockUntil > Date.now()) {
    return { ok: false, error: `Too many attempts. Try again in ${Math.ceil((doc.lockUntil - Date.now()) / 60_000)} min.` };
  }
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: authEmail(id), password, returnSecureToken: false }),
  });
  if (!res.ok) {
    const code = String(((await res.json().catch(() => ({}))) as { error?: { message?: string } }).error?.message ?? '');
    // Only a genuinely wrong password counts toward the lockout. Firebase's own throttling or a network
    // problem must not lock out someone who typed the right password.
    if (!/INVALID_LOGIN_CREDENTIALS|INVALID_PASSWORD|EMAIL_NOT_FOUND/.test(code)) {
      return { ok: false, error: /TOO_MANY_ATTEMPTS/.test(code) ? 'Too many attempts. Wait a minute and try again.' : 'Could not check your password right now. Try again.' };
    }
    const fails = (doc.failedAttempts ?? 0) + 1;
    await ref.update(fails >= MAX_FAILS ? { failedAttempts: 0, lockUntil: Date.now() + LOCK_MS } : { failedAttempts: fails });
    return { ok: false, error: fails >= MAX_FAILS ? `Too many attempts. Try again in ${LOCK_MS / 60_000} min.` : GENERIC };
  }
  if (doc.failedAttempts || doc.lockUntil) await ref.update({ failedAttempts: 0, lockUntil: null });
  return { ok: true, doc };
}

/** Step 1 of sign-in: employee ID + password. The code screen only opens if this passes. */
export async function checkStaffCredentials(empId: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const r = await checkPassword(empId, password);
  return r.ok ? { ok: true } : { ok: false, error: r.error };
}

/** Step 2, after the (demo) code: re-check the password and mint the Firebase custom token with the staff claims. */
export async function signInStaff(empId: string, password: string): Promise<{ token: string; staff: StaffProfile } | { error: string }> {
  const r = await checkPassword(empId, password);
  if (!r.ok) return { error: r.error };
  const staff = profileOf(r.doc);
  try {
    const token = await adminAuth.createCustomToken(`staff_${staff.id}`, { staff: true, org: 'gcc', depts: staff.depts, staffName: staff.name, staffId: staff.id, role: staff.role });
    return { token, staff };
  } catch (err) {
    console.error('signInStaff (createCustomToken) failed:', err);
    return { error: 'Could not sign you in right now. Try again.' };
  }
}

async function whoAmI(idToken: string) {
  try {
    const t = await adminAuth.verifyIdToken(idToken);
    if (!t.staff) throw new Error('Not authorised');
    return { t, id: (t.staffId as string | undefined) ?? t.uid.replace(/^staff_/, '') };
  } catch (err) {
    console.error('whoAmI failed:', err);
    throw new Error("Couldn't verify your session. Please sign in again.");
  }
}

/** Fresh profile, saved settings and org config for a signed-in session (called on every load). */
export async function getMe(idToken: string): Promise<{ staff: StaffProfile; prefs: Prefs; config: OrgConfig }> {
  const { id } = await whoAmI(idToken);
  try {
    const snap = await adminDb.doc(`staff/${id}`).get();
    if (!snap.exists || snap.data()!.active === false) throw new Error('This staff account is no longer active');
    const doc = { id, ...snap.data() } as StaffDoc;
    return { staff: profileOf(doc), prefs: { ...DEFAULT_PREFS, ...(doc.prefs ?? {}) }, config: await loadOrgConfig() };
  } catch (err) {
    console.error('getMe failed:', err);
    throw new Error("Couldn't load your profile right now. Please try again shortly.");
  }
}

export async function saveStaffPrefs(idToken: string, prefs: Prefs) {
  const { id } = await whoAmI(idToken);
  const clean: Prefs = {
    lang: typeof prefs.lang === 'string' ? prefs.lang.slice(0, 5) : DEFAULT_PREFS.lang,
    notif: Object.fromEntries(Object.keys(DEFAULT_PREFS.notif).map((k) => [k, !!prefs.notif?.[k]])),
    ch: Object.fromEntries(Object.keys(DEFAULT_PREFS.ch).map((k) => [k, !!prefs.ch?.[k]])),
    timeout: (['15m', '30m', '60m'] as const).includes(prefs.timeout) ? prefs.timeout : DEFAULT_PREFS.timeout,
    showDemo: !!prefs.showDemo,
  };
  try {
    await adminDb.doc(`staff/${id}`).set({ prefs: clean }, { merge: true });
  } catch (err) {
    console.error('saveStaffPrefs failed:', err);
    throw new Error("Couldn't save your settings right now. Please try again shortly.");
  }
}

export async function changeStaffPassword(idToken: string, current: string, next: string): Promise<{ ok: boolean; error?: string }> {
  const { id, t } = await whoAmI(idToken);
  if (next.length < 8) return { ok: false, error: 'Use at least 8 characters.' };
  if (next === current) return { ok: false, error: 'Choose a different password.' };
  const r = await checkPassword(id, current);
  if (!r.ok) return { ok: false, error: r.error === GENERIC ? 'Your current password is incorrect.' : r.error };
  try {
    await adminAuth.updateUser(t.uid, { password: next });
    return { ok: true };
  } catch (err) {
    console.error('changeStaffPassword failed:', err);
    return { ok: false, error: "Couldn't change your password right now. Try again." };
  }
}
