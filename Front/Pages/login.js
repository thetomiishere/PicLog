import { db } from '../Configs/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { ui } from './dictionary.js';

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
}

const loginBtn = document.getElementById('loginBtn');
const accInput = document.getElementById('acc');
const pwdInput = document.getElementById('pwd');
const showPwdCheckbox = document.getElementById('showPwd');

document.title = ui.login_title;
document.getElementById('loginTitle').innerText = ui.login_title;
loginBtn.innerText = ui.login_btn;
accInput.placeholder = ui.account;
pwdInput.placeholder = ui.password;

const showPwdLabel = document.querySelector('label[for="showPwd"]');
if (showPwdLabel) {
    showPwdLabel.innerText = ui.show_password;
}
showPwdCheckbox.onchange = () => {
    pwdInput.type = showPwdCheckbox.checked ? 'text' : 'password';
};

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
        const userRef = doc(db, "users", username);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            const userData = userSnap.data();

            if (userData.password === password) {
                const now = new Date().getTime();
                localStorage.setItem("currentUser", JSON.stringify({
                    username: username,
                    role: userData.role,
                    allowedTables: userData.allowedTables || [],
                    loginTime: now
                }));

                window.location.href = "index.html"; 
            } else {
                alert(ui.error_pwd);
            }
        } else {
            alert(ui.error_no_user);
        }
    } catch (error) {
        console.error("Login Error:", error);
    }
};