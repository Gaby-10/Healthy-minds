import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase";

export async function createUserDoc(user) {
  if (!user) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  //  Only create document if it does NOT exist
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: user.uid,
      email: user.email,
      partnerId: null,
      createdAt: serverTimestamp(),
    });
  }
}
