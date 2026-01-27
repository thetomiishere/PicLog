import { db } from './Configs/firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getAllCalendars() {
    try {
        const response = await getDocs(collection(db, "calendars"));
        return response.docs.map(doc => doc.id);
    } catch (err) {
        console.error("Error fetching calendars:", err);
        return [];
    }
}