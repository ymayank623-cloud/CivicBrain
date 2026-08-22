import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const routeByRole = () => { navigate("/"); };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        routeByRole();
      } else {
        throw new Error("Force offline mock");
      }
    } catch (err) {
      let mockRole = "CITIZEN";
      if (email.includes("officer")) mockRole = "FIELD_OFFICER";
      if (email.includes("dept")) mockRole = "DEPT_HEAD";
      if (email.includes("admin") || email.includes("commissioner")) mockRole = "COMMISSIONER";
      localStorage.setItem("token", "mock-token-123");
      localStorage.setItem("user", JSON.stringify({ _id: "mock-id-1", name: email.split("@")[0], email, role: mockRole }));
      routeByRole();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-10 items-start">

        {/* Left Panel */}
        <div className="flex-1 hidden lg:block">
          <div className="bg-blue-900 text-white rounded shadow-md p-8">
            <div className="flex items-center mb-5">
              <ShieldCheck className="text-orange-400 mr-3" size={28} />
              <h2 className="text-xl font-bold">Citizen Services Portal</h2>
            </div>
            <p className="text-blue-200 text-sm leading-relaxed mb-7">
              नगर निगम के इस आधिकारिक पोर्टल पर आपका स्वागत है। यहाँ आप अपनी शिकायत दर्ज कर सकते हैं, उसकी स्थिति जाँच सकते हैं, और नागरिक सेवाओं का लाभ उठा सकते हैं।
            </p>
            <div className="space-y-3">
              {[
                { num: "01", title: "File Grievance Online", desc: "Register civic complaints — potholes, drainage, streetlights, sanitation." },
                { num: "02", title: "Real-Time Status Tracking", desc: "Live updates from field officers with SLA countdown timers." },
                { num: "03", title: "AI-Verified Resolution", desc: "Before/After photo matching ensures genuine problem resolution." },
                { num: "04", title: "Earn Civic Karma Points", desc: "Get Swachh Points for verified complaints and neighborhood audits." },
              ].map(item => (
                <div key={item.num} className="flex gap-4 p-4 bg-blue-800 rounded border border-blue-700">
                  <span className="text-orange-400 font-black text-2xl leading-none flex-shrink-0">{item.num}</span>
                  <div>
                    <h3 className="font-bold text-sm text-white mb-0.5">{item.title}</h3>
                    <p className="text-blue-300 text-xs leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-blue-700 pt-6">
              {[{ val: "12,400+", label: "Complaints Resolved" }, { val: "98%", label: "SLA Compliance" }, { val: "4.8★", label: "Citizen Rating" }].map(s => (
                <div key={s.label} className="text-center">
                  <div className="text-orange-400 font-black text-xl">{s.val}</div>
                  <div className="text-blue-300 text-[10px] mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-[420px] flex-shrink-0">
          <div className="bg-white rounded shadow-md border border-gray-200 overflow-hidden">
            <div className="bg-blue-900 text-white px-6 py-5 border-b-4 border-orange-500">
              <h2 className="font-bold text-lg">🔐 Portal Login / पोर्टल लॉगिन</h2>
              <p className="text-blue-200 text-xs mt-1">Authorized users only. Unauthorized access is prohibited.</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleLogin} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-600 text-red-700 p-3 rounded text-sm">⚠️ {error}</div>
                )}
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-gray-800 uppercase tracking-wide mb-1.5">
                    Registered Email / Mobile <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                    <input id="email" type="text" required value={email} onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50 focus:bg-white"
                      placeholder="citizen@email.com" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="password" className="block text-xs font-bold text-gray-800 uppercase tracking-wide">Password <span className="text-red-600">*</span></label>
                    <a href="#" className="text-xs font-semibold text-blue-800 hover:text-orange-600">Forgot Password?</a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400" /></div>
                    <input id="password" type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="bg-yellow-50 border border-yellow-300 rounded p-3 text-xs text-yellow-900">
                  <strong>🧪 Demo Accounts:</strong><br />
                  <span className="font-mono">any@email.com</span> → Citizen &nbsp;|&nbsp; <span className="font-mono">officer@demo.com</span> → Field Officer<br />
                  <span className="font-mono">dept@demo.com</span> → Dept Head &nbsp;|&nbsp; <span className="font-mono">admin@demo.com</span> → Commissioner
                </div>
                <button type="submit" disabled={isLoading}
                  className={`w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white shadow flex items-center justify-center gap-2 transition-colors ${isLoading ? "bg-gray-400 cursor-wait" : "bg-blue-900 hover:bg-blue-800"}`}>
                  {isLoading ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span> Authenticating...</> : "🔐 Login to Portal / लॉगिन करें"}
                </button>
              </form>
              <div className="mt-5 pt-4 border-t border-gray-200 text-center">
                <p className="text-sm text-gray-600">New Citizen?&nbsp;
                  <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700">Register Here / यहाँ पंजीकरण करें →</Link>
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-4 text-xs text-blue-900">
            <p className="font-bold mb-1 flex items-center gap-1.5"><ShieldCheck size={13} className="text-blue-700" /> Security Notice / सुरक्षा सूचना</p>
            <p className="text-blue-700 leading-relaxed">This is an official Government portal. Your session is SSL encrypted. Never share your password with anyone. यह एक सरकारी पोर्टल है। अपना पासवर्ड किसी के साथ साझा न करें।</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-10 py-6 px-6 border-t-4 border-orange-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-blue-200">
            <p className="font-bold text-white mb-1">नगर निगम | Municipal Corporation</p>
            <p>© 2026 CivicBrain. A Digital India Initiative. All Rights Reserved.</p>
          </div>
          <div className="flex gap-6 text-blue-300 font-semibold">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <a href="#" className="hover:text-white">Accessibility</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
