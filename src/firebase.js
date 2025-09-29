import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCcInnE8iaHFwBJhDDynBhDsYdwTyULLhI",
  authDomain: "innovision-6835e.firebaseapp.com",
  databaseURL: "https://innovision-6835e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "innovision-6835e",
  storageBucket: "innovision-6835e.appspot.com",
  messagingSenderId: "244864762149",
  appId: "1:244864762149:web:d07c63af7d5760ef03dacc"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
