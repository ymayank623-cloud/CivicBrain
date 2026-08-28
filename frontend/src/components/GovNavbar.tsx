import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Phone, LogOut, Menu, X, Award, User, Sun, Moon } from "lucide-react";
import { useLang } from "../context/LangContext";

export default function GovNavbar() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage for theme preference
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="font-sans">
      {/* Top Banner */}
      <div className="bg-orange-600 text-white py-1.5 px-4 text-xs font-semibold flex flex-wrap justify-between items-center gap-2">
        <span>{t("GOVERNMENT OF INDIA", "भारत सरकार | GOVERNMENT OF INDIA")}</span>
        <span className="flex items-center gap-2 flex-wrap">
          <button onClick={toggleTheme} className="hover:text-yellow-200 transition-colors mr-3" title="Toggle Dark Mode">
            {isDark ? <Sun size={12} className="inline mr-1 -mt-0.5"/> : <Moon size={12} className="inline mr-1 -mt-0.5"/>}
            {isDark ? "Light Mode" : "Dark Mode"}
          </button> | Screen Reader Access | <button onClick={toggleLang} className="hover:underline text-white font-bold">{lang === "en" ? "हिन्दी" : "English"}</button>
        </span>
      </div>

      {/* Official Header */}
      <header className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-5">
          {/* Emblem */}
          <Link to="/" className="flex-shrink-0">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-2 border-blue-200">
              <div className="w-11 h-11 border-2 border-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-900 text-[8px] font-black text-center leading-none">NAGAR<br/>NIGAM</span>
              </div>
            </div>
          </Link>
          {/* Title */}
          <div className="flex-1">
            <Link to="/">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight leading-tight hover:text-blue-200 transition-colors">
                {t("CivicBrain", "नगर निगम — CivicBrain")}
              </h1>
            </Link>
            <p className="text-blue-200 text-xs font-medium mt-0.5">
              {t("Municipal Corporation | Citizen Grievance Redressal System (CGRS)", "नगर निगम | नागरिक शिकायत निवारण प्रणाली (CGRS)")}
            </p>
            <p className="text-orange-300 text-[10px] font-semibold mt-0.5 uppercase tracking-wide">
              {t("Digital India Initiative — Smart City Mission", "डिजिटल इंडिया पहल — स्मार्ट सिटी मिशन")}
            </p>
          </div>
          {/* Helpline */}
          <div className="hidden lg:flex flex-col items-end">
            <div className="flex items-center text-orange-300 font-bold text-sm mb-1">
              <Phone size={14} className="mr-1.5" /> Helpline: 1800-CIVIC
            </div>
            <p className="text-blue-300 text-xs">Mon - Sat | 9 AM - 6 PM</p>
          </div>
          {/* Mobile toggle */}
          <button className="lg:hidden text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sub-navbar */}
        <div className="bg-blue-800 border-t border-blue-700 hidden lg:block">
          <div className="max-w-6xl mx-auto px-6 py-2 flex flex-wrap items-center gap-1">
            {/* Static links */}
            <NavLink to="/" label={t("Home", "मुख्य पृष्ठ")} active={isActive("/")} />
            <NavLink to="/track" label={t("Track Grievance", "शिकायत स्थिति")} active={isActive("/track")} />
            <NavLink to="/help-faq" label={t("Help & FAQ", "सहायता")} active={isActive("/help-faq")} />

            <div className="flex-1" />

            {/* namic role links */}
            {!user && (
              <>
                <NavLink to="/register" label={t("New Registration", "नया पंजीकरण")} active={isActive("/register")} />
                <Link to="/login" className="ml-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold uppercase tracking-wide px-4 py-1.5 rounded transition-colors">
                  {t("Login ", "लॉगिन ")}
                </Link>
              </>
            )}

            {user?.role === "CITIZEN" && (
              <>
                <NavLink to="/citizen/new-complaint" label="� File Complaint" active={isActive("/citizen/new-complaint")} />
                <NavLink to="/citizen/dashboard" label="📋 My Tickets" active={isActive("/citizen/dashboard")} />
                <div className="flex items-center bg-blue-900 border border-blue-700 px-3 py-1 rounded text-xs font-bold text-orange-300 ml-1">
                  <Award size={12} className="mr-1" /> {user.karmaPoints || 40} pts
                </div>
                <Link to="/profile" className="ml-3 text-blue-200 hover:text-white transition-colors" title="My Profile"><User size={16} /></Link>
                <button onClick={handleLogout} className="ml-3 text-blue-200 hover:text-red-400 transition-colors" title="Logout"><LogOut size={16} /></button>
              </>
            )}
            {user?.role === "FIELD_OFFICER" && (
              <>
                <NavLink to="/officer/dashboard" label="📋 Assignments" active={isActive("/officer/dashboard")} />
                <Link to="/profile" className="ml-3 text-blue-200 hover:text-white transition-colors" title="My Profile"><User size={16} /></Link>
                <button onClick={handleLogout} className="ml-3 text-blue-200 hover:text-red-400 transition-colors" title="Logout"><LogOut size={16} /></button>
              </>
            )}
            {user?.role === "DEPT_HEAD" && (
              <>
                <NavLink to="/department/dashboard" label="📊 Dept Board" active={isActive("/department/dashboard")} />
                <Link to="/profile" className="ml-3 text-blue-200 hover:text-white transition-colors" title="My Profile"><User size={16} /></Link>
                <button onClick={handleLogout} className="ml-3 text-blue-200 hover:text-red-400 transition-colors" title="Logout"><LogOut size={16} /></button>
              </>
            )}
            {user?.role === "COMMISSIONER" && (
              <>
                <NavLink to="/admin/dashboard" label="� War Room" active={isActive("/admin/dashboard")} />
                <Link to="/profile" className="ml-3 text-blue-200 hover:text-white transition-colors" title="My Profile"><User size={16} /></Link>
                <button onClick={handleLogout} className="ml-3 text-blue-200 hover:text-red-400 transition-colors" title="Logout"><LogOut size={16} /></button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="bg-blue-800 border-t border-blue-700 px-6 py-4 flex flex-col gap-3 lg:hidden">
            <Link to="/" className="text-xs font-bold uppercase text-blue-100 hover:text-white" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link to="/track" className="text-xs font-bold uppercase text-blue-100 hover:text-white" onClick={() => setMobileOpen(false)}>Track Grievance</Link>
            <Link to="/help-faq" className="text-xs font-bold uppercase text-blue-100 hover:text-white" onClick={() => setMobileOpen(false)}>Help & FAQ</Link>
            {!user && <Link to="/login" className="text-xs font-bold uppercase text-orange-300 hover:text-white" onClick={() => setMobileOpen(false)}>Login / Register</Link>}
            {user && <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="text-left text-xs font-bold uppercase text-red-300 hover:text-white">Logout</button>}
          </div>
        )}
      </header>
    </div>
  );
}

function NavLink({ to, label, active }: { to: string; label: string; active: boolean }) {
  return (
    <Link
      to={to}
      className={`text-xs font-bold uppercase tracking-wide px-3 py-1.5 rounded transition-colors ${
        active
          ? "text-white bg-blue-900 border-b-2 border-orange-400"
          : "text-blue-200 hover:text-white hover:bg-blue-700"
      }`}
    >
      {label}
    </Link>
  );
}







