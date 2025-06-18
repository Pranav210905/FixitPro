import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// In a production environment, these values should be in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyD9J-BFJFLDIuuT4HzQl5FUH6BRu2ic_RA",
  authDomain: "homefixpro-cebe3.firebaseapp.com",
  projectId: "homefixpro-cebe3",
  storageBucket: "homefixpro-cebe3.firebasestorage.app",
  messagingSenderId: "333812773868",
  appId: "1:333812773868:web:56208bd12c01df3db346c9"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);

export default app;
