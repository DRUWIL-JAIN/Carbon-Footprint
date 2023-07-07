import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
 
const firebaseConfig = {
    apiKey: "AIzaSyA0zcgBJgH0J0r36q6GtIQr4tUl3El0b5k",
    authDomain: "carbon-footprint-monitor.firebaseapp.com",
    projectId: "carbon-footprint-monitor",
    storageBucket: "carbon-footprint-monitor.appspot.com",
    messagingSenderId: "874486662058",
    appId: "1:874486662058:web:c318aa8d795fbbbc3a21d3",
    measurementId: "G-WGME7QQK4T"
};
 
// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const storage = getStorage(app);
 
export { db, storage };