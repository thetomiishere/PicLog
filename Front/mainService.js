import { db } from './Configs/firebaseConfig.js';
import { doc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { setDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function getAllCalendars() {
    try {
        const response = await getDocs(collection(db, "calendars"));
        return response.docs.map(doc => doc.id);
    } catch (err) {
        console.error("Error fetching calendars:", err);
        return [];
    }
}

export async function getAllFrequencies() {
    try {
        const response = await getDocs(collection(db, "frequencies"));
        return response.docs.map(doc => doc.id);
    } catch (err) {
        console.error("Error fetching calendars:", err);
        return [];
    }
}

export async function newTable(collectionName, id, data, username) {
    try {
        await setDoc(doc(db, collectionName, id), {
            ...data,
            createdAt: new Date().toISOString()
        });

        if (username && username !== 'admin') {
            const userRef = doc(db, 'users', username);
            await updateDoc(userRef, {
                allowedTables: arrayUnion(id)
            });
        }

        return { success: true };
    } catch (error) {
        console.error("Error in newTable service:", error);
        return { success: false };
    }
}

export async function deleteTable(collectionName, id, username) {
    try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);

        if (username) {
            const userRef = doc(db, 'users', username);
            await updateDoc(userRef, {
                allowedTables: arrayRemove(id)
            });
        }

        return { success: true };
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        return { success: false, error };
    }
}

export async function newUser(username, password, role = 'user') {
    try {
        const userRef = doc(db, 'users', username.toLowerCase());
        await setDoc(userRef, {
            password: password,
            role: role,
            allowedTables: []
        });
        return { success: true };
    } catch (error) {
        console.error("Error creating user:", error);
        return { success: false, error };
    }
}