import { addwDate } from '../Modals/frequencyModal.js';
import { populateOptions, updateDate } from './trivia.js';
import { frequencyService, getTableMetadata, deleteFreq } from '../Services/frequencyService.js';

let currentTable = "";

let currentDisplayDate = new Date();
let dateState = {
    year: currentDisplayDate.getFullYear(),
    month: currentDisplayDate.getMonth()
};

export async function frequency(freqID) {
    currentTable = freqID;
    const freqTitle = document.getElementById('freqTitle');
    if (freqTitle) {
        freqTitle.innerHTML = currentTable.toUpperCase();
    }

    const monthLabel = document.getElementById('monthLabelFreq'); 
    const yearLabel = document.getElementById('yearLabelFreq');
    const prevBtn = document.getElementById('prevMonthFreq');
    const nextBtn = document.getElementById('nextMonthFreq');
    const openBtn = document.getElementById('openFreqModal');

    populateOptions('monthOptionsFreq', 0, 11, true, dateState, currentDisplayDate, handleRefresh);
    populateOptions('yearOptionsFreq', 2020, 2030, false, dateState, currentDisplayDate, handleRefresh);

    monthLabel.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('monthOptionsFreq').classList.toggle('active');
        document.getElementById('yearOptionsFreq').classList.remove('active');
    };

    yearLabel.onclick = (e) => {
        e.stopPropagation();
        document.getElementById('yearOptionsFreq').classList.toggle('active');
        document.getElementById('monthOptionsFreq').classList.remove('active');
    };

    window.onclick = () => {
        document.getElementById('monthOptionsFreq').classList.remove('active');
        document.getElementById('yearOptionsFreq').classList.remove('active');
    };

    prevBtn.onclick = async () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
        await renderFreq(dateState.year, dateState.month);
    };

    nextBtn.onclick = async () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
        await renderFreq(dateState.year, dateState.month);
    };

    openBtn.onclick = async () => {
        const now = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const result = await addwDate(currentTable, today);
        if (result.success) {
            await renderFreq(dateState.year, dateState.month);
        }
    };

    await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
    await renderFreq(dateState.year, dateState.month);
}

export async function renderFreq(year, month) {
    const grid = document.getElementById('frequencyGrid');
    if (!grid) return;

    const dayNames = grid.querySelectorAll('.day-name');
    grid.innerHTML = '';
    dayNames.forEach(day => grid.appendChild(day));

    const response = await frequencyService(currentTable, year, month + 1);
    const data = response.data || {};

    const tableMetadata = await getTableMetadata(currentTable); 
    const themeColor = tableMetadata?.color || "#969696";
    
    const values = Object.values(data).map(d => Number(d.count || 0));
    const maxVal = values.length > 0 ? Math.max(...values) : 10;
    const minVal = values.length > 0 ? Math.min(...values) : 0;
    const range = maxVal - minVal;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'day-cell empty-cell';
        grid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.className = 'day-cell';

        const mm = String(month + 1).padStart(2, '0');
        const dd = String(day).padStart(2, '0');
        const dateString = `${year}-${mm}-${dd}`;
        cell.id = `cell-${dateString}`;
        cell.innerHTML = `<span>${day}</span>`;

        if (data && data[dateString]) {
            cell.setAttribute('data-has-data', 'true');
            const currentVal = Number(data[dateString].count || 0);
            let scale = 1;
            if (range > 0) {
                scale = ((currentVal - minVal) / range) * 9 + 1;
            } else if (currentVal > 0) {
                scale = 10;
            }
            applyIntensityStyle(cell, scale, themeColor);
        }

        cell.onclick = async () => {
            const hasData = cell.getAttribute('data-has-data') === 'true';
            if (hasData) {
                const confirmOverwrite = confirm("Do you wanna delete and replace it?");
                if (confirmOverwrite) {
                    const result = await deleteFreq(currentTable, dateString);
                    if (result.success) {
                        await renderFreq(dateState.year, dateState.month);
                    }
                }
            } else {
                const result = await addwDate(currentTable, dateString);
                if (result.success) {
                    await renderFreq(dateState.year, dateState.month);
                }
            }
        };
        grid.appendChild(cell);
    }
}

function applyIntensityStyle(cell, scale, hexColor) {
    const opacity = scale / 10;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    cell.style.backgroundColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    if (scale > 1) {
        cell.style.border = `1px solid rgba(${r}, ${g}, ${b}, 0.2)`;
    }
    cell.style.color = opacity > 0.5 ? "#fff" : "var(--text-main)";
}

const handleRefresh = async () => {
    await updateDate(monthLabel, yearLabel, dateState, currentDisplayDate);
    await renderCalendar(dateState.year, dateState.month);
    populateOptions('monthOptions', 0, 11, true, dateState, currentDisplayDate, handleRefresh);
    populateOptions('yearOptions', 2020, 2030, false, dateState, currentDisplayDate, handleRefresh);
};