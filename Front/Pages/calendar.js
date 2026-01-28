import { addwDate } from '../Modals/calendarModal.js';
import { populateOptions, updateDate } from './trivia.js';
import { calendarService, deleteCell } from '../Services/calendarService.js';

let currentTable = "";

let currentDisplayDate = new Date();
let dateState = {
    year: currentDisplayDate.getFullYear(),
    month: currentDisplayDate.getMonth()
};

export async function calendar(calendarID) {
    currentTable = calendarID;
    // const calendarTitle = document.getElementById('calendarTitle');
    // if (calendarTitle) {
    //     calendarTitle.innerHTML = currentTable.toUpperCase();
    // }

    const monthLabel = document.getElementById('monthLabel'); 
    const yearLabel = document.getElementById('yearLabel');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const openBtn = document.getElementById('openModal');

    populateOptions('monthOptions', 0, 11, true, dateState, currentDisplayDate, handleRefresh);
    populateOptions('yearOptions', 2020, 2030, false, dateState, currentDisplayDate, handleRefresh);
    
    monthLabel.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('monthOptions').classList.toggle('active');
        document.getElementById('yearOptions').classList.remove('active');
    };

    yearLabel.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('yearOptions').classList.toggle('active');
        document.getElementById('monthOptions').classList.remove('active');
    };

    window.onclick = () => {
        document.getElementById('monthOptions').classList.remove('active');
        document.getElementById('yearOptions').classList.remove('active');
    };

    prevBtn.onclick = async () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
        await renderCalendar(dateState.year, dateState.month);
    };

    nextBtn.onclick = async () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
        await renderCalendar(dateState.year, dateState.month);
    };

    openBtn.onclick = async () => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const result = await addwDate(currentTable, today);
        if (result.success) {
            await renderCalendar(dateState.year, dateState.month);
        }
    };

    await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
    await renderCalendar(dateState.year, dateState.month);

}

export async function renderCalendar(year, month) {
    const calendarElement = document.getElementById('calendar');
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    calendarElement.innerHTML = '';
    
    dayNames.forEach(name => {
        const div = document.createElement('div');
        div.className = 'day-name';
        div.innerText = name;
        calendarElement.appendChild(div);
    });

    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty-cell';
        calendarElement.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateString = `${year}-${mm}-${dd}`;
        
        cell.id = `cell-${dateString}`;
        cell.innerHTML = `<span>${day}</span>`;
        cell.onclick = async () => {
            const hasPhoto = cell.getAttribute('data-has-photo') === 'true';
            if (hasPhoto) {
                const confirmOverwrite = confirm("Do you wanna delete and replace it?");
                if (confirmOverwrite) {
                    const result = await deleteCell(currentTable, dateString);
                    if (result.success) {
                        await renderCalendar(dateState.year, dateState.month);
                    }
                    return;
                }
            } else {
                const result = await addwDate(currentTable, dateString);
                if (result.success) {
                    await renderCalendar(dateState.year, dateState.month);
                }
            }
        };

        calendarElement.appendChild(cell);
    }

    try {
        const response = await calendarService(currentTable, month + 1, year);
        
        if (response.success && Array.isArray(response.data)) {
            response.data.forEach(entry => {
                populateCell(entry.date, entry.imageUrl);
            });
        }
    } catch (error) {
        console.error("Failed to fetch calendar entries:", error);
    }
}

export function populateCell(dateString, imageUrl) {    
    const targetCell = document.getElementById(`cell-${dateString}`);

    if (targetCell) {
        targetCell.style.backgroundImage = `url(${imageUrl})`;
        targetCell.setAttribute('data-has-photo', 'true');
    } else {
        targetCell.style.backgroundImage = 'none';
        targetCell.removeAttribute('data-has-photo');
        console.error(`Error: Could not find cell with ID cell-${dateString}`);
    }
}

const handleRefresh = async () => {
    await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
    await renderCalendar(dateState.year, dateState.month);
    // Refresh the dropdown lists to show new 'selected' state
    populateOptions('monthOptions', 0, 11, true, dateState, currentDisplayDate, handleRefresh);
    populateOptions('yearOptions', 2020, 2030, false, dateState, currentDisplayDate, handleRefresh);
};