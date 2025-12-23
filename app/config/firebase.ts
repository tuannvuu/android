import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Dùng cho Realtime Database

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

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app); // Biến db này giờ dùng cho Realtime Database