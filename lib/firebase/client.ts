import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';


const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Persistent cache: on a repeat visit the shared `issues` listener answers from IndexedDB straight away and
// then syncs with the server, instead of holding the loading screen until the first network round trip.
// Browser only (no IndexedDB on the server), and initializeFirestore throws if a hot reload already started it.
function createDb(): Firestore {
  if (typeof window === 'undefined') return getFirestore(app);
  try {
    return initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  } catch {
    return getFirestore(app);
  }
}
export const db = createDb();
export { app };
