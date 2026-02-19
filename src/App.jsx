import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Partner from "./pages/Partner";

// 👇 Import your providers
import { AuthProvider } from "./context/AuthContext";
import { PartnerProvider } from "./context/PartnerContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* 👆 AuthProvider first because PartnerProvider needs user */}
        <PartnerProvider>
          {/* 👆 Now PartnerProvider wraps all routes */}
          <Routes>
            {/* Redirect root to signup */}
            <Route path="/" element={<Navigate to="/signup" />} />

            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* 👇 Partner page is now inside PartnerProvider */}
            <Route path="/partner" element={<Partner />} />

            {/* Dashboard page */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
          </Routes>
        </PartnerProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;