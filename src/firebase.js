// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCN8K3L6jNqRWJ_whX_m85G1P-5PG-JIwU",
  authDomain: "chatterbox-b72ab.firebaseapp.com",
  projectId: "chatterbox-b72ab",
  storageBucket: "chatterbox-b72ab.firebasestorage.app",
  messagingSenderId: "997255593185",
  appId: "1:997255593185:web:f4719d36dc1252d17a0ba0",
  measurementId: "G-0F7L04D25G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

export { auth, firestore, storage };
