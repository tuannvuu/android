import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX.firebaseapp.com",
  projectId: "XXX",
  storageBucket: "XXX.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX",
};

const app = initializeApp(firebaseConfig);

// 🔴 DÒNG NÀY BẮT BUỘC
export const auth = getAuth(app);
