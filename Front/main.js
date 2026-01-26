import { calendar } from './Pages/calendar.js';
import { frequency } from './Pages/frequency.js';

document.addEventListener("DOMContentLoaded", () => {
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

    const allNavLinks = document.querySelectorAll('[data-section]');

    allNavLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            const hash = link.getAttribute('href');
            
            history.pushState({ section }, '', hash);
            showSection(section);
            
            if (section === 'calendar') {
                calendar();
            }

            if (section === 'frequency')  {
                frequency();
            }
            
            closeSidebar();
        });
    });

    /*
    const navButtons = {
        calendarBtn: { hash: '#/calendar', section: 'calendar', func: calendar },
    };

    for (const [id, { hash, section, func }] of Object.entries(navButtons)) {
        const btn = document.getElementById(id);
        if (!btn) continue;
        btn.addEventListener('click', e => {
            e.preventDefault();
            history.pushState({ section }, '', hash);
            showSection(section);
            func();
            sidebar.classList.remove('active');
            container.classList.remove('sidebar-open');
        });
    }
    */
    // load correct page on initial load or hash change
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('load', handleHashChange);
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
    switch (hash) {
        case '#/calendar': showSection('calendar'); calendar(); break;
        case '#/frequency': showSection('frequency'); frequency(); break;
        default:
            showSection('calendar');
            calendar();
    }
}

function showSection(section) {
    closeSidebar();
    const sections = ['calendar', 'frequency'];
    sections.forEach(id => {
        const element = document.getElementById(`${id}Section`);
        if (!element) return;

        const isVisible = (id === section);
        element.style.display = isVisible ? 'block' : 'none';
    });

    const allLinks = document.querySelectorAll('[data-section]');
    allLinks.forEach(link => {
        if (link.getAttribute('data-section') === section) {
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


/*
npm install firebase
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
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
