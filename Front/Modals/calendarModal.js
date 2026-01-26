import { calendarService, addCell } from '../Services/calendarService.js';

const modal = document.getElementById('uploadModal');
const logDateInput = document.getElementById('logDate');

export function addCalendarModal(onUploadSuccess) {
    // const openBtn = document.getElementById('openModal'); 
    const closeBtn = document.getElementById('closeModal');
    const saveBtn = document.getElementById('saveBtn');

    // Default "+" button behavior (Current Date)
    // openBtn.onclick = () => {
    //     const now = new Date();
    //     const year = now.getFullYear();
    //     const month = String(now.getMonth() + 1).padStart(2, '0');
    //     const day = String(now.getDate()).padStart(2, '0');
        
    //     openModalWithDate(`${year}-${month}-${day}`);
    // };

    closeBtn.onclick = () => modal.style.display = "none";

    saveBtn.onclick = async () => {
        const dateVal = logDateInput.value;
        const file = document.getElementById('photoInput').files[0];

        if (!dateVal || !file) {
            alert("Please select a date and a photo!");
            return;
        }

        const result = await addCell(dateVal, file);
        
        if (result.success) {
            onUploadSuccess(dateVal, result.imageUrl);
            modal.style.display = "none";
        }
    };
}

export function addwDate(dateString) {
    const modal = document.getElementById('uploadModal');
    const logDateInput = document.getElementById('logDate');
    const saveBtn = document.getElementById('saveBtn');
    
    logDateInput.value = dateString;
    modal.style.display = "flex";

    return new Promise((resolve) => {
        saveBtn.onclick = async () => {
            const file = document.getElementById('photoInput').files[0];
            const result = await addCell(dateString, file);
            modal.style.display = "none";
            resolve(result);
        };

        document.getElementById('closeModal').onclick = () => {
            modal.style.display = "none";
            resolve({ success: false });
        };
    });
}
