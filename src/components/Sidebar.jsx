import { signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="sidebar">
      <h2 className="logo">Healthy Diet</h2>

      <nav className="nav-links">
        <button>Dashboard</button>
        <button>🍽 Calories</button>
        <button>💧 Water</button>
        <button onClick={()=> navigate("/partner")}>🤝 Partner</button>
        <button>📅 History</button>
      </nav>

      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
