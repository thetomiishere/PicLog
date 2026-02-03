import { ui } from './Pages/dictionary.js';
const session = JSON.parse(localStorage.getItem("currentUser"));
const EXPIRATION_TIME = 24 * 60 * 60 * 1000;
if (!session) {
    window.location.href = "login.html";
} else {
    const now = new Date().getTime();
    if (now - session.loginTime > EXPIRATION_TIME) {
        alert(ui.session_expired);
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    } else {
        console.log(`${ui.welcome}, ${session.username}`);
    }
}

import { calendar } from './Pages/calendar.js';
import { frequency } from './Pages/frequency.js';
import { getAllCalendars, getAllFrequencies, onTable, newUser, deleteTable } from './mainService.js';
let currentCalendarID = "";
let currentFreqID  = "";

export function handleLogout() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

document.addEventListener("DOMContentLoaded", async () => {
    const displayUsername = document.getElementById('displayUsername');
    if (session && displayUsername) {
        displayUsername.textContent = session.username;
    }
    
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const themeToggle = document.getElementById('themeToggle');
    const adminTools = document.getElementById('adminOnlyTools');
    const addUserBtn = document.getElementById('addUserBtn');
    
    // dark/light mode
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        location.reload();
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    // sidebar
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

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

    document.getElementById('addCalendarBtn').style.display = 'block';
    document.getElementById('addFreqBtn').style.display = 'block';
    document.getElementById('deleteCalendarBtn').style.display = 'block';
    document.getElementById('deleteFreqBtn').style.display = 'block';

    document.getElementById('addCalendarBtn').innerText = ui.add_calendar;
    document.getElementById('addFreqBtn').innerText = ui.add_freq;
    // add user
    if (session.role === 'admin') {
        if (adminTools) adminTools.style.display = 'block';
        if (addUserBtn) {
            addUserBtn.onclick = async () => {
                closeSidebar();
                const username = prompt(ui.new_user_prompt).toLowerCase().trim();
                const password = prompt(ui.new_pwd_prompt);
                if (username && password) {
                    const res = await newUser(username, password, session.username);
                    if (res.success) alert(ui.user_created);
                }
            };
        }
    } else {
        if (adminTools) adminTools.style.display = 'none';
        if (addUserBtn) addUserBtn.style.display = 'none';
    }
    // sidebar
    await updateSidebar();

    const allCals = await getAllCalendars();
    const allFreqs = await getAllFrequencies();
    
    const allowedCals = session.role === 'admin' ? allCals : allCals.filter(id => session.allowedTables.includes(id));
    const allowedFreqs = session.role === 'admin' ? allFreqs : allFreqs.filter(id => session.allowedTables.includes(id));

    if (allowedCals.length > 0) currentCalendarID = allowedCals[0];
    if (allowedFreqs.length > 0) currentFreqID = allowedFreqs[0];

    if (!window.location.hash || window.location.hash === "#") {
        if (currentCalendarID) window.location.hash = `#/calendar/${currentCalendarID}`;
        else if (currentFreqID) window.location.hash = `#/frequency/${currentFreqID}`;
    }
    // add calendar
    document.getElementById('addCalendarBtn').onclick = async () => {
        closeSidebar();
        const nameData = await getNameFromModal("New Photo Calendar");
        if (!nameData) return;
        const id = nameData.name.toLowerCase().replace(/\s+/g, '_');
        
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
    // add frequency
    document.getElementById('addFreqBtn').onclick = async () => {
        closeSidebar();
        const resModal = await getNameFromModal("New Tracker", true);
        if (!resModal) return;
        const id = resModal.name.toLowerCase().replace(/\s+/g, '_');
        
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
    // delete calendar
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
            } else {
                alert(ui.deleted_failed);alert(ui.deleted_failed);
            }
        }
    };
    // delete freq
    document.getElementById('deleteFreqBtn').onclick = async () => {
        if (!currentFreqID) return;
        if (confirm(`${ui.sure_delete_table} "${currentCalendarID.toUpperCase()}"?`)) {
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
            } else {
                alert(ui.deleted_failed);alert(ui.deleted_failed);
            }
        }
    };
    // logout
    document.getElementById('logoutBtn').innerText = ui.logout;
    document.getElementById('logoutBtn').onclick = (e) => {
        e.preventDefault();
        handleLogout();
    };
    // load correct page on initial load or hash change
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    // window.addEventListener('load', handleHashChange);
});

function closeSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar) sidebar.classList.remove('active');
    if (container) container.classList.remove('sidebar-open');
    if (overlay) overlay.classList.remove('active');
}

function handleHashChange() {
    const hash = window.location.hash;
    if (!hash || hash === "#") return;
    const titleDisplay = document.getElementById('currentPageTitle');
    const targetId = decodeURIComponent(hash.split('/').pop());
    const cleanTitle = targetId.replace(/_/g, ' ').toUpperCase();
    const activeNavLink = document.querySelector(`.nav-link[data-id="${targetId}"]`);
    if (titleDisplay) {
        titleDisplay.textContent = activeNavLink ? activeNavLink.textContent : cleanTitle;
    }

    if (session.role !== 'admin' && !session.allowedTables.includes(targetId)) {
        alert(ui.no_permission);
        window.location.hash = "";
        return;
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

    /*
    const tapeFilePage = document.getElementById('tapeFilePage');
    if (tapeFilePage) tapeFilePage.style.display = 'none';
    */
}

async function updateSidebar() {
    const sidebarMenu = document.getElementById('sidebarMenu');
    if (!sidebarMenu || !session) return;

    sidebarMenu.innerHTML = '';
    const [allCals, allFreqs] = await Promise.all([
        getAllCalendars(),
        getAllFrequencies()
    ]);
    // const allCals = await getAllCalendars();
    // const allFreqs = await getAllFrequencies();

    const calendars = session.role === 'admin' ? allCals : allCals.filter(id => session.allowedTables.includes(id));
    const frequencies = session.role === 'admin' ? allFreqs : allFreqs.filter(item => session.allowedTables.includes(item.id));

    if (calendars.length === 0 && frequencies.length === 0) {
        sidebarMenu.innerHTML = `<p style="padding:10px; font-size:0.8rem; opacity:0.5;">${ui.no_tables}</p>`;
        return;
    }

    calendars.forEach(id => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/calendar/${id}" data-section="calendar" data-id="${id}" class="nav-link">${id.toUpperCase()}</a>`;
        sidebarMenu.appendChild(div);
    });

    frequencies.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/frequency/${item.id}" data-section="frequency" data-id="${item.id}" class="nav-link">${item.name}</a>`;
        sidebarMenu.appendChild(div);
    });
}

function getNameFromModal(title, showColor = false) {
    const modal = document.getElementById('createModal');
    const nameInput = document.getElementById('newInputName');
    const colorInput = document.getElementById('newInputColor');
    document.getElementById('createModalTitle').textContent = title;
    document.getElementById('colorPickerContainer').style.display = showColor ? "block" : "none";
    
    modal.style.display = "flex";
    nameInput.value = "";
    nameInput.focus();

    return new Promise((resolve) => {
        document.getElementById('confirmCreateBtn').onclick = () => {
            const name = nameInput.value.trim();
            if (name) {
                modal.style.display = "none";
                resolve({ name, color: colorInput.value });
            }
        };
        document.getElementById('cancelCreateBtn').onclick = () => {
            modal.style.display = "none";
            resolve(null);
        };
    });
}