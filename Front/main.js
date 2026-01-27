import { calendar } from './Pages/calendar.js';
import { frequency } from './Pages/frequency.js';
import { getAllCalendars, getAllFrequencies } from './mainService.js';
import { db } from './Configs/firebaseConfig.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentCalendarID = "";
let currentFreqID  = "";

document.addEventListener("DOMContentLoaded", async () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    const container = document.querySelector('.container');
    // dark/light mode
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }
    // sidebar
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);

    if (menuToggle) {
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation(); 
            sidebar.classList.add('active');
            overlay.classList.add('active');
        });
    }

    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && !sidebar.contains(e.target) && e.target !== menuToggle) {
            closeSidebar();
        }
    });
    // navbar
    await updateNavbar();
    const calendars = await getAllCalendars();
    const frequencies = await getAllFrequencies();
    if (calendars.length > 0) currentCalendarID = calendars[0];
    if (frequencies.length > 0) currentFreqID = frequencies[0];
    if (!window.location.hash || window.location.hash === "#") {
        if (currentCalendarID) {
            window.location.hash = `#/calendar/${currentCalendarID}`;
        } else if (currentFreqID) {
            window.location.hash = `#/frequency/${currentFreqID}`;
        }
    }
    // add calendar
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    if (addCalendarBtn) {
        addCalendarBtn.onclick = async () => {
            const name = await getNameFromModal("新增照片 Calendar");
            if (!name) return;
            const calendarID = name.toLowerCase().replace(/\s+/g, '_');
            try {
                await setDoc(doc(db, 'calendars', calendarID), {
                    createdAt: new Date().toISOString(),
                    name: name
                });
                await updateNavbar();
                // alert(`Calendar "${name}" created!`);
            } catch (err) {
                console.error("Error creating calendar:", err);
            }
        };
    }
    // add frequency
    const addFreqBtn = document.getElementById('addFreqBtn');
    if (addFreqBtn) {
        addFreqBtn.onclick = async () => {
            const result = await getNameFromModal("新增頻率 Tracker", true); 
            if (!result) return;
            
            const { name, color } = result;
            const freqID = name.toLowerCase().replace(/\s+/g, '_');

            try {
                await setDoc(doc(db, 'frequencies', freqID), {
                    createdAt: new Date().toISOString(),
                    name: name,
                    color: color
                });
                await updateNavbar();
            } catch (err) {
                console.error("Error creating frequency:", err);
            }
        };
    }
    // delete calendar
    const deleteCalendarBtn = document.getElementById('deleteCalendarBtn');
    if (deleteCalendarBtn) {
        deleteCalendarBtn.onclick = async () => {
            if (!currentCalendarID) return;
            const confirmDelete = confirm(`Are you sure you want to delete "${currentCalendarID.toUpperCase()}"? This cannot be undone.`);
            
            if (confirmDelete) {
                try {
                    await deleteDoc(doc(db, 'calendars', currentCalendarID));
                    alert("Calendar deleted successfully.");
                    await updateNavbar();
                    window.location.hash = '';
                    
                } catch (err) {
                    console.error("Error deleting calendar:", err);
                    alert("Failed to delete calendar.");
                }
            }
        };
    }
    // delete freq
    const deleteFreqBtn = document.getElementById('deleteFreqBtn');
    if (deleteFreqBtn) {
        deleteFreqBtn.onclick = async () => {
            if (!currentFreqID) return;
            const confirmDelete = confirm(`Are you sure you want to delete "${currentFreqID.toUpperCase()}"? This cannot be undone.`);
            
            if (confirmDelete) {
                try {
                    await deleteDoc(doc(db, 'frequencies', currentFreqID));
                    alert("Freq deleted successfully.");
                    await updateNavbar();
                    window.location.hash = '';
                    
                } catch (err) {
                    console.error("Error deleting freq:", err);
                    alert("Failed to delete freq.");
                }
            }
        };
    }
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
    if (hash.startsWith('#/calendar/')) {
        const tableId = hash.replace('#/calendar/', ''); 
        currentCalendarID = tableId;
        showSection('calendar');
        calendar(tableId);
    } else if (hash.startsWith('#/frequency/')) {
        const freqId = hash.replace('#/frequency/', '');
        currentFreqID = freqId;
        showSection('frequency');
        frequency(freqId);
    } else {
        // default
        if (currentCalendarID) {
            showSection('calendar');
            calendar(currentCalendarID);
        } else{
            hideAllSections();
        }
    }
}

function showSection(section) {
    closeSidebar();
    const sections = ['calendar', 'frequency'];
    sections.forEach(id => {
        const element = document.getElementById(`${id}Section`);
        if (!element) return;
        element.style.display = (id === section) ? 'block' : 'none';
    });

    const allLinks = document.querySelectorAll('.nav-link, [data-section]');
    const currentHash = window.location.hash;
    const activeTableId = currentHash.startsWith('#/calendar/') ? currentHash.replace('#/calendar/', '') : null;

    allLinks.forEach(link => {
        const linkSection = link.getAttribute('data-section');
        const linkId = link.getAttribute('data-id');
        let isActive = false;
        
        if (linkSection === 'frequency' && section === 'frequency') {
            isActive = true;
        } else if (linkSection === 'calendar' && section === 'calendar') {
            isActive = (linkId)? (linkId === activeTableId) : true;
            // if (linkId) {
            //     isActive = (linkId === activeTableId);
            // } else {
            //     isActive = true; 
            // }
        }
        if (isActive) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    const menuItems = document.querySelectorAll('#sidebarMenu a');
    menuItems.forEach(item => item.classList.remove('active'));
    const activeItem = document.querySelector(`#sidebarMenu a[data-section="${section}"]`);
    if (activeItem) activeItem.classList.add('active');
    /*
    const tapeFilePage = document.getElementById('tapeFilePage');
    if (tapeFilePage) tapeFilePage.style.display = 'none';
    */

}

function hideAllSections() {
    const sections = ['calendar', 'frequency'];
    sections.forEach(id => {
        const element = document.getElementById(`${id}Section`);
        if (element) element.style.display = 'none';
    });
    document.querySelectorAll('.nav-link, [data-section]').forEach(link => {
        link.classList.remove('active');
    });
}

async function updateNavbar() {
    const navbar = document.querySelector('.navbar');
    const calendars = await getAllCalendars(); 
    const frequencies = await getAllFrequencies();
    
    navbar.innerHTML = ''; 

    frequencies.forEach(id => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/frequency/${id}" data-section="frequency" data-id="${id}" class="nav-link">${id.toUpperCase()}</a>`;
        navbar.appendChild(div);
    });

    calendars.forEach(id => {
        const div = document.createElement('div');
        div.innerHTML = `<a href="#/calendar/${id}" data-section="calendar" data-id="${id}" class="nav-link">${id.toUpperCase()}</a>`;
        navbar.appendChild(div);
    });
}

// async function updateNavbar() {
//     const navbar = document.querySelector('.navbar');
//     const calendars = await getAllCalendars();
    
//     navbar.innerHTML = ''; 

//     const freqDiv = document.createElement('div');
//     freqDiv.innerHTML = `<a href="#/frequency" data-section="frequency" class="nav-link">Frequency</a>`;
//     navbar.appendChild(freqDiv);

//     calendars.forEach(id => {
//         const div = document.createElement('div');
//         const link = document.createElement('a');
//         link.href = `#/calendar/${id}`;
//         link.className = 'nav-link';
//         link.textContent = id.toUpperCase();
//         link.dataset.section = "calendar";
//         link.dataset.id = id;
//         div.appendChild(link);
//         navbar.appendChild(div);
//     });
// }

function getNameFromModal(title, showColor = false) {
    const modal = document.getElementById('createModal');
    const nameInput = document.getElementById('newInputName');
    const colorInput = document.getElementById('newInputColor');
    const colorContainer = document.getElementById('colorPickerContainer');
    const confirmBtn = document.getElementById('confirmCreateBtn');
    const cancelBtn = document.getElementById('cancelCreateBtn');

    document.getElementById('createModalTitle').textContent = title;
    nameInput.value = "";
    colorInput.value = "#969696";
    
    colorContainer.style.display = showColor ? "block" : "none";
    
    modal.style.display = "flex";
    nameInput.focus();

    return new Promise((resolve) => {
        confirmBtn.onclick = () => {
            const name = nameInput.value.trim();
            if (name) {
                modal.style.display = "none";
                resolve({ name: name, color: colorInput.value });
            }
        };

        cancelBtn.onclick = () => {
            modal.style.display = "none";
            resolve(null);
        };
    });
}