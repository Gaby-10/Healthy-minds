import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBx0E2PXxXWKVi9F23bDeLu0tQ9JAt4_Jc",
  authDomain: "healthy-minds-65968.firebaseapp.com",
  projectId: "healthy-minds-65968",
  appId: "1:536258518878:web:7f6cd19dd5eda256d779cf",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

