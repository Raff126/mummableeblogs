import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCjqqHt_JbrXV68p6YG1911c5qRbGPAfhM',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mummabeeblogss.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mummabeeblogss',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mummabeeblogss.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '32150321445',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:32150321445:web:76fdb45107655e9acac2cc',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-JGYJY95G03',
};

export const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const getFirebaseAuth = (): Auth | null => {
  if (typeof window === 'undefined') return null;
  try {
    return getAuth(app);
  } catch (err) {
    console.error('Firebase Auth initialization error:', err);
    return null;
  }
};

export default app;
