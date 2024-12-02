// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBCGNaF7I0I3hLVitc6NAahExZpnoZ8b68",
  authDomain: "todo-app3-bc7cc.firebaseapp.com",
  projectId: "todo-app3-bc7cc",
  storageBucket: "todo-app3-bc7cc.firebasestorage.app",
  messagingSenderId: "1955856263",
  appId: "1:1955856263:web:4472572b774680a4037fa",
  measurementId: "G-FTFHJXC9F1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Export the Firebase app instance so you can import it in other files
export default app;

// Export other Firebase services you might need
export { analytics };
export { db };