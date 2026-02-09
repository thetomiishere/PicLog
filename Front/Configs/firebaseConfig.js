import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyARURoIhvWYTBM9EzCJmFRBm6Zv1eh4_Pc",
  authDomain: "piclog-95e03.firebaseapp.com",
  projectId: "piclog-95e03",
  storageBucket: "piclog-95e03.firebasestorage.app",
  messagingSenderId: "641119137678",
  appId: "1:641119137678:web:ae9213cc1ffccf87027edf"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const secondaryApp = initializeApp(firebaseConfig, "Secondary");
const secondaryAuth = getAuth(secondaryApp);

export { auth, secondaryAuth, db };
// export const db = getFirestore(app);
// export const auth = getAuth(app);
