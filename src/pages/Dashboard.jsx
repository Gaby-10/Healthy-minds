import Sidebar from "../components/Sidebar";
import "../styles/dashboard.css";
import { auth } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import CalorieTracker from "../components/CalorieTracker";


function Dashboard() {
  const {user} = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar />

     
     
     
      <div className="dashboard-content">
       

        <div className="user-info">
          Logged in as <strong>{user?.email}</strong>
        </div>
            
            <div className="tracker-page">
  {/* 🔥 Calorie tracker */}
        <CalorieTracker />
         </div>
        {/* Future sections */}
        {/* <WaterTracker /> */}
        {/* <PartnerProgress /> */}
      </div>
    </div>
  );
}

export default Dashboard;