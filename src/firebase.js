import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDC0V_Ohrgms1GLbHERl8cKla4nsRBhUM0",
  authDomain: "africannationsleague.firebaseapp.com",
  projectId: "africannationsleague",
  storageBucket: "africannationsleague.appspot.com",
  messagingSenderId: "100706818285476151154",
  appId: "1:100706818285476151154:web:africannationsleague"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
