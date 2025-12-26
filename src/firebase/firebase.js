import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAU1hNwBomtvOSvNBT2-yyaqIaG7wd0TAg",
  authDomain: "the-guruji-classes.firebaseapp.com",
  projectId:"the-guruji-classes",
  storageBucket: "the-guruji-classes.firebasestorage.app",
  messagingSenderId:"415965526502",
  appId:"1:415965526502:web:39d72663257ba231f47e27"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);