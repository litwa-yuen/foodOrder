import { initializeApp } from "firebase/app";

import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const firebaseConfig = {
  //FIREBAE_CONFIG
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
