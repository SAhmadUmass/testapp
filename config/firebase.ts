import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

// Get Firebase config from Expo extra
const firebaseConfig = Constants.manifest?.extra?.firebaseConfig;

if (!firebaseConfig) {
  throw new Error('Firebase configuration is not provided in app.config.js');
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export types
export type FirebaseApp = typeof app;
export type FirebaseAuth = typeof auth;
export type FirebaseDB = typeof db;
export type FirebaseStorage = typeof storage; 