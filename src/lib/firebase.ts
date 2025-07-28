// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace this with your own Firebase configuration
// from your Firebase project console.
const firebaseConfig = {
  apiKey: "AIzaSyBaJbE-iWUG6yHsPKvSZnzY8zd__VTqKOs",
  authDomain: "menu-219b0.firebaseapp.com",
  projectId: "menu-219b0",
  storageBucket: "menu-219b0.appspot.com",
  messagingSenderId: "606608649038",
  appId: "1:606608649038:web:3393f956522a666ee18c1f"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
