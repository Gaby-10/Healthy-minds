import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Partner from "./pages/Partner";
import HistoryCalendar from "./pages/HistoryCalendar"; // 👈 Add this import

// Import your providers
import { AuthProvider } from "./context/AuthContext";
import { PartnerProvider } from "./context/PartnerContext";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PartnerProvider>
          <Routes>
            {/* Redirect root to signup */}
            <Route path="/" element={<Navigate to="/signup" />} />

            {/* Public Routes */}
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/partner"
              element={
                <PrivateRoute>
                  <Partner />
                </PrivateRoute>
              }
            />
            
            {/* 👈 NEW HISTORY ROUTE */}
            <Route
              path="/history"
              element={
                <PrivateRoute>
                  <HistoryCalendar />
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