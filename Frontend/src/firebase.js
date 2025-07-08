// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDc9gBloF0HPjEXm98nc0HnwLzR-6NanCE",
  authDomain: "content-personalization-db77.firebaseapp.com",
  projectId: "content-personalization-db77",
  storageBucket: "content-personalization-db77.firebasestorage.app",
  messagingSenderId: "657389440617",
  appId: "1:657389440617:web:ac15bba4d6b8ee248d9cf8",
  measurementId: "G-FTC9XLQKJ9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };
