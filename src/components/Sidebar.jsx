import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import "../styles/Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check window size on resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(true); // Always open on desktop
      } else {
        setIsOpen(false); // Closed by default on mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial value

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Header with Hamburger */}
      {isMobile && (
        <div className="mobile-header">
          <button className="hamburger-btn" onClick={toggleSidebar}>
            <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isOpen ? 'open' : ''}`}></span>
          </button>
          <h2 className="mobile-logo">Healthy Diet</h2>
        </div>
      )}

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {!isMobile && <h2>Healthy Diet</h2>}
          {isMobile && (
            <button className="close-sidebar" onClick={closeSidebar}>×</button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          
          <Link to="/dashboard" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">🔥</span>
            <span>Calories</span>
          </Link>
          
          <Link to="/partner" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">👥</span>
            <span>Partner</span>
          </Link>
          
          <Link to="/history" className="nav-link" onClick={closeSidebar}>
            <span className="nav-icon">📅</span>
            <span>History</span>
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <span className="nav-icon">🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}
    </>
  );
}

export default Sidebar;