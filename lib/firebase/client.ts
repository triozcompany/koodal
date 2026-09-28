import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBDoU8OWUHUXgLdgfORQnXM78vaNL-phnw',
  authDomain: 'trioz-319df.firebaseapp.com',
  projectId: 'trioz-319df',
  storageBucket: 'trioz-319df.firebasestorage.app',
  messagingSenderId: '452203492219',
  appId: '1:452203492219:web:b388215df13d09287e83de',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };
