import {doc, setDoc, serverTimestamp} from "firebase/firestore";
import { db } from "../firebase/firebase";


export async function saveDailyLog(uid , data) {
    if (!uid) return ;

    const today = new Date().toISOString().split("T")[0];

    const ref = doc(db, "dailyLogs", uid, "logs", today);
   
    await setDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
    });
}
     
