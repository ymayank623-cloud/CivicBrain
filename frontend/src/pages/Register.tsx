import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, User, Mail, MapPin, Lock, CheckCircle2, Loader2 } from 'lucide-react';

interface FormData {
  name: string; email: string; phone: string; aadhaar: string;
  gender: string; dob: string; address: string; pincode: string;
  city: string; state: string; password: string; confirmPassword: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  
  // OTP state
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', aadhaar: '',
    gender: '', dob: '', address: '', pincode: '',
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

  const getApiUrl = (endpoint: string) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return (isLocal ? 'http://localhost:5001' : 'https://civicbrain-api-2026.loca.lt') + endpoint;
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setOtpError('Please enter Email ID first.');
      return;
    }
    setOtpLoading(true);
    setOtpSent(false);
    setOtpError('');
    setOtpNotice('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(getApiUrl('/api/otp/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase() }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setOtpSent(true);
        setOtpNotice(`OTP has been sent to ${formData.email}. Please check your inbox!`);
      } else {
        setOtpError(data?.message || 'Failed to send OTP to email. Please check your email address.');
      }
    } catch (err) {
      setOtpError('Network error while sending OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim().length !== 6) {
      setOtpError('Please enter valid 6-digit OTP received on your email.');
      return;
    }
    setOtpLoading(true);
    setOtpError('');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(getApiUrl('/api/otp/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ email: formData.email.trim().toLowerCase(), otp: otp.trim() }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setEmailVerified(true);
        setOtpNotice('Email verified successfully!');
        setOtpError('');
      } else {
        setOtpError(data?.message || 'Invalid or expired OTP. Please check your email.');
      }
    } catch (err) {
      setOtpError('Unable to verify OTP right now. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!emailVerified) {
      setError('Please verify your Email ID via OTP before submitting.');
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
        phone: formData.phone,
        aadhaar: formData.aadhaar,
        pincode: formData.pincode,
        city: formData.city,
        state: formData.state,
        address: formData.address,
      });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
      setIsLoading(false);
      setStep('success');
      setTimeout(() => navigate('/login'), 2500);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] font-sans">
      {/* GOI Top Bar */}
      <div className="bg-[#1a3a6b] text-white text-[11px] px-4 py-1 flex justify-between">
        <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA | DIGITAL INDIA INITIATIVE</span>
        <span className="hidden sm:block">Screen Reader Access | Skip to Main Content</span>
      </div>

      {/* Ministry Header */}
      <div className="bg-white border-b-4 border-[#FF6B1A] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/120px-Emblem_of_India.svg.png"
            alt="Emblem of India" className="h-14 w-auto" />
          <div className="border-l-2 border-gray-300 pl-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ministry of Housing & Urban Affairs</p>
            <h1 className="text-xl sm:text-2xl font-bold text-[#1a3a6b]">CivicBrain — Nagar Nigam Portal</h1>
            <p className="text-[11px] text-orange-600 font-semibold">Citizen Grievance Redressal System (CGRS) | New Registration</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {step === 'success' ? (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-green-600" size={44} />
            </div>
            <h2 className="text-2xl font-bold text-[#1a3a6b] mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-1">Your citizen account has been created successfully.</p>
            <p className="text-sm text-gray-400">Redirecting to Login portal in 3 seconds...</p>
            <Link to="/login" className="mt-6 inline-block bg-[#1a3a6b] text-white px-8 py-3 rounded font-bold uppercase tracking-wider text-sm hover:bg-[#0f2547] transition-colors">
              Go to Login Now →
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-[#1a3a6b] px-6 py-4">
              <h2 className="text-white font-bold text-base uppercase tracking-wider">New Citizen Registration / नागरिक पंजीकरण</h2>
              <p className="text-blue-200 text-xs mt-0.5">All fields marked with * are mandatory</p>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded text-sm text-red-700">
                  <span className="font-bold">⚠ Error: </span>{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Section 1: Personal Details */}
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#1a3a6b]">
                    <User size={16} className="text-[#1a3a6b]" />
                    <h3 className="text-sm font-bold text-[#1a3a6b] uppercase tracking-wider">Personal Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="As per Aadhaar Card"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gender <span className="text-red-500">*</span></label>
                      <select name="gender" value={formData.gender} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]">
                        <option value="">Select Gender</option>
                        <option>Male</option><option>Female</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Birth <span className="text-red-500">*</span></label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleChange} required
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Aadhaar Number <span className="text-red-500">*</span></label>
                      <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={12} name="aadhaar" value={formData.aadhaar} onChange={handleChange} required placeholder="12-digit Aadhaar Number"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Mobile Number <span className="text-red-500">*</span></label>
                      <input type="tel" inputMode="numeric" pattern="[0-9]*" maxLength={10} name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit mobile number"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                  </div>
                </div>

                {/* Section 2: Email Verification */}
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#1a3a6b]">
                    <Mail size={16} className="text-[#1a3a6b]" />
                    <h3 className="text-sm font-bold text-[#1a3a6b] uppercase tracking-wider">Email Verification</h3>
                    {emailVerified && <span className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Verified</span>}
                  </div>
                  <div className="flex gap-2">
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required readOnly={emailVerified}
                      autoCapitalize="none" autoCorrect="off"
                      placeholder="Enter Email ID (e.g. citizen@gmail.com)" className={`flex-1 px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] ${emailVerified ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'}`} />
                    {!emailVerified && (
                      <button type="button" onClick={handleSendOtp} disabled={!formData.email || otpLoading}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider whitespace-nowrap flex items-center justify-center min-w-[100px]">
                        {otpLoading ? <Loader2 size={14} className="animate-spin"/> : 'Send OTP'}
                      </button>
                    )}
                  </div>

                  {otpNotice && !emailVerified && (
                    <div className="mt-2 text-xs text-blue-900 bg-blue-50 border border-blue-200 rounded p-2.5">
                      <p className="font-semibold">{otpNotice}</p>
                    </div>
                  )}

                  {otpSent && !emailVerified && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Enter 6-Digit OTP received on Email</label>
                      <div className="flex gap-2">
                        <input type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} value={otp} onChange={e => setOtp(e.target.value)}
                          placeholder="------"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm text-center tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] bg-white" />
                        <button type="button" onClick={handleVerifyOtp} disabled={otpLoading || !otp}
                          className="bg-[#1a3a6b] hover:bg-[#0f2547] disabled:bg-gray-400 text-white px-5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center min-w-[80px]">
                          {otpLoading ? <Loader2 size={14} className="animate-spin"/> : 'Verify'}
                        </button>
                      </div>
                      {otpError && <p className="text-red-600 text-xs mt-1.5 font-semibold">⚠ {otpError}</p>}
                    </div>
                  )}
                </div>

                {/* Section 3: Address */}
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#1a3a6b]">
                    <MapPin size={16} className="text-[#1a3a6b]" />
                    <h3 className="text-sm font-bold text-[#1a3a6b] uppercase tracking-wider">Address Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Address <span className="text-red-500">*</span></label>
                      <textarea name="address" value={formData.address} onChange={handleChange} required rows={2}
                        placeholder="House No., Street, Locality"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b] resize-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Pincode <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type="text" inputMode="numeric" pattern="[0-9]*" name="pincode" maxLength={6} value={formData.pincode} onChange={handleChange} required placeholder="6-digit Pincode"
                          className="w-full px-3 py-2.5 pr-8 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                        {pincodeLoading && <Loader2 className="absolute right-2.5 top-3 text-blue-600 animate-spin" size={15} />}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City / District <span className="text-red-500">*</span></label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} required placeholder="Auto-filled or type city"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State <span className="text-red-500">*</span></label>
                      <input type="text" name="state" value={formData.state} onChange={handleChange} required placeholder="Auto-filled or type state"
                        className="w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                    </div>
                  </div>
                </div>

                {/* Section 4: Password */}
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b-2 border-[#1a3a6b]">
                    <Lock size={16} className="text-[#1a3a6b]" />
                    <h3 className="text-sm font-bold text-[#1a3a6b] uppercase tracking-wider">Set Password</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} required
                          autoCapitalize="none" autoCorrect="off" placeholder="Min 6 characters"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-[#1a3a6b]">
                          {showPassword ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Confirm Password <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <input type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                          autoCapitalize="none" autoCorrect="off" placeholder="Re-enter password"
                          className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]" />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-3 text-gray-400 hover:text-[#1a3a6b]">
                          {showConfirm ? <EyeOff size={15}/> : <Eye size={15}/>}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Declaration */}
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <div className="flex gap-3 items-start">
                    <input type="checkbox" required className="mt-1 accent-[#1a3a6b]" />
                    <p className="text-xs text-gray-700 leading-relaxed">
                      I hereby declare that the information provided above is true and correct to the best of my knowledge.
                      I agree to the <span className="text-[#1a3a6b] font-bold underline cursor-pointer">Terms & Conditions</span> and{' '}
                      <span className="text-[#1a3a6b] font-bold underline cursor-pointer">Privacy Policy</span> of CivicBrain Portal.
                    </p>
                  </div>
                </div>

                <button type="submit" disabled={isLoading}
                  className="w-full bg-[#1a3a6b] hover:bg-[#0f2547] disabled:bg-gray-400 text-white py-3 rounded font-bold uppercase tracking-widest text-sm transition-colors shadow-md flex items-center justify-center gap-2">
                  {isLoading ? <><Loader2 size={16} className="animate-spin"/> Processing...</> : 'Submit Registration →'}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Already registered?{' '}
                  <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">Login Here →</Link>
                </p>
              </form>
            </div>

            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex flex-wrap gap-4 text-xs text-gray-500 justify-between">
              <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-green-600"/> SSL Secured | Data encrypted</span>
              <span>© 2025 CivicBrain | Ministry of Urban Development</span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[#1a3a6b] text-white text-xs py-3 px-4 text-center">
        <p>© 2025 Government of India. All Rights Reserved. | Terms of Use | Privacy Policy | Contact Us</p>
      </div>
    </div>
  );
}