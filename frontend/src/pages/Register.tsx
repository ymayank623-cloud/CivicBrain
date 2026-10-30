import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, MapPin, Lock, CheckCircle2, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { useLang } from '../context/LangContext';

interface FormData {
  name: string; email: string; phone: string; aadhaar: string;
  gender: string; dob: string; address: string; pincode: string;
  city: string; state: string; password: string; confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', aadhaar: '',
    gender: 'MALE', dob: '', address: '', pincode: '',
    city: '', state: '', password: '', confirmPassword: ''
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'pincode' && value.length === 6) {
      setPincodeLoading(true);
      try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${value}`);
        const data = await res.json();
        if (data?.[0]?.Status === 'Success') {
          const po = data[0].PostOffice[0];
          setFormData(prev => ({ ...prev, city: po.District, state: po.State }));
        }
      } catch {}
      setPincodeLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    const cleanEmail = formData.email.trim().toLowerCase();

    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      users.push({
        email: cleanEmail,
        password: formData.password,
        name: formData.name,
        phone: formData.phone || '9876543210',
        aadhaar: formData.aadhaar || 'XXXX-XXXX-8492',
        pincode: formData.pincode || '110001',
        city: formData.city || 'Lucknow',
        state: formData.state || 'Uttar Pradesh',
        address: formData.address || 'Civil Lines',
        role: 'CITIZEN',
        karmaPoints: 50,
      });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      setIsLoading(false);
      setStep('success');
      setTimeout(() => navigate('/login'), 2200);
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-3xl w-full">
        {step === 'success' ? (
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-10 border border-slate-800 text-center shadow-2xl">
            <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
              <CheckCircle2 className="text-emerald-400" size={44} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Registration Successful!</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              Your Citizen Account has been created with 50 Welcome Karma Points. Redirecting you to login...
            </p>
            <div className="inline-flex items-center gap-2 text-sky-400 font-semibold text-xs animate-pulse">
              <Loader2 className="animate-spin" size={16} /> Opening Login Portal...
            </div>
          </div>
        ) : (
          <div className="bg-slate-900/90 backdrop-blur-2xl rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl">
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8 pb-6 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold tracking-wide mb-2">
                  <Sparkles size={13} /> {t("Citizen Registration", "नागरिक पंजीकरण")}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Join CivicBrain Network
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Report grievances, track resolution timelines, and earn citizen karma points.
                </p>
              </div>
              <Link to="/login" className="text-xs font-bold text-amber-400 hover:text-amber-300">
                Already registered? Sign In →
              </Link>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <span className="text-red-400 font-bold">⚠</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Details */}
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <User size={14} className="text-sky-400" /> Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Mobile Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="10-digit mobile"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email ID *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@email.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Aadhaar (Optional)</label>
                    <input
                      type="text"
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Location Details */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin size={14} className="text-amber-400" /> Municipal Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      Pincode {pincodeLoading && <span className="text-[10px] text-sky-400">(Auto-fetching...)</span>}
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">City / District</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="City"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="State"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="pt-4 border-t border-slate-800">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <Lock size={14} className="text-emerald-400" /> Account Security
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Password *</label>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="At least 6 characters"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-bold text-slate-300 mb-1">Confirm Password *</label>
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-type password"
                      className="w-full px-3.5 py-2.5 bg-slate-950/70 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-8 text-slate-400 hover:text-white"
                    >
                      {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:brightness-110 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} /> Creating Account...
                  </>
                ) : (
                  <>
                    <span>Create Citizen Account</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
