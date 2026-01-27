import { db } from '../Configs/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById('loginBtn');

loginBtn.onclick = async () => {
    const username = document.getElementById('acc').value.trim().toLowerCase();
    const password = document.getElementById('pwd').value.trim();

    try {
        // Look for the document named "admin" (or whatever username was typed)
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.password === password) {
                // SUCCESS! 
                // We "log them in" by saving their info to the browser
                localStorage.setItem("currentUser", JSON.stringify({
                    username: username,
                    role: userData.role,
                    allowedTables: userData.allowedTables || []
                }));

                window.location.href = "index.html"; 
            } else {
                alert("密碼錯誤！");
            }
        } else {
            alert("帳號不存在！");
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
};