import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Shield, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

type Step = 'email' | 'otp' | 'newpassword' | 'success';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getApiUrl = (endpoint: string) => {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    return (isLocal ? 'http://localhost:5001' : 'https://civicbrain-api-2026.loca.lt') + endpoint;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/otp/send'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep('otp');
      } else {
        setError(data?.message || 'Failed to send OTP to email. Please check your email.');
      }
    } catch (err) {
      setError('Network error while connecting to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!otp || otp.trim().length !== 6) { setError('Please enter 6-digit OTP.'); return; }
    setIsLoading(true);

    try {
      const res = await fetch(getApiUrl('/api/otp/verify'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'bypass-tunnel-reminder': 'true',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setStep('newpassword');
      } else {
        setError(data?.message || 'Invalid or expired OTP. Please try again.');
      }
    } catch (err) {
      setError('Network error while verifying OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match.'); return; }
    
    // Update password in localStorage for this email
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const userIndex = users.findIndex((u: any) => u.email === email);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    } else {
      users.push({ email, password: newPassword, name: email.split('@')[0] });
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }

    setStep('success');
    setTimeout(() => navigate('/login'), 3000);
  };

  const steps = ['email', 'otp', 'newpassword'];

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-md overflow-hidden">
        <div className="bg-blue-900 text-white px-6 py-5 border-b-4 border-orange-500">
          <div className="flex items-center gap-3">
            <Shield size={20} />
            <div>
              <h2 className="font-bold text-lg">Reset Password</h2>
              <p className="text-blue-200 text-xs mt-0.5">Secure password recovery via Email OTP</p>
            </div>
          </div>
          <div className="flex items-center mt-4 gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                  ${step === s ? 'bg-orange-500 border-orange-500 text-white' :
                    steps.indexOf(step) > i || step === 'success' ? 'bg-green-500 border-green-500 text-white' :
                    'bg-transparent border-blue-400 text-blue-300'}`}>
                  {steps.indexOf(step) > i || step === 'success' ? <CheckCircle2 size={14}/> : i + 1}
                </div>
                {i < 2 && <div className={`flex-1 h-0.5 ${steps.indexOf(step) > i || step === 'success' ? 'bg-green-500' : 'bg-blue-700'}`}/>}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Enter Registered Email</h3>
                <p className="text-xs text-gray-500 mb-4">We will send a 6-digit OTP to your email address inbox.</p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-3">{error}</div>}
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Email Address *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400"/></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50"
                    placeholder="citizen@email.com"/>
                </div>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 size={16} className="animate-spin"/> Sending OTP to Mail...</> : 'Send OTP to Email →'}
              </button>
              <div className="text-center">
                <Link to="/login" className="text-xs text-blue-800 hover:text-orange-600 font-semibold flex items-center justify-center gap-1">
                  <ArrowLeft size={12}/> Back to Login
                </Link>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Enter OTP from Email</h3>
                <p className="text-xs text-gray-500 mb-1">6-digit verification code sent to:</p>
                <p className="text-sm font-bold text-blue-900 mb-4">{email}</p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-3">{error}</div>}
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Enter 6-Digit OTP *</label>
                <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50"
                  placeholder="------"/>
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 transition-colors flex items-center justify-center gap-2">
                {isLoading ? <><Loader2 size={16} className="animate-spin"/> Verifying...</> : 'Verify OTP →'}
              </button>
              <button type="button" onClick={() => setStep('email')} className="w-full text-xs text-gray-500 hover:text-blue-900 flex items-center justify-center gap-1">
                <ArrowLeft size={12}/> Change Email
              </button>
            </form>
          )}

          {step === 'newpassword' && (
            <form onSubmit={handleSetPassword} className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Set New Password</h3>
                <p className="text-xs text-gray-500 mb-4">Choose a strong password for your account.</p>
                {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm mb-3">{error}</div>}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">New Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400"/></div>
                  <input type={showNew ? 'text' : 'password'} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50" placeholder="Min 6 characters"/>
                  <button type="button" onClick={() => setShowNew(!showNew)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-900">
                    {showNew ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Confirm Password *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Lock className="h-4 w-4 text-gray-400"/></div>
                  <input type={showConfirm ? 'text' : 'password'} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 bg-gray-50" placeholder="Re-enter password"/>
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-900">
                    {showConfirm ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white bg-blue-900 hover:bg-blue-800 transition-colors">Reset Password →</button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="text-green-600" size={36}/>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Password Reset Successful!</h3>
              <p className="text-sm text-gray-500 mb-6">Redirecting to login page in 3 seconds...</p>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-4">
                <div className="bg-green-500 h-1.5 rounded-full transition-all" style={{width:'100%'}}/>
              </div>
              <Link to="/login" className="text-xs font-bold text-blue-900 hover:text-orange-600">Click here if not redirected →</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}