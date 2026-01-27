import { addFreq } from '../Services/frequencyService.js';

export function addwDate(freqID, dateStr) {
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

            const result = await addFreq(freqID, dateStr, val);
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