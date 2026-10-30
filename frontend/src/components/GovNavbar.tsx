import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Phone, LogOut, Menu, X, Award, User, Sun, Moon, Shield, PlusCircle, Compass } from "lucide-react";
import { useLang } from "../context/LangContext";

export default function GovNavbar() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, toggleLang, t } = useLang();

  useEffect(() => {
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

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 font-sans backdrop-blur-xl bg-slate-900/95 border-b border-slate-800 shadow-xl transition-all">
      {/* Top Micro-Bar */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-1.5 px-4 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 font-medium">
            {/* Tiranga mini bar */}
            <span className="flex h-3 w-4.5 rounded-[2px] overflow-hidden shadow-xs border border-white/20">
              <span className="w-full h-1 bg-amber-500 block"></span>
              <span className="w-full h-1 bg-white block"></span>
              <span className="w-full h-1 bg-emerald-600 block"></span>
            </span>
            <span className="font-semibold text-slate-200 tracking-wide uppercase">
              {t("Govt. of India • Smart Cities Mission", "भारत सरकार • स्मार्ट सिटी मिशन")}
            </span>
            <span className="hidden sm:inline text-slate-500">•</span>
            <span className="hidden sm:inline text-slate-400">
              {t("Municipal Grievance Redressal 2.0", "नागरिक शिकायत निवारण 2.0")}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a href="tel:180024842" className="hidden md:flex items-center gap-1.5 text-amber-400 font-semibold hover:text-amber-300 transition-colors">
              <Phone size={11} /> 1800-CIVIC (Toll-Free)
            </a>
            <span className="hidden md:inline text-slate-700">|</span>
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} className="text-sky-300" />}
              <span>{isDark ? "Light" : "Dark"}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              onClick={toggleLang}
              className="px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold transition-all border border-slate-700 cursor-pointer"
            >
              {lang === "en" ? "हिन्दी" : "English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-amber-500 p-[1.5px] shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-sky-400 group-hover:text-amber-400 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-white group-hover:text-sky-400 transition-colors">
                  Civic<span className="text-amber-400">Brain</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  AI 2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block font-medium">
                {t("Nagar Nigam • Citizen Redressal Portal", "नगर निगम • नागरिक निवारण पोर्टल")}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 bg-slate-950/50 p-1.5 rounded-2xl border border-slate-800">
            <NavPill to="/" active={isActive("/")}>
              {t("Home", "मुख्य")}
            </NavPill>
            <NavPill to="/track" active={isActive("/track")}>
              {t("Track Ticket", "स्थिति ट्रैक")}
            </NavPill>
            <NavPill to="/help-faq" active={isActive("/help-faq")}>
              {t("Help & FAQ", "सहायता")}
            </NavPill>

            {/* Authenticated Role Specific Links */}
            {user?.role === "CITIZEN" && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <NavPill to="/citizen/dashboard" active={isActive("/citizen/dashboard")}>
                  {t("My Grievances", "मेरी शिकायतें")}
                </NavPill>
                <Link
                  to="/citizen/new-complaint"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
                >
                  <PlusCircle size={14} /> {t("New Grievance", "नई शिकायत")}
                </Link>
              </>
            )}

            {user?.role === "FIELD_OFFICER" && (
              <>
                <div className="h-4 w-px bg-slate-800 mx-1"></div>
                <NavPill
                  to="/officer/dashboard"
                  active={location.pathname === "/officer/dashboard" && !location.search.includes("tab=history")}
                >
                  <Compass size={13} className="inline mr-1" />
                  {t("Field Tasks & Route", "कार्य और रूट")}
                </NavPill>
                <NavPill
                  to="/officer/dashboard?tab=history"
                  active={location.search.includes("tab=history")}
                >
                  {t("Resolution Proofs", "सत्यापन इतिहास")}
                </NavPill>
              </>
            )}
          </nav>

          {/* Right Action Profile / Login */}
          <div className="hidden lg:flex items-center gap-3">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
                >
                  {t("Register", "पंजीकरण")}
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/25 transition-all active:scale-95"
                >
                  {t("Login", "लॉगिन")}
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-3 bg-slate-950/70 py-1.5 px-3 rounded-2xl border border-slate-800">
                {user.role === "CITIZEN" && (
                  <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2.5 py-1 rounded-xl text-xs font-bold">
                    <Award size={13} />
                    <span>{user.karmaPoints || 40} pts</span>
                  </div>
                )}
                {user.role === "FIELD_OFFICER" && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                    Officer
                  </span>
                )}
                {/* 1-Click Role Switcher for Seamless Testing & Demos */}
                <button
                  onClick={() => {
                    const newRole = user.role === "CITIZEN" ? "FIELD_OFFICER" : "CITIZEN";
                    const updatedUser = {
                      ...user,
                      role: newRole,
                      name: newRole === "FIELD_OFFICER" ? "Officer Vikrant Singh" : (user.name?.includes("Officer") ? "Aakash Verma" : user.name)
                    };
                    localStorage.setItem("user", JSON.stringify(updatedUser));
                    setUser(updatedUser);
                    if (newRole === "FIELD_OFFICER") {
                      navigate("/officer/dashboard");
                    } else {
                      navigate("/citizen/dashboard");
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center gap-1 border cursor-pointer ${
                    user.role === "CITIZEN"
                      ? "bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30"
                      : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/30"
                  }`}
                  title={user.role === "CITIZEN" ? "Switch to Officer View" : "Switch to Citizen View"}
                >
                  {user.role === "CITIZEN" ? "👮 Switch to Officer" : "👤 Switch to Citizen"}
                </button>
                <Link
                  to="/profile"
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                  title="My Profile"
                >
                  <User size={16} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {user?.role === "CITIZEN" && (
              <Link
                to="/citizen/new-complaint"
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-white font-bold text-xs"
              >
                + File
              </Link>
            )}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white transition-colors"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-slate-950 border-t border-slate-800 px-6 py-5 flex flex-col gap-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-300 hover:text-white py-1"
          >
            {t("Home", "मुख्य पृष्ठ")}
          </Link>
          <Link
            to="/track"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-300 hover:text-white py-1"
          >
            {t("Track Grievance", "शिकायत स्थिति")}
          </Link>
          <Link
            to="/help-faq"
            onClick={() => setMobileOpen(false)}
            className="text-sm font-semibold text-slate-300 hover:text-white py-1"
          >
            {t("Help & FAQ", "सहायता")}
          </Link>

          {user?.role === "CITIZEN" && (
            <>
              <div className="h-px bg-slate-800 my-1"></div>
              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-sky-400 py-1"
              >
                📋 {t("My Grievances", "मेरी शिकायतें")}
              </Link>
              <Link
                to="/citizen/new-complaint"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-amber-400 py-1"
              >
                ➕ {t("File New Grievance", "नई शिकायत दर्ज करें")}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-slate-300 py-1"
              >
                👤 {t("My Profile", "मेरी प्रोफाइल")}
              </Link>
            </>
          )}

          {user?.role === "FIELD_OFFICER" && (
            <>
              <div className="h-px bg-slate-800 my-1"></div>
              <Link
                to="/officer/dashboard"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-indigo-400 py-1"
              >
                📋 {t("Field Tasks & TSP Route", "फील्ड कार्य एवं रूट")}
              </Link>
              <Link
                to="/officer/dashboard?tab=history"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-emerald-400 py-1"
              >
                📜 {t("Verified History & Proofs", "सत्यापित कार्य इतिहास")}
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="text-sm font-semibold text-slate-300 py-1"
              >
                👤 {t("Officer Profile", "प्रोफाइल")}
              </Link>
            </>
          )}

          <div className="h-px bg-slate-800 my-1"></div>

          {!user ? (
            <div className="flex flex-col gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs uppercase tracking-wider"
              >
                {t("Login", "लॉगिन")}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="w-full text-center py-2.5 rounded-xl bg-slate-800 text-slate-200 font-semibold text-xs"
              >
                {t("New Registration", "नया पंजीकरण")}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  const newRole = user.role === "CITIZEN" ? "FIELD_OFFICER" : "CITIZEN";
                  const updatedUser = {
                    ...user,
                    role: newRole,
                    name: newRole === "FIELD_OFFICER" ? "Officer Vikrant Singh" : (user.name?.includes("Officer") ? "Aakash Verma" : user.name)
                  };
                  localStorage.setItem("user", JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  setMobileOpen(false);
                  if (newRole === "FIELD_OFFICER") {
                    navigate("/officer/dashboard");
                  } else {
                    navigate("/citizen/dashboard");
                  }
                }}
                className={`w-full text-center py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider border cursor-pointer ${
                  user.role === "CITIZEN"
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/30"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                }`}
              >
                {user.role === "CITIZEN" ? "👮 Switch to Officer View" : "👤 Switch to Citizen View"}
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileOpen(false);
                }}
                className="text-left text-sm font-bold text-red-400 py-2 flex items-center gap-2"
              >
                <LogOut size={16} /> {t("Logout", "लॉगआउट")}
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavPill({ to, children, active }: { to: string; children: React.ReactNode; active: boolean }) {
  return (
    <Link
      to={to}
      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
        active
          ? "bg-slate-800 text-white shadow-sm border border-slate-700/60"
          : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
      }`}
    >
      {children}
    </Link>
  );
}
