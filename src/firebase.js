import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// جلب المفاتيح من ملف البيئة السري مع قيم احتياطية للوقاية
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForLocalDevTest123456789",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "maraseem-dummy.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "maraseem-dummy",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "maraseem-dummy.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

// تهيئة التطبيق وربطه بخدمات المصادقة وقاعدة البيانات
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
