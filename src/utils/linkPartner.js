import {doc, getDoc, updateDoc} from  "firebase/firestore";
import {db} from "../firebase/firebase"

export async function linkPartner(myUid, partnerUid) {
    if(!partnerUid){
        throw new Error("Partner UID is required");
        
    }
    
    if(myUid === partnerUid){
        throw new Error("You cannot link yourself");
    }

    const myRef = doc(db, "users", myUid);
    const partnerRef = doc (db, "users", partnerUid);

    const partnerSnap = await getDoc(partnerRef);

    if(!partnerSnap.exists()){
        throw new Error("Partner user not found")
    }

    //Link both users

    await updateDoc(myRef, {
        partnerId: partnerUid,
    });

    await updateDoc(partnerRef, {
        partnerId : myUid,
    });
}