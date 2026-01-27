import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyARURoIhvWYTBM9EzCJmFRBm6Zv1eh4_Pc",
  authDomain: "piclog-95e03.firebaseapp.com",
  projectId: "piclog-95e03",
  storageBucket: "piclog-95e03.firebasestorage.app",
  messagingSenderId: "641119137678",
  appId: "1:641119137678:web:ae9213cc1ffccf87027edf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


/*
npm install firebase
*/
/*
<script type="module">
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyARURoIhvWYTBM9EzCJmFRBm6Zv1eh4_Pc",
    authDomain: "piclog-95e03.firebaseapp.com",
    projectId: "piclog-95e03",
    storageBucket: "piclog-95e03.firebasestorage.app",
    messagingSenderId: "641119137678",
    appId: "1:641119137678:web:ae9213cc1ffccf87027edf"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script> 
*/