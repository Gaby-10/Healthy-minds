import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

const PartnerContext = createContext();

export function usePartner() {
  return useContext(PartnerContext);
}

export function PartnerProvider({ children }) {
  const { user } = useAuth();
  const [partner, setPartner] = useState(null);
  const [partnerLogs, setPartnerLogs] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPartnerData = async () => {
    if (!user) return;
    
    setLoading(true);
    console.log("🔍 Manually fetching partner data");
    
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const partnerId = userData.partnerId;
        
        if (partnerId) {
          const partnerRef = doc(db, "users", partnerId);
          const partnerSnap = await getDoc(partnerRef);
          
          if (partnerSnap.exists()) {
            setPartner({
              id: partnerSnap.id,
              ...partnerSnap.data()
            });
          }
          
          const today = new Date().toISOString().split('T')[0];
          const partnerLogRef = doc(db, "dailyLogs", partnerId, "logs", today);
          const logSnap = await getDoc(partnerLogRef);
          
          if (logSnap.exists()) {
            setPartnerLogs(logSnap.data());
          } else {
            setPartnerLogs(null);
          }
        } else {
          setPartner(null);
          setPartnerLogs(null);
        }
      }
    } catch (error) {
      console.error("Error fetching partner data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearPartnerData = () => {
    setPartner(null);
    setPartnerLogs(null);
    setLoading(false);
  };

  const value = {
    partner,
    partnerLogs,
    loading,
    fetchPartnerData,
    clearPartnerData
  };

  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
}