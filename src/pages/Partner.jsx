import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserDoc } from "../utils/getUserDoc";
import { linkPartner } from "../utils/linkPartner";
import "../styles/Partner.css";
function Partner() {
  const { user } = useAuth();

  const [userData, setUserData] = useState(null);
  const [partnerUid, setPartnerUid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Load current user's Firestore profile

  useEffect(() => {
    if (!user) return;

    async function loadUser() {
      const data = await getUserDoc(user.uid);
      setUserData(data);
      setLoading(false);
    }

    loadUser();
  }, [user]);

  if(!userData){
    return <p> Loading partner info...</p>
  }

  // Handle partner linking

  const handlePartnerLinking = async () => {
    try {
      await linkPartner(user.uid, partnerUid);
      const updated = await getUserDoc(user.uid);
      setUserData(updated);
      setPartnerUid("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading partner info...</p>;

  return (
    <div className="partner-page">
      <h2 className="partner-title">Partner</h2>

      <div className="partner-card">
        {userData.partnerId ? (
          <div>
            <p className="partner-success"> Partner linked successfully</p>
            <p className="partner-info">
              {" "}
              <strong>Partner UID : </strong>
            </p>

            <div className="partner-uid">{userData.partnerId}</div>
          </div>
        ) : (
          <div>
            <p className="partner-info">No partner linked yet</p>
            <p className="partner-info">
              <strong>UID :</strong>
            </p>

            <div className="partner-uid">{user.uid}</div>

            <div className="partner-input-group">
              <input
                className="partner-input"
                placeholder="Enter partner UID"
                value={partnerUid}
                onChange={(e) => setPartnerUid(e.target.value)}
              />

              <button className="partner-btn" onClick={handlePartnerLinking}>
                Link partner
              </button>
            </div>

            {error && <p className="partner-error">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}


export default Partner;

//EUFzlr5jriZYM85oK2ZLBQaMGPs1    uid