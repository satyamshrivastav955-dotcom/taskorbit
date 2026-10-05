import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const config = {
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string | undefined) ?? '',
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined) ?? '',
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined) ?? '',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined) ?? '',
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string | undefined) ?? '',
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string | undefined) ?? '',
};

export const isFirebaseConfigured =
  config.apiKey !== '' &&
  config.apiKey !== 'placeholder' &&
  config.projectId !== '' &&
  config.projectId !== 'placeholder';

let app: FirebaseApp;
if (getApps().length > 0) {
  app = getApps()[0];
} else if (isFirebaseConfigured) {
  app = initializeApp(config);
} else {
  // Placeholder config so the UI shell still boots. Auth calls will fail
  // fast and Login shows a config warning instead of a cryptic error.
  app = initializeApp({
    apiKey: 'missing',
    authDomain: 'missing.firebaseapp.com',
    projectId: 'missing',
  });
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
