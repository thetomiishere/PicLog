import { addwDate } from '../Modals/calendarModal.js';
import { calendarService, deleteCell } from '../Services/calendarService.js';

const currentTable = "table1";

let currentDisplayDate = new Date();
let dateState = {
    year: currentDisplayDate.getFullYear(),
    month: currentDisplayDate.getMonth()
};

export async function calendar() {
    const calendarTitle = document.getElementById('calendarTitle');
    if (calendarTitle) {
        calendarTitle.innerHTML = currentTable.toUpperCase();
    }

    const monthLabel = document.getElementById('monthLabel'); 
    const yearLabel = document.getElementById('yearLabel');
    const dateInput = document.getElementById('calendarDate');
    const prevBtn = document.getElementById('prevMonth');
    const nextBtn = document.getElementById('nextMonth');
    const openBtn = document.getElementById('openModal');

    populateOptions('monthOptions', 0, 11, true);
    populateOptions('yearOptions', 2020, 2030, false);
    
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
        await updateDate(monthLabel, yearLabel, dateInput);
        await renderCalendar(dateState.year, dateState.month);
    };

    nextBtn.onclick = async () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        await updateDate(monthLabel, yearLabel, dateInput);
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

    await updateDate(monthLabel, yearLabel, dateInput);
    await renderCalendar(dateState.year, dateState.month);

}

export async function updateDate(monthLabel, yearLabel, dateInput) {
    dateState.year = currentDisplayDate.getFullYear();
    dateState.month = currentDisplayDate.getMonth();
    
    const displayMonth = String(dateState.month + 1).padStart(2, '0');
    
    if(monthLabel) monthLabel.textContent = displayMonth;
    if(yearLabel) yearLabel.textContent = dateState.year;
    if(dateInput) dateInput.value = `${dateState.year}-${displayMonth}`;
}

function populateOptions(elementId, start, end, isMonth = false) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        const isCurrentMonth = isMonth && i === dateState.month;
        const isCurrentYear = !isMonth && i === dateState.year;

        if (isCurrentMonth || isCurrentYear) {
            div.classList.add('selected');
        }

        div.textContent = isMonth ? String(i + 1).padStart(2, '0') : i;
        
        div.onclick = async () => {
            if (isMonth) currentDisplayDate.setMonth(i);
            else currentDisplayDate.setFullYear(i);
            
            container.classList.remove('active');
            
            const mLabel = document.getElementById('monthLabel');
            const yLabel = document.getElementById('yearLabel');
            const dInput = document.getElementById('calendarDate');

            await updateDate(mLabel, yLabel, dInput);
            await renderCalendar(dateState.year, dateState.month);
            
            populateOptions('monthOptions', 0, 11, true);
            populateOptions('yearOptions', 2020, 2030, false);
        };
        container.appendChild(div);
    }
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
            const hasPhoto = cell.style.backgroundImage && cell.style.backgroundImage !== 'none';
            if (hasPhoto) {
                const confirmOverwrite = confirm("Do you wanna delete and replace it?");
                if (confirmOverwrite) {
                    const result = await deleteCell(currentTable, dateString);
                    if (result.success) {
                        await renderCalendar(dateState.year, dateState.month);
                    }
                    return;
                }
            }
            const result = await addwDate(currentTable, dateString);
            if (result.success) {
                await renderCalendar(dateState.year, dateState.month);
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
        targetCell.style.backgroundSize = "cover";
        targetCell.style.backgroundPosition = "center";
    } else {
        console.error(`Error: Could not find cell with ID cell-${dateString}`);
    }
}