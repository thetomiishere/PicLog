// trivia.js

export async function updateDate(monthLabel, yearLabel, dateState, currentDisplayDate) {
    if (!currentDisplayDate || !dateState) return;

    dateState.year = currentDisplayDate.getFullYear();
    dateState.month = currentDisplayDate.getMonth();
    
    const displayMonth = String(dateState.month + 1).padStart(2, '0');
    
    if(monthLabel) monthLabel.textContent = displayMonth;
    if(yearLabel) yearLabel.textContent = dateState.year;
}

export async function populateOptions(elementId, start, end, isMonth, dateState, currentDisplayDate, onSelectCallback) {
    const container = document.getElementById(elementId);
    if (!container) return;
    container.innerHTML = '';
    
    for (let i = start; i <= end; i++) {
        const div = document.createElement('div');
        div.className = 'option-item';
        
        const isCurrent = isMonth ? (i === dateState.month) : (i === dateState.year);
        if (isCurrent) div.classList.add('selected');

        div.textContent = isMonth ? String(i + 1).padStart(2, '0') : i;
        
        div.onclick = async () => {
            if (isMonth) currentDisplayDate.setMonth(i);
            else currentDisplayDate.setFullYear(i);
            
            container.classList.remove('active');
            
            if (onSelectCallback) {
                await onSelectCallback();
            }
        };
        container.appendChild(div);
    }
}
