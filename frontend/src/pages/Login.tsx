import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Lock, User } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields are mandatory.'); return; }

    const cleanEmail = email.trim().toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matchedUser = registeredUsers.find((u: any) => u.email?.trim().toLowerCase() === cleanEmail && u.password === password);
    
    // Master pre-seeded account & role accounts for cross-device support (Mobile/Laptop)
    const isMasterUser = (cleanEmail === 'ymayank623@gmail.com' && password === 'Mayank8492');
    const isDemoAccount = cleanEmail.includes('officer') || cleanEmail.includes('dept') ||
                          cleanEmail.includes('admin') || cleanEmail.includes('commissioner');

    if (matchedUser || isMasterUser || isDemoAccount) {
      let mockRole = 'CITIZEN';
      if (cleanEmail.includes('officer')) mockRole = 'FIELD_OFFICER';
      if (cleanEmail.includes('dept')) mockRole = 'DEPT_HEAD';
      if (cleanEmail.includes('admin') || cleanEmail.includes('commissioner')) mockRole = 'COMMISSIONER';
      localStorage.setItem('token', 'civic-token-' + Date.now());
      localStorage.setItem('user', JSON.stringify({
        _id: 'user-' + Date.now(),
        name: matchedUser?.name || cleanEmail.split('@')[0],
        email: cleanEmail,
        role: mockRole,
        phone: matchedUser?.phone || '9876543210',
        aadhaar: matchedUser?.aadhaar || 'XXXX-XXXX-8492',
        pincode: matchedUser?.pincode || '110001',
        state: matchedUser?.state || 'Delhi',
        city: matchedUser?.city || 'New Delhi',
        address: matchedUser?.address || 'Civil Lines',
      }));
      navigate('/');
    } else {
      setError('Invalid credentials. Please check your Email ID and Password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      {/* GOI Top Bar */}
      <div className="bg-[#1a3a6b] text-white text-[11px] px-4 py-1 flex justify-between items-center">
        <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA | DIGITAL INDIA INITIATIVE</span>
        <span className="hidden sm:block">Screen Reader Access | Skip to Main Content</span>
      </div>

      {/* Ministry Header */}
      <div className="bg-white border-b-4 border-[#FF6B1A] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
          {/* Emblem */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/120px-Emblem_of_India.svg.png"
            alt="Emblem of India" className="h-14 w-auto" />
          <div className="border-l-2 border-gray-300 pl-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ministry of Housing & Urban Affairs</p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a3a6b] leading-tight">CivicBrain — Nagar Nigam Portal</h1>
            <p className="text-[11px] text-orange-600 font-semibold">Citizen Grievance Redressal System (CGRS) | e-Governance</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-10 grid lg:grid-cols-2 gap-8 items-start">

        {/* Left Info Panel */}
        <div className="space-y-5">
          <div className="bg-[#1a3a6b] text-white rounded-lg p-6">
            <h2 className="text-lg font-bold uppercase tracking-wider border-b border-blue-400 pb-3 mb-4">
              About CivicBrain Portal
            </h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              CivicBrain is an integrated e-Governance platform developed under the Smart Cities Mission for efficient
              resolution of public grievances. Citizens can register complaints online and track their real-time status.
            </p>
            <div className="mt-5 space-y-3">
              {[
                { n: '01', t: 'File Grievance Online', d: 'Potholes, drainage, electricity, water supply' },
                { n: '02', t: 'AI-Based Triaging', d: 'Auto-categorize & prioritize complaints via AI' },
                { n: '03', t: 'Real-Time Tracking', d: 'Track status with SLA countdown timers' },
                { n: '04', t: 'Officer Assignment', d: 'Auto-assign nearest field officer' },
              ].map(item => (
                <div key={item.n} className="flex gap-3 items-start">
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">{item.n}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.t}</p>
                    <p className="text-xs text-blue-200">{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Helpline */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">Citizen Helpline</p>
            <p className="text-2xl font-bold text-[#1a3a6b]">1800-CIVIC (24x7)</p>
            <p className="text-xs text-gray-500 mt-1">Toll Free | Available in Hindi & English</p>
          </div>

          {/* Security notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3 items-start">
            <ShieldCheck className="text-green-600 flex-shrink-0 mt-0.5" size={18} />
            <div>
              <p className="text-xs font-bold text-green-800 uppercase tracking-wide">Secure Connection</p>
              <p className="text-xs text-green-700 mt-0.5">
                This portal uses 256-bit SSL encryption. Never share your password with anyone.
                Government officials will never ask for your OTP.
              </p>
            </div>
          </div>
        </div>

        {/* Right Login Form */}
        <div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-[#1a3a6b] px-6 py-4 flex items-center gap-3">
              <div className="bg-orange-500 rounded-full p-2">
                <Lock className="text-white" size={16} />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">Citizen Login / नागरिक लॉगिन</h2>
                <p className="text-blue-200 text-xs">Authorized users only — Unauthorized access is prohibited</p>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700 flex items-start gap-2">
                  <span className="text-red-500 font-bold">⚠</span> {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Registered Email ID / Mobile <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type="text" required value={email} onChange={e => setEmail(e.target.value)}
                      autoCapitalize="none" autoCorrect="off"
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
                      placeholder="Enter registered Email ID" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <Link to="/forgot-password" className="text-xs text-[#1a3a6b] hover:text-orange-600 font-semibold">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                    <input type={showPassword ? 'text' : 'password'} required value={password} onChange={e => setPassword(e.target.value)}
                      autoCapitalize="none" autoCorrect="off"
                      className="w-full pl-9 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-gray-50"
                      placeholder="Enter password" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#1a3a6b]">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button type="submit"
                  className="w-full bg-[#1a3a6b] hover:bg-[#0f2547] text-white py-3 rounded font-bold uppercase tracking-widest text-sm transition-colors shadow-md">
                  Login to Portal
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <span className="text-xs text-gray-400 font-medium">OR</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="text-center">
                  <p className="text-sm text-gray-600">New Citizen?{' '}
                    <Link to="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">
                      Register Here / यहाँ रजिस्टर करें →
                    </Link>
                  </p>
                </div>
              </form>
            </div>

            {/* Form Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex flex-wrap gap-4 text-xs text-gray-500 justify-between">
              <span>© 2025 CivicBrain | Ministry of Urban Development</span>
              <span>Version 2.1.0 | Powered by Digital India</span>
            </div>
          </div>

          {/* WCAG notice */}
          <p className="text-xs text-gray-400 text-center mt-3">
            This portal conforms to WCAG 2.0 Level AA accessibility standards.
          </p>
        </div>
      </div>

      {/* Footer Bar */}
      <div className="bg-[#1a3a6b] text-white text-xs py-3 px-4 text-center mt-6">
        <p>© 2025 Government of India. All Rights Reserved. | Terms of Use | Privacy Policy | Contact Us</p>
      </div>
    </div>
  );
}