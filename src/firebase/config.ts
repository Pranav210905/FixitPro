import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase configuration
// In a production environment, these values should be in environment variables
const firebaseConfig = {
  apiKey: "AIzaSyBG_2JFuHnQmGEx6WUAYlB1utjwKoyn1Kg",
  authDomain: "home-d32c2.firebaseapp.com",
  projectId: "home-d32c2",
  storageBucket: "home-d32c2.appspot.com",
  messagingSenderId: "657371589214",
  appId: "1:657371589214:web:07f2bf68c411ad0b9be2cf",
  measurementId: "G-F3QRBEM9TW"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);

export default app;