import { db } from '../Configs/firebaseConfig.js';
import { doc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { setDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function calendarService(calendarID, month, year) {
    // const response = {
    //     success: true,
    //     imageUrl: "URL.createObjectURL(file)"
    // };
    // return response;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const entriesRef = collection(db, 'calendars', calendarID, 'entries');
    
    const q = query(entriesRef, 
        where("date", ">=", `${monthStr}-01`),
        where("date", "<=", `${monthStr}-31`)
    );
    try{
        const response = await getDocs(q);
        const entries = response.docs.map(doc => doc.data());
        return {success: true, data: entries};
    } catch (err) {
        console.error("Load failed: ", err);
        return { success: false, data: [] };
    }
}

export async function addCell (calendarID, dateString, file) {
    // const response = {
    //     success: true,
    //     imageUrl: "URL.createObjectURL(file)"
    // };
    // return response;
    try {
        const docRef = doc(db, 'calendars', calendarID, 'entries', dateString);
        const newEntry = {
            imageUrl: file,
            date: dateString,
            updatedAt: new Date().toISOString()
        };
        await setDoc(docRef, newEntry);
        return { success: true, data: newEntry };
    } catch (err) {
        console.error("Save failed: ", err);
        return { success: false };
    }
};

export async function deleteCell(calendarID, dateString) {
    try {
        const docRef = doc(db, 'calendars', calendarID, 'entries', dateString);
        await deleteDoc(docRef);
        return { success: true };
    } catch (err) {
        console.error("Delete failed: ", err);
        return { success: false };
    }
}


// export const uploadEntry = async (file) => {
//     return;
//     console.log("Service: Uploading to Firebase...", { date, file, intensity });
    
//     return {
//         success: true,
//         imageUrl: URL.createObjectURL(file),
//         intensity: intensity
//     };
// };
