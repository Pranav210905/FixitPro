import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// In a production environment, these values should be in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyDV8rJR3q28K7ZkHcbcfjXLZafFqc8vu-I",
  authDomain: "home-service-b16c5.firebaseapp.com",
  projectId: "home-service-b16c5",
  storageBucket: "home-service-b16c5.firebasestorage.app",
  messagingSenderId: "684934498368",
  appId: "1:684934498368:web:09a364961718d80282f7a5"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);

export default app;
