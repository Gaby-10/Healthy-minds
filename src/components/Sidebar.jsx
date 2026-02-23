import { Link, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import "../styles/Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Healthy Diet</h2>
      </div>
      
      <nav className="sidebar-nav">
        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">📊</span>
          Dashboard
        </Link>
        
        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">🔥</span>
          Calories
        </Link>
        
        <Link to="/dashboard" className="nav-link">
          <span className="nav-icon">💧</span>
          Water
        </Link>
        
        <Link to="/partner" className="nav-link">
          <span className="nav-icon">👥</span>
          Partner
        </Link>
        
        {/* 👇 HISTORY LINK - MAKE SURE THIS EXISTS */}
        <Link to="/history" className="nav-link">
          <span className="nav-icon">📅</span>
          History
        </Link>
      </nav>
      
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-btn">
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;