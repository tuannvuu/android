import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyDICFea2S38RMJmqZiKsTIXlg4xTkNEewM",
  authDomain: "lidora-b6d61.firebaseapp.com",
  projectId: "lidora-b6d61",
  storageBucket: "lidora-b6d61.firebasestorage.app",
  messagingSenderId: "347381959138",
  appId: "1:347381959138:web:8d974795eaf48fbd6ad1bb",
  measurementId: "G-75YB0T8WQM",
  // Thêm dòng này từ hình ảnh console của bạn
  databaseURL: "https://lidora-b6d61-default-rtdb.asia-southeast1.firebasedatabase.app" 
};

// Init app (chống Expo reload)
const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// ✅ Auth (Expo OK, KHÔNG CRASH)
const auth = getAuth(app);

// Database
const db = getDatabase(app);

export { app, auth, db };

