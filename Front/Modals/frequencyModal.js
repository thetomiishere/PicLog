import { addFreq } from '../Services/frequencyService.js';

export function addwDate(freqID, dateStr, username) {
    const modal = document.getElementById('frequencyModal');
    const dateInput = document.getElementById('freqLogDate');
    const numInput = document.getElementById('freqNumber');
    const saveBtn = document.getElementById('saveFreqBtn');
    const closeBtn = document.getElementById('closeFreqModal');

    dateInput.value = dateStr;
    numInput.value = ""; 
    modal.style.display = "flex";
    numInput.focus();

    return new Promise((resolve) => {
        const cleanup = () => {
            modal.style.display = "none";
            saveBtn.onclick = null;
            closeBtn.onclick = null;
        };

        saveBtn.onclick = async () => {
            const val = numInput.value.trim();
            
            if (val === "") {
                alert("Please enter a value");
                return;
            }

            const result = await addFreq(freqID, dateStr, val, username);
            if (result.success) {
                cleanup();
                resolve({ success: true });
            } else {
                alert("Failed to save. Check console for details.");
            }
        };

        closeBtn.onclick = () => {
            cleanup();
            resolve({ success: false });
        };
    });
}

export function editTableName(currentName) {
    const modal = document.getElementById('createModal');
    const nameInput = document.getElementById('newInputName');
    const colorContainer = document.getElementById('colorPickerContainer');
    document.getElementById('createModalTitle').textContent = "編輯表格名稱";
    colorContainer.style.display = "none";
    
    modal.style.display = "flex";
    nameInput.value = currentName;
    nameInput.focus();

    return new Promise((resolve) => {
        document.getElementById('confirmCreateBtn').onclick = () => {
            const name = nameInput.value.trim();
            if (name) {
                modal.style.display = "none";
                resolve(name);
            }
        };
        document.getElementById('cancelCreateBtn').onclick = () => {
            modal.style.display = "none";
            resolve(null);
        };
    });
}