// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9V9KxO7-sjRy9TBq1FIazoqAU3z7O4G0",
  authDomain: "agendapro-web.firebaseapp.com",
  projectId: "agendapro-web",
  storageBucket: "agendapro-web.firebasestorage.app",
  messagingSenderId: "827731454578",
  appId: "1:827731454578:web:3a191d74baf0aee78eb0eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services to be used elsewhere in your app
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);