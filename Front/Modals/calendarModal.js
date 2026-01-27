import { calendarService, addCell } from '../Services/calendarService.js';

const modal = document.getElementById('uploadModal');
const logDateInput = document.getElementById('logDate');

export function addCalendarModal(calendarID, onUploadSuccess) {
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

        const result = await addCell(calendarID, dateVal, file);
        
        if (result.success) {
            onUploadSuccess(dateVal, result.imageUrl);
            modal.style.display = "none";
        }
    };
}

export function addwDate(calendarID, dateString) {
    const modal = document.getElementById('uploadModal');
    const logDateInput = document.getElementById('logDate');
    const saveBtn = document.getElementById('saveBtn');
    
    logDateInput.value = dateString;
    modal.style.display = "flex";

    return new Promise((resolve) => {
        saveBtn.onclick = async () => {
            const selectedDate = logDateInput.value;
            const file = photoInput.files[0];
            if (!file) {
                alert("Please select a photo!");
                return;
            }
            const compressedBase64 = await compressImage(file);
            const result = await addCell(calendarID, selectedDate, compressedBase64);

            if (result.success) {
                modal.style.display = "none";
                resolve(result);
            }
        };

        document.getElementById('closeModal').onclick = () => {
            modal.style.display = "none";
            resolve({ success: false });
        };
    });
}

function compressImage(file) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800; 
                const scale = MAX_WIDTH / img.width;
                canvas.width = MAX_WIDTH;
                canvas.height = img.height * scale;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                // 0.7 quality is the "sweet spot" for mobile photos
                resolve(canvas.toDataURL('image/jpeg', 0.7)); 
            };
        };
    });
}