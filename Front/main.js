import { calendar } from './Pages/calendar.js';
import { frequency } from './Pages/frequency.js';
import { getAllCalendars } from './mainService.js';
import { db } from './Configs/firebaseConfig.js';
import { doc, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let currentCalendarID = "table1";

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
    // add calendar
    const addCalendarBtn = document.getElementById('addCalendarBtn');
    if (addCalendarBtn) {
        addCalendarBtn.onclick = async () => {
            const name = prompt("Enter new calendar name (e.g., table2):");
            if (!name) return;
            const calendarID = name.toLowerCase().replace(/\s+/g, '_');
            try {
                await setDoc(doc(db, 'calendars', calendarID), {
                    createdAt: new Date().toISOString(),
                    name: name
                });
                await updateNavbar();
                alert(`Calendar "${name}" created!`);
            } catch (err) {
                console.error("Error creating calendar:", err);
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
    } else if (hash === '#/frequency') {
        showSection('frequency');
        frequency();
    } else {
        // default
        hideAllSections();
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
    
    navbar.innerHTML = ''; 

    const freqDiv = document.createElement('div');
    freqDiv.innerHTML = `<a href="#/frequency" data-section="frequency" class="nav-link">Frequency</a>`;
    navbar.appendChild(freqDiv);

    calendars.forEach(id => {
        const div = document.createElement('div');
        const link = document.createElement('a');
        link.href = `#/calendar/${id}`;
        link.className = 'nav-link';
        link.textContent = id.toUpperCase();
        link.dataset.section = "calendar";
        link.dataset.id = id;
        div.appendChild(link);
        navbar.appendChild(div);
    });
}
