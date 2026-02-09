import { secondaryAuth, db } from './Configs/firebaseConfig.js';
import { createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { setDoc, getDoc, getDocs, updateDoc, arrayUnion, arrayRemove, deleteDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


export async function getAllCalendars(session) {
    try {
        if (!session) return [];
        
        if (session.role === 'admin') {
            const response = await getDocs(collection(db, "calendars"));
            return response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } 
        
        const promises = (session.allowedTables || []).map(id => getDoc(doc(db, "calendars", id)));
        const snaps = await Promise.all(promises);
        
        return snaps
            .filter(s => s.exists())
            .map(s => ({ id: s.id, ...s.data() }));
    } catch (err) {
        console.error("Error fetching calendars:", err);
        return [];
    }
}

export async function getAllFrequencies(session) {
    try {
        if (!session) return [];

        if (session.role === 'admin') {
            const response = await getDocs(collection(db, "frequencies"));
            return response.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        const promises = (session.allowedTables || []).map(id => getDoc(doc(db, "frequencies", id)));
        const snaps = await Promise.all(promises);
        
        return snaps
            .filter(s => s.exists())
            .map(s => ({ id: s.id, ...s.data() }));
        
    } catch (err) {
        console.error("Error fetching frequencies:", err);
        return [];
    }
}

export async function onTable(collectionName, id, data, username) {
    try {
        await setDoc(doc(db, collectionName, id), {
            ...data,
            createdBy: username,
            updatedBy: username,
            createdAt: new Date().toISOString()
        });

        if (username && username !== 'admin') {
            const userRef = doc(db, 'users', username);
            await updateDoc(userRef, {
                allowedTables: arrayUnion(id),
                username: username
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

        if (username && username !== 'admin') {
            const userRef = doc(db, 'users', username);
            await updateDoc(userRef, {
                allowedTables: arrayRemove(id),
                username: username
            });
        }
        return { success: true };
    } catch (error) {
        console.error(`Error deleting from ${collectionName}:`, error);
        return { success: false, error };
    }
}

export async function newUser(username, password) {
    try {
        const email = `${username}@piclog.app`;
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", username), {
            uid: uid,
            email: email,
            role: "user",
            allowedTables: [],
            createdAt: new Date().toISOString()
        });

        await signOut(secondaryAuth);

        return { success: true };
    } catch (error) {
        console.error("User Creation Error:", error);
        return { success: false, error: error.message };
    }
}

export async function adminResetUserPassword(username, oldPassword, newPassword) {
    try {
        const email = `${username}@piclog.app`;
        const userCred = await signInWithEmailAndPassword(secondaryAuth, email, oldPassword);
        await updatePassword(userCred.user, newPassword);
        await signOut(secondaryAuth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}