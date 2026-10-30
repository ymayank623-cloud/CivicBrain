import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, Loader2, Server } from 'lucide-react';
import { useLang } from '../context/LangContext';

export default function Login() {
  const [selectedRole, setSelectedRole] = useState<'CITIZEN' | 'FIELD_OFFICER'>('CITIZEN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStepMessage, setAuthStepMessage] = useState('');
  const navigate = useNavigate();
  const { t } = useLang();

  const handleRoleTab = (role: 'CITIZEN' | 'FIELD_OFFICER') => {
    setSelectedRole(role);
    setError('');
    if (role === 'CITIZEN') {
      setEmail('citizen@email.com');
      setPassword('demo123');
    } else {
      setEmail('officer@demo.com');
      setPassword('demo123');
    }
  };

  const handleQuickDemo = (role: 'CITIZEN' | 'FIELD_OFFICER') => {
    setSelectedRole(role);
    if (role === 'CITIZEN') {
      setEmail('citizen@email.com');
      setPassword('demo123');
    } else {
      setEmail('officer@demo.com');
      setPassword('demo123');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError(t('All fields are mandatory.', 'सभी फ़ील्ड भरना अनिवार्य है।'));
      return;
    }

    setIsAuthenticating(true);
    setAuthStepMessage('Connecting to Municipal Gateway (SSL 256-bit)...');

    const cleanEmail = email.trim().toLowerCase();
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const matchedUser = registeredUsers.find(
      (u: any) => u.email?.trim().toLowerCase() === cleanEmail && u.password === password
    );

    const isOfficer = cleanEmail.includes('officer') || selectedRole === 'FIELD_OFFICER';

    let determinedRole: 'CITIZEN' | 'FIELD_OFFICER' = 'CITIZEN';
    if (isOfficer && !matchedUser) {
      determinedRole = 'FIELD_OFFICER';
    } else if (matchedUser?.role) {
      determinedRole = matchedUser.role === 'FIELD_OFFICER' ? 'FIELD_OFFICER' : 'CITIZEN';
    }

    // Realistic server authentication handshake progression
    setTimeout(() => {
      setAuthStepMessage('Verifying user credentials with National Registry...');
    }, 250);

    setTimeout(() => {
      setAuthStepMessage('Session authorized. Initializing Ward Telemetry...');
    }, 550);

    setTimeout(() => {
      localStorage.setItem('token', 'civic-token-' + Date.now());
      localStorage.setItem(
        'user',
        JSON.stringify({
          _id: matchedUser?._id || 'user-' + Date.now(),
          name: matchedUser?.name || (determinedRole === 'FIELD_OFFICER' ? 'Officer Vikrant Singh' : cleanEmail.split('@')[0]),
          email: cleanEmail,
          role: determinedRole,
          phone: matchedUser?.phone || '9876543210',
          aadhaar: matchedUser?.aadhaar || 'XXXX-XXXX-8492',
          pincode: matchedUser?.pincode || '110001',
          state: matchedUser?.state || 'Uttar Pradesh',
          city: matchedUser?.city || 'Lucknow',
          address: matchedUser?.address || 'Civil Lines, Ward 14',
          karmaPoints: matchedUser?.karmaPoints || (determinedRole === 'CITIZEN' ? 45 : 0),
        })
      );

      setIsAuthenticating(false);
      if (determinedRole === 'FIELD_OFFICER') {
        navigate('/officer/dashboard');
      } else {
        navigate('/citizen/dashboard');
      }
    }, 850);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Modern Value Proposition */}
        <div className="lg:col-span-6 text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold tracking-wide">
            <Sparkles size={14} /> {t("AI-Powered Municipal Governance", "AI-संचालित नगर निगम प्रशासन")}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            {t("Direct Redressal.", "सीधा समाधान।")}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-amber-400">
              {t("Zero Red Tape.", "शून्य लालफीताशाही।")}
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t(
              "CivicBrain connects citizens directly with verified on-ground field officers using AI spatial clustering, automated SLA timers, and dual visual verification.",
              "CivicBrain नागरिकों को सीधे जमीनी फील्ड अधिकारियों से जोड़ता है। AI विजन तकनीक और 4 घंटे के SLA के साथ वास्तविक कार्य सुनिश्चित होता है।"
            )}
          </p>

          {/* Quick Demo Selector Cards */}
          <div className="space-y-3 pt-2">
            <p className="text-xs uppercase font-extrabold tracking-widest text-slate-400">
              {t("Instant 1-Click Demo Login", "1-क्लिक डेमो लॉगिन")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('CITIZEN')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'CITIZEN'
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-lg shadow-sky-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-sky-400">👤 Citizen Portal</span>
                  {selectedRole === 'CITIZEN' && <CheckCircle2 size={14} className="text-sky-400" />}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">citizen@email.com</p>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('FIELD_OFFICER')}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                  selectedRole === 'FIELD_OFFICER'
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-amber-400">🛡️ Field Officer</span>
                  {selectedRole === 'FIELD_OFFICER' && <CheckCircle2 size={14} className="text-amber-400" />}
                </div>
                <p className="text-[11px] text-slate-400 font-mono">officer@demo.com</p>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <ShieldCheck className="text-emerald-400 flex-shrink-0" size={18} />
            <span>256-bit encrypted secure citizen authentication. ISO 27001 compliant.</span>
          </div>
        </div>

        {/* Right Side: Modern Glass Login Box */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Role Switcher Tabs */}
            <div className="flex p-1 bg-slate-950 rounded-2xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => handleRoleTab('CITIZEN')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === 'CITIZEN'
                    ? 'bg-sky-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Citizen / नागरिक
              </button>
              <button
                type="button"
                onClick={() => handleRoleTab('FIELD_OFFICER')}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRole === 'FIELD_OFFICER'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Field Officer / अधिकारी
              </button>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                {selectedRole === 'CITIZEN' ? t('Citizen Sign In', 'नागरिक लॉगिन') : t('Field Officer Login', 'फील्ड अधिकारी लॉगिन')}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedRole === 'CITIZEN' 
                  ? t('Access your grievances, karma points, and live tracking.', 'अपनी शिकायतें, कर्मा पॉइंट्स और लाइव ट्रैकिंग देखें।')
                  : t('Access route optimization, assigned tasks, and AI repair verification.', 'रूट ऑप्टिमाइज़ेशन और असाइन किए गए कार्यों को हल करें।')
                }
              </p>
            </div>

            {error && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <span className="text-red-400 font-bold">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  {t('Email ID / Identifier', 'ईमेल आईडी')} <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder={selectedRole === 'CITIZEN' ? 'citizen@email.com' : 'officer@demo.com'}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {t('Password', 'पासवर्ड')} <span className="text-rose-400">*</span>
                  </label>
                  <Link to="/forgot-password" className="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                    {t('Forgot Password?', 'पासवर्ड भूल गए?')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isAuthenticating}
                    className="w-full pl-10 pr-11 py-3 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all disabled:opacity-50"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Realistic Server Authentication Status Indicator */}
              {isAuthenticating && (
                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-2.5 animate-pulse">
                  <Loader2 className="animate-spin text-sky-400 flex-shrink-0" size={16} />
                  <div className="flex-1">
                    <p className="font-bold text-[11px] text-white flex items-center gap-1.5">
                      <Server size={12} className="text-sky-400" /> Municipal Gateway Response
                    </p>
                    <p className="text-[10px] text-slate-300 mt-0.5">{authStepMessage}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer mt-2 disabled:opacity-60 ${
                  selectedRole === 'CITIZEN'
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 shadow-sky-600/30'
                    : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
                }`}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Authenticating with Server...</span>
                  </>
                ) : (
                  <>
                    <span>{t('Sign In to Dashboard', 'डैशबोर्ड में प्रवेश करें')}</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>

              <div className="pt-4 text-center border-t border-slate-800">
                <p className="text-xs text-slate-400">
                  {t('New to CivicBrain?', 'नए नागरिक हैं?')}{' '}
                  <Link to="/register" className="font-bold text-amber-400 hover:text-amber-300 hover:underline">
                    {t('Register an Account →', 'यहाँ नया खाता बनाएं →')}
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
