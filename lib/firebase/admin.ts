import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Service account key lives outside git (see .gitignore) — checked in locally at secret/.
// Resolved relative to this module file (not process.cwd()): Next.js dev's hot-module-reload
// can re-execute this file's top-level code in a context where process.cwd() no longer
// matches the project root, silently breaking the file read and falling back to a
// credential-less init ("Unable to detect a Project Id").
const __dirname = dirname(fileURLToPath(import.meta.url));
const SERVICE_ACCOUNT_PATH = join(__dirname, '..', '..', 'secret', 'trioz-319df-firebase-adminsdk-fbsvc-9ed783fdc2.json');

function loadServiceAccount() {
  // Preferred for hosts like Vercel: three plain env vars instead of one
  // JSON blob — no reassembling/escaping a whole file into a single value.
  // The private key's embedded newlines survive Vercel's env var UI as real
  // newlines already; `\n` is only unescaped here in case it was pasted as
  // a literal escaped one-liner instead (harmless no-op otherwise).
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    return {
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    };
  }
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
  }
  try {
    return JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
  } catch {
    return undefined; // falls back to ADC (gcloud auth application-default login)
  }
}

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  const sa = loadServiceAccount();
  return initializeApp(sa ? { credential: cert(sa) } : { projectId: 'trioz-319df' });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
