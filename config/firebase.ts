import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  // @ts-ignore
  getReactNativePersistence,
  indexedDBLocalPersistence,
  initializeAuth
} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: "AIzaSyDICFea2S38RMJmqZiKsTIXlg4xTkNEewM",
  authDomain: "lidora-b6d61.firebaseapp.com",
  projectId: "lidora-b6d61",
  storageBucket: "lidora-b6d61.firebasestorage.app",
  messagingSenderId: "347381959138",
  appId: "1:347381959138:web:8d974795eaf48fbd6ad1bb",
  measurementId: "G-75YB0T8WQM"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app);

// Khởi tạo Auth với kiểm tra môi trường
export const auth = initializeAuth(app, {
  persistence: Platform.OS === 'web' 
    ? [indexedDBLocalPersistence, browserLocalPersistence] 
    : getReactNativePersistence(ReactNativeAsyncStorage)
});

export { app };

