import { db } from '../Configs/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

const loginBtn = document.getElementById('loginBtn');
const pwdInput = document.getElementById('pwd');
const accInput = document.getElementById('acc');
const showPwdCheckbox = document.getElementById('showPwd');

showPwdCheckbox.onchange = () => {
    pwdInput.type = showPwdCheckbox.checked ? 'text' : 'password';
};

// 3. Hit Enter to Login
[accInput, pwdInput].forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
});

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
                const now = new Date().getTime();
                localStorage.setItem("currentUser", JSON.stringify({
                    username: username,
                    role: userData.role,
                    allowedTables: userData.allowedTables || [],
                    loginTime: now
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