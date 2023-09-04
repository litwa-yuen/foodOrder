import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  //...
};

const firebaseApp = initializeApp(firebaseConfig);
const firebaseDB = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);
const GoogleAuth = new GoogleAuthProvider();

export { firebaseDB, firebaseAuth, GoogleAuth };
