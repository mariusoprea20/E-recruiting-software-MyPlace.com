// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "@firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDTRWNEgVgF1DjNfNtIVEJOlAfGyq3DR84",
  authDomain: "chat-df644.firebaseapp.com",
  projectId: "chat-df644",
  storageBucket: "chat-df644.appspot.com",
  messagingSenderId: "1045459185677",
  appId: "1:1045459185677:web:5d26499feb3c29e9afe544"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);