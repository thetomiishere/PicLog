import { addCell, hasPhoto } from '../Services/calendarService.js';

export function addwDate(calendarID, dateString, username) {
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

            const isOccupied = await hasPhoto(calendarID, selectedDate);
            if (isOccupied) {
                alert(`${selectedDate} 已經有照片囉！`);
                resetInput();
                modal.style.display = "none";
                resolve({ success: false, reason: 'occupied' });
                return;
            }

            const compressedBase64 = await compressImage(file);
            const result = await addCell(calendarID, selectedDate, compressedBase64, username);

            if (result.success) {
                resetInput();
                modal.style.display = "none";
                resolve(result);
            }
        };

        document.getElementById('closeModal').onclick = () => {
            resetInput();
            modal.style.display = "none";
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

function resetInput() {
    const photoInput = document.getElementById('photoInput');
    if (photoInput) photoInput.value = ""; 
}