import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD0YpIsGhEqq1MgmQewm9M9mDWidvKTS5A",
  authDomain: "theskytechnology.firebaseapp.com",
  projectId: "theskytechnology",
  storageBucket: "theskytechnology.firebasestorage.app",
  messagingSenderId: "902910453769",
  appId: "1:902910453769:web:2ef2aee7606c07403970d8",
  measurementId: "G-CJDDPPKXTV"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize Analytics only on client side
if (typeof window !== 'undefined') {
  getAnalytics(app);
}

// Set persistence to LOCAL for persistent sessions
auth.setPersistence(browserLocalPersistence);

export { app, auth, db };
