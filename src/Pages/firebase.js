import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
 
const firebaseConfig = {
    apiKey: "Add your own API key here",
    authDomain: "Add your own auth domain here",
    projectId: "Add your own project id here",
    storageBucket: "add your own storage bucket here",
    messagingSenderId: "add your own sender id here",
    appId: "add your own app id here",
    measurementId: "add your own measurement id here"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);
 
export { db, storage };