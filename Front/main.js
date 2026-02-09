import { auth, db } from './Configs/firebaseConfig.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged, signOut, updatePassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { ui } from './Pages/dictionary.js';
import { calendar } from './Pages/calendar.js';
import { frequency } from './Pages/frequency.js';
import { getAllCalendars, getAllFrequencies, onTable, newUser, deleteTable, adminResetUserPassword } from './mainService.js';
let currentCalendarID = "";
let currentFreqID  = "";
let session = null;

const EXPIRATION_TIME = 24 * 60 * 60 * 1000;
const localData = JSON.parse(localStorage.getItem("currentUser"));
if (localData) {
    const now = new Date().getTime();
    if (now - localData.loginTime > EXPIRATION_TIME) {
        alert(ui.session_expired);
        handleLogout();
    }
}

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        localStorage.removeItem("currentUser");
        if (!window.location.pathname.includes("login.html")) {
            window.location.href = "login.html";
        }
    } else {
        try {
            const username = user.email.replace('@piclog.app', '');
            const userSnap = await getDoc(doc(db, "users", username));
            
            if (userSnap.exists()) {
                const userData = userSnap.data();
                session = {
                    username: username,
                    role: userData.role || 'user',
                    allowedTables: userData.allowedTables || [],
                    loginTime: new Date().getTime()
                };
                document.getElementById('displayUsername').textContent = username;
                localStorage.setItem("currentUser", JSON.stringify(session));
                initializeApp();
            } else {
                console.error("No user profile found in Firestore.");
                handleLogout();
            }
        } catch (error) {
            console.error("Auth State Error:", error);
        }
    }
});

async function initializeApp() {
    setupTheme();
    setupSidebarToggle();
    setupAdminTools();

    document.getElementById('addCalendarBtn').innerText = ui.add_calendar;
    document.getElementById('addFreqBtn').innerText = ui.add_freq;
    document.getElementById('logoutBtn').innerText = ui.logout;

    await updateSidebar();

    window.addEventListener('hashchange', handleHashChange);
    
    if (!window.location.hash || window.location.hash === "#") {
        const calendars = await getAllCalendars(session);
        const frequencies = await getAllFrequencies(session);
        
        if (calendars.length > 0) {
            const firstId = calendars[0].id || calendars[0]; 
            window.location.hash = `#/calendar/${firstId}`;
        } else if (frequencies.length > 0) {
            const firstId = frequencies[0].id || frequencies[0];
            window.location.hash = `#/frequency/${firstId}`;
        }
    } else {
        handleHashChange();
    }

    setupEventListeners();
}

function setupTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');
    
    themeToggle?.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
}

function setupSidebarToggle() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay') || document.createElement('div');
    
    if (!overlay.parentElement) {
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    menuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.add('active');
        overlay.classList.add('active');
    });

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            closeSidebar();
        }
    });
}

function setupAdminTools() {
    const adminTools = document.getElementById('adminOnlyTools');
    const addUserBtn = document.getElementById('addUserBtn');
    const resetUserPwdBtn = document.getElementById('resetUserPwdBtn');

    if (session.role === 'admin') {
        if (adminTools) adminTools.style.display = 'block';
        if (addUserBtn) {
            addUserBtn.onclick = async () => {
                closeSidebar();
                const username = prompt(ui.new_user_prompt)?.toLowerCase().trim();
                const password = prompt(ui.new_pwd_prompt);
                if (username && password) {
                    const res = await newUser(username, password, session.username);
                    if (res.success) alert(ui.user_created);
                    else alert("Error: " + res.error);
                }
            };
        }
        if (resetUserPwdBtn) {
            resetUserPwdBtn.onclick = async () => {
                closeSidebar();
                const username = prompt("Enter username to reset:").toLowerCase().trim();
                const oldPassword = prompt("Enter user's CURRENT password:");
                const newPassword = prompt("Enter user's NEW password:");

                if (username && oldPassword && newPassword) {
                    const res = await adminResetUserPassword(username, oldPassword, newPassword);
                    if (res.success) {
                        alert(ui.pwd_updated);
                    } else {
                        alert("Reset failed: " + res.error);
                    }
                }
            };
        }
    } else {
        if (adminTools) adminTools.style.display = 'none';
    }
}

function setupEventListeners() {
    document.getElementById('logoutBtn').onclick = (e) => {
        e.preventDefault();
        handleLogout();
    };

    // add Calendar
    document.getElementById('addCalendarBtn').onclick = async () => {
        closeSidebar();
        const nameData = await getNameFromModal("New Photo Calendar");
        if (!nameData) return;
        const id = generateUniqueId();
        
        const res = await onTable('calendars', id, { name: nameData.name }, session.username);
        if (res.success) {
            if (session.role !== 'admin') {
                session.allowedTables.push(id);
                localStorage.setItem("currentUser", JSON.stringify(session));
            }
            await updateSidebar();
            window.location.hash = `#/calendar/${id}`;
        }
    };

    // add Frequency
    document.getElementById('addFreqBtn').onclick = async () => {
        closeSidebar();
        const resModal = await getNameFromModal("New Tracker", true);
        if (!resModal) return;
        const id = generateUniqueId();
        
        const res = await onTable('frequencies', id, { name: resModal.name, color: resModal.color }, session.username);
        if (res.success) {
            if (session.role !== 'admin') {
                session.allowedTables.push(id);
                localStorage.setItem("currentUser", JSON.stringify(session));
            }
            await updateSidebar();
            window.location.hash = `#/frequency/${id}`;
        }
    };

    // delete Calendar
    document.getElementById('deleteCalendarBtn').onclick = async () => {
        if (!currentCalendarID) return;
        if (confirm(`${ui.sure_delete_table} "${currentCalendarID.toUpperCase()}"?`)) {
            const res = await deleteTable('calendars', currentCalendarID, session.username);
            if (res.success) {
                if (session.role !== 'admin') {
                    session.allowedTables = session.allowedTables.filter(t => t !== currentCalendarID);
                    localStorage.setItem("currentUser", JSON.stringify(session));
                }
                alert(ui.deleted_success);
                await updateSidebar();
                window.location.hash = '';
                window.location.reload();
            }
        }
    };

    // delete Frequency
    document.getElementById('deleteFreqBtn').onclick = async () => {
        if (!currentFreqID) return;
        if (confirm(`${ui.sure_delete_table} "${currentFreqID.toUpperCase()}"?`)) {
            const res = await deleteTable('frequencies', currentFreqID, session.username);
            if (res.success) {
                if (session.role !== 'admin') {
                    session.allowedTables = session.allowedTables.filter(t => t !== currentFreqID);
                    localStorage.setItem("currentUser", JSON.stringify(session));
                }
                alert(ui.deleted_success);
                await updateSidebar();
                window.location.hash = '';
                window.location.reload();
            }
        }
    };

    // change password
    const changePwdBtn = document.getElementById('changePwdBtn');
    if (changePwdBtn) {
        changePwdBtn.onclick = async (e) => {
            e.preventDefault();
            const newPassword = prompt(ui.new_pwd_prompt);

            if (!newPassword) return;
            if (newPassword.length < 6) {
                alert(ui.pwd_too_short);
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    await updatePassword(user, newPassword);
                    alert(ui.pwd_updated);
                }
            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    alert(ui.reauth_required);
                } else {
                    alert(error.message);
                }
            }
        };
    }
}

export async function handleLogout() {
    try {
        await signOut(auth);
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout failed", error);
    }
}

function generateUniqueId() {
    return Date.now() + '-' + Math.random().toString(36).substring(2, 6);
}

async function updateSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (!sidebarMenu || !session) return;
    sidebarMenu.innerHTML = '<p style="padding:10px; opacity:0.5;">Loading...</p>';
    
    const [calendars, frequencies] = await Promise.all([
        getAllCalendars(session),
        getAllFrequencies(session)
    ]);

    sidebarMenu.innerHTML = '';
    
    calendars.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/calendar/${item.id}" data-id="${item.id}" class="nav-link">${item.name}</a>`;
        sidebarMenu.appendChild(div);
    });

    frequencies.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/frequency/${item.id}" data-id="${item.id}" class="nav-link">${item.name}</a>`;
        sidebarMenu.appendChild(div);
    });
}

function handleHashChange() {
    const hash = window.location.hash;
    if (!hash || hash === "#" || !session) return;

    const titleDisplay = document.getElementById('currentPageTitle');
    const targetId = decodeURIComponent(hash.split('/').pop());
    
    if (session.role !== 'admin' && !session.allowedTables.includes(targetId)) {
        alert(ui.no_permission);
        window.location.hash = "";
        return;
    }

    const activeNavLink = document.querySelector(`.nav-link[data-id="${targetId}"]`);
    if (titleDisplay) {
        if (activeNavLink) {
            titleDisplay.textContent = activeNavLink.textContent;
        } else {
            titleDisplay.textContent = targetId.replace(/_/g, ' ').toUpperCase();
        }
    }

    if (hash.startsWith('#/calendar/')) {
        currentCalendarID = targetId;
        showSection('calendar');
        calendar(targetId);
    } else if (hash.startsWith('#/frequency/')) {
        currentFreqID = targetId;
        showSection('frequency');
        frequency(targetId);
    }
}

function showSection(section) {
    closeSidebar();
    ['calendar', 'frequency'].forEach(id => {
        const el = document.getElementById(`${id}Section`);
        if (el) el.style.display = (id === section) ? 'block' : 'none';
    });

    const activeId = window.location.hash.split('/').pop();
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('active', link.getAttribute('data-id') === activeId);
    });
}

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

function getNameFromModal(title, showColor = false) {
    const modal = document.getElementById('createModal');
    const nameInput = document.getElementById('newInputName');
    const colorInput = document.getElementById('newInputColor');
    const confirmBtn = document.getElementById('confirmCreateBtn');
    const cancelBtn = document.getElementById('cancelCreateBtn');

    document.getElementById('createModalTitle').textContent = title;
    document.getElementById('colorPickerContainer').style.display = showColor ? "block" : "none";
    
    modal.style.display = "flex";
    nameInput.value = "";
    nameInput.focus();

    return new Promise((resolve) => {
        confirmBtn.onclick = () => {
            const name = nameInput.value.trim();
            if (name) {
                modal.style.display = "none";
                resolve({ name, color: colorInput.value });
            }
        };
        cancelBtn.onclick = () => {
            modal.style.display = "none";
            resolve(null);
        };
    });
}
