import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Track from "./pages/Track";
import HelpFaq from "./pages/HelpFaq";
import CitizenDashboard from "./pages/CitizenDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import NewComplaint from "./pages/NewComplaint";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicLayout from "./components/PublicLayout";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";

import { LangProvider } from "./context/LangContext";

function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <Routes>
          {/* All routes wrapped inside PublicLayout - Modern GovNavbar appears on every page */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/track" element={<Track />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/help-faq" element={<HelpFaq />} />
            <Route path="/profile" element={<Profile />} />

            {/* Protected Dashboard Routes: Citizen & Field Officer ONLY */}
            <Route element={<ProtectedRoute allowedRoles={['CITIZEN']} />}>
              <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
              <Route path="/citizen/new-complaint" element={<NewComplaint />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['FIELD_OFFICER']} />}>
              <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            </Route>

            {/* Fallback routes */}
            <Route path="/department/*" element={<Navigate to="/" replace />} />
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </LangProvider>
  );
}

export default App;
