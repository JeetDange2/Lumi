import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDmPYTmicOI-DpmBOqm6-2tIMUd2KZmBKs",
    authDomain: "hactathon-cbf17.firebaseapp.com",
    projectId: "hactathon-cbf17",
    storageBucket: "hactathon-cbf17.firebasestorage.app",
    messagingSenderId: "144120189819",
    appId: "1:144120189819:web:e62ddaacab4d6fc05523de"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication and get a reference to the service
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
