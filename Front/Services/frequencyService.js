import { db } from '../Configs/firebaseConfig.js';
import { doc, collection, query, where } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { setDoc, getDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function frequencyService(tableID, year, month) {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const colRef = collection(db, 'frequencies', tableID, 'entries');
    
    const q = query(colRef, 
        where("date", ">=", `${monthStr}-01`),
        where("date", "<=", `${monthStr}-31`)
    );

    try {
        const response = await getDocs(q);
        const entries = {};
        
        response.forEach(doc => {
            entries[doc.id] = doc.data(); 
        });
        return {success: true, data: entries};
    } catch (err) {
        return {};
    }
}

export async function getTableMetadata(id) {
    try {
        const docRef = doc(db, 'frequencies', id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? docSnap.data() : null;
    } catch (e) {
        console.error("Error fetching metadata:", e);
        return null;
    }
}

export async function addFreq(tableID, dateString, count, username) {
    try {
        const cellRef = doc(db, 'frequencies', tableID, 'entries', dateString);
        await setDoc(cellRef, {
            date: dateString, 
            count: Number(count),
            updatedAt: new Date().toISOString(),
            updatedBy: username
        });        
        return { success: true };
    } catch (err) {
        console.error("Freq Save Error:", err);
        return { success: false };
    }
}

export async function deleteFreq(tableID, dateString) {
    try {
        await deleteDoc(doc(db, 'frequencies', tableID, 'entries', dateString));
        return { success: true };
    } catch (err) {
        console.error("Delete Error:", err);
        return { success: false };
    }
}