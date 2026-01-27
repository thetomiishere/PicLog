import { addCell } from '../Services/calendarService.js';

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
            const targetCell = document.getElementById(`cell-${selectedDate}`);
            const isOccupied = targetCell && (
                targetCell.getAttribute('data-has-photo') === 'true' || 
                (targetCell.style.backgroundImage && targetCell.style.backgroundImage !== 'none' && targetCell.style.backgroundImage !== "")
            );
            if (isOccupied) {
                alert(`${selectedDate} 已經有檔案囉！請先刪除舊照片。`);
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