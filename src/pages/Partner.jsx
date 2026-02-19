import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserDoc } from "../utils/getUserDoc";
import { linkPartner } from "../utils/linkPartner";
import { usePartner } from "../context/PartnerContext";
import "../styles/Partner.css";

function Partner() {
  const { user } = useAuth();
  const { partner, partnerLogs, loading: partnerLoading, fetchPartnerData, clearPartnerData } = usePartner();

  const [userData, setUserData] = useState(null);
  const [partnerUid, setPartnerUid] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showUid, setShowUid] = useState(false);

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

  // Fetch partner data when component mounts and when userData changes
  useEffect(() => {
    if (userData?.partnerId) {
      console.log("📱 Partner page mounted, fetching partner data");
      fetchPartnerData();
    } else {
      clearPartnerData();
    }
    
    // Cleanup when component unmounts
    return () => {
      console.log("🧹 Partner page unmounting");
      clearPartnerData();
    };
  }, [userData?.partnerId]);

  if (!userData) {
    return <p>Loading partner info...</p>;
  }

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

  // Calculate totals from partner's meals
  const calculateTotals = () => {
    if (!partnerLogs?.meals) return { calories: 0, protein: 0 };
    
    let calories = 0;
    let protein = 0;
    
    Object.values(partnerLogs.meals).forEach(mealArray => {
      if (Array.isArray(mealArray)) {
        mealArray.forEach(item => {
          calories += (item.food?.calories || 0) * (item.servings || 1);
          protein += (item.food?.protein || 0) * (item.servings || 1);
        });
      }
    });
    
    return { calories, protein };
  };

  const totals = calculateTotals();
  const calorieGoal = partnerLogs?.calorieGoal || 2000;
  const proteinGoal = partnerLogs?.proteinGoal || 100;

  return (
    <div className="partner-page">
      {/* Header with minimal partner info */}
      <div className="partner-header">
        <h2 className="partner-title">Partner Dashboard</h2>
        {userData.partnerId && (
          <div className="partner-badge" onClick={() => setShowUid(!showUid)}>
            <span className="badge-dot"></span>
            <span>Partner Connected</span>
            {showUid && (
              <span className="uid-tooltip">{userData.partnerId}</span>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area - Fixed Height */}
      <div className="partner-content">
        {/* Left Column - Partner Linking */}
        <div className="partner-sidebar">
          {!userData.partnerId ? (
            <div className="link-card">
              <h3>Connect with Partner</h3>
              <p className="info-text">Share your UID with your partner to connect</p>
              
              <div className="uid-display">
                <label>Your UID</label>
                <div className="uid-box">{user.uid}</div>
              </div>

              <div className="link-form">
                <label>Partner's UID</label>
                <input
                  type="text"
                  placeholder="Enter partner's UID"
                  value={partnerUid}
                  onChange={(e) => setPartnerUid(e.target.value)}
                />
                <button 
                  className="link-btn"
                  onClick={handlePartnerLinking}
                  disabled={!partnerUid}
                >
                  Connect Partner
                </button>
              </div>

              {error && <p className="error-message">{error}</p>}
            </div>
          ) : (
            <div className="connected-card">
              <div className="connected-header">
                <div className="status-indicator"></div>
                <span>Connected</span>
              </div>
              <div className="partner-avatar">
                {partner?.displayName?.[0] || partner?.email?.[0] || 'P'}
              </div>
              <h4>{partner?.displayName || partner?.email || 'Partner'}</h4>
              <p className="connected-since">
                Connected • Viewing today's meals
              </p>
            </div>
          )}
        </div>

        {/* Right Column - Partner Meals */}
        <div className="partner-meals-view">
          {partnerLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading partner's meals...</p>
            </div>
          ) : !partnerLogs ? (
            <div className="empty-state">
              <span className="empty-icon">🍽️</span>
              <h3>No meals yet today</h3>
              <p>Your partner hasn't added any meals</p>
            </div>
          ) : (
            <>
              {/* Progress Overview */}
              <div className="progress-overview">
                <div className="progress-card">
                  <div className="progress-icon">🔥</div>
                  <div className="progress-details">
                    <span className="progress-label">Calories</span>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill calories"
                        style={{ width: `${Math.min((totals.calories / calorieGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="progress-numbers">
                      {totals.calories} / {calorieGoal} kcal
                    </span>
                  </div>
                </div>

                <div className="progress-card">
                  <div className="progress-icon">💪</div>
                  <div className="progress-details">
                    <span className="progress-label">Protein</span>
                    <div className="progress-bar-container">
                      <div 
                        className="progress-bar-fill protein"
                        style={{ width: `${Math.min((totals.protein / proteinGoal) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="progress-numbers">
                      {totals.protein} / {proteinGoal} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Meals Grid */}
              <div className="meals-grid">
                {['breakfast', 'lunch', 'dinner', 'other'].map(mealType => (
                  <div key={mealType} className="meal-card">
                    <h4 className="meal-title">
                      {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                    </h4>
                    <div className="meal-content">
                      {partnerLogs.meals?.[mealType]?.length > 0 ? (
                        <ul className="food-items">
                          {partnerLogs.meals[mealType].map((item, index) => (
                            <li key={index} className="food-item">
                              <span className="food-name">{item.food?.name}</span>
                              <span className="food-servings">×{item.servings}</span>
                              <span className="food-calories">
                                {(item.food?.calories * item.servings)} cal
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="no-food">No items</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Partner;