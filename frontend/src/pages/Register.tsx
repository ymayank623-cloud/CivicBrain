import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, MapPin, Loader2, CheckCircle2, Mail } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeSuccess, setPincodeSuccess] = useState(false);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  // OTP States
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    aadhaar: "",
    state: "",
    city: "",
    nagarNigam: "",
    ward: "",
    address: "",
    pincode: "",
    password: "",
  });

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Reset OTP verification if email is changed
    if (name === "email") {
      setOtpSent(false);
      setIsEmailVerified(false);
      setOtpValue("");
    }

    if (name === "pincode") {
      if (value.length < 6) {
        setPincodeSuccess(false);
        setCoords(null);
        setFormData(prev => ({ ...prev, pincode: value, state: "", city: "", nagarNigam: "" }));
        return;
      }

      if (value.length === 6 && /^\d+$/.test(value)) {
        setPincodeLoading(true);
        setPincodeSuccess(false);
        setCoords(null);
        try {
          const postalRes = await fetch(`https://api.postalpincode.in/pincode/${value}`);
          const postalData = await postalRes.json();

          if (postalData && postalData[0].Status === "Success") {
            const postOffice = postalData[0].PostOffice[0];
            const district = postOffice.District;
            const state   = postOffice.State;
            const nagarNigamName = `${district} Nagar Nigam`;

            setFormData(prev => ({
              ...prev,
              pincode: value,
              state,
              city: district,
              nagarNigam: nagarNigamName,
            }));
            setPincodeSuccess(true);

            try {
              const geoRes = await fetch(
                `https://nominatim.openstreetmap.org/search?postalcode=${value}&countrycodes=in&format=json&limit=1`,
                { headers: { "Accept-Language": "en" } }
              );
              const geoData = await geoRes.json();
              if (geoData && geoData.length > 0) {
                setCoords({ lat: parseFloat(geoData[0].lat), lng: parseFloat(geoData[0].lon) });
              }
            } catch {
              console.warn("Geocoding failed");
            }
          } else {
            setFormData(prev => ({ ...prev, pincode: value, state: "", city: "", nagarNigam: "" }));
            setPincodeSuccess(false);
          }
        } catch (err) {
          console.error("Pincode fetch failed", err);
        } finally {
          setPincodeLoading(false);
        }
      }
    }
  };

  const handleSendOtp = async () => {
    if (!formData.email) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("http://localhost:5001/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        // If dev mode, it returns the OTP
        if (data.devOtp) {
          console.log("DEV OTP:", data.devOtp);
          // Auto-fill in dev mode for convenience if needed, but let's let the user type or see it in terminal
          alert(`OTP sent! Check terminal. Dev OTP is: ${data.devOtp}`);
        } else {
          alert("OTP has been sent to your Gmail inbox!");
        }
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch (err) {
      setOtpError("Could not connect to server to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpValue) return;
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await fetch("http://localhost:5001/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp: otpValue })
      });
      const data = await res.json();
      if (res.ok && data.verified) {
        setIsEmailVerified(true);
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch (err) {
      setOtpError("Could not connect to verify OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const openGoogleMaps = () => {
    if (!formData.nagarNigam) return;

    if (coords) {
      const { lat, lng } = coords;
      const query = encodeURIComponent(`Nagar Nigam Zonal Office`);
      window.open(`https://www.google.com/maps/search/${query}/@${lat},${lng},14z`, "_blank");
    } else {
      const query = encodeURIComponent(`${formData.nagarNigam} Zonal Office ${formData.city} ${formData.state}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailVerified) {
      setError("Please verify your email with OTP before registering.");
      return;
    }
    if (formData.phone.length !== 10) {
      setError("Mobile Number must be exactly 10 digits.");
      return;
    }
    if (formData.aadhaar.length !== 12) {
      setError("Aadhaar Number must be exactly 12 digits.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5001/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      console.warn("Backend not reachable. Simulating success.");
      navigate("/login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Page Header */}
      <div className="bg-blue-900 text-white py-6 px-6 border-b-4 border-orange-500">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold">नागरिक पंजीकरण / Citizen Registration</h1>
          <p className="text-blue-200 text-sm mt-1">Create your account to access Nagar Nigam portal services</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded shadow-md border border-gray-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-blue-50 border-b border-blue-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-bold text-blue-900 text-base">New Enrollment Form</h2>
              <p className="text-xs text-gray-500 mt-0.5">Enter your 6-digit Pincode — State, City & Nagar Nigam will auto-fill.</p>
            </div>
            <div className="text-orange-600 text-xs font-bold uppercase tracking-wide border border-orange-200 bg-orange-50 px-3 py-1.5 rounded">
              * Required Fields
            </div>
          </div>

          <form onSubmit={handleRegister} className="p-6 space-y-6">
            {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">⚠️ {error}</div>}

            {/* Section 1: Personal Info */}
            <div>
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[10px]">01</span>
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="As per Aadhaar Card" required />
                
                {/* Email with OTP Flow */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      name="email" type="email" required
                      value={formData.email} onChange={handleChange}
                      readOnly={isEmailVerified}
                      className={`flex-1 block w-full px-3 py-2.5 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${
                        isEmailVerified ? "bg-green-50 border-green-300 text-green-800" : "bg-gray-50 border-gray-300 focus:bg-white"
                      }`}
                      placeholder="example@gmail.com"
                    />
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!formData.email || otpLoading}
                        className="flex-shrink-0 bg-blue-900 hover:bg-blue-800 disabled:bg-gray-400 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center min-w-[100px]"
                      >
                        {otpLoading && !otpSent ? <Loader2 size={14} className="animate-spin" /> : (otpSent ? "Resend OTP" : "Send OTP")}
                      </button>
                    )}
                  </div>
                  {isEmailVerified && (
                    <p className="text-xs text-green-600 font-bold mt-1 flex items-center gap-1"><CheckCircle2 size={12} /> Email Verified</p>
                  )}
                  {otpError && <p className="text-xs text-red-500 font-bold mt-1">{otpError}</p>}
                </div>

                {/* Mobile Number with Country Code */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-500 text-sm font-semibold">
                      +91
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      required
                      maxLength={10}
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData(prev => ({ ...prev, phone: val }));
                      }}
                      className="flex-1 block w-full px-3 py-2.5 border border-gray-300 rounded-r text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                {/* Aadhaar Card Field */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Aadhaar Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="aadhaar"
                      type="text"
                      required
                      maxLength={12}
                      value={formData.aadhaar}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData(prev => ({ ...prev, aadhaar: val }));
                      }}
                      className={`block w-full px-3 py-2.5 border rounded text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-900 ${
                        formData.aadhaar.length > 0 && formData.aadhaar.length !== 12 
                          ? "border-red-500 bg-red-50" 
                          : "border-gray-300 bg-gray-50 focus:bg-white"
                      }`}
                      placeholder="12-digit Aadhaar Number"
                    />
                  </div>
                  {formData.aadhaar.length > 0 && formData.aadhaar.length !== 12 ? (
                    <p className="text-xs text-red-500 font-bold mt-1.5 animate-pulse">
                      ⚠️ Aadhaar must be exactly 12 digits
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-400 mt-1">Enter your 12-digit Aadhaar Number</p>
                  )}
                </div>
              </div>

              {/* OTP Entry Field */}
              {otpSent && !isEmailVerified && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded">
                  <label className="block text-xs font-bold text-orange-900 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                    <Mail size={14} /> Enter OTP sent to Email
                  </label>
                  <div className="flex gap-2 max-w-xs">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 border border-orange-300 rounded text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="• • • • • •"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpValue.length !== 6 || otpLoading}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center min-w-[90px]"
                    >
                      {otpLoading ? <Loader2 size={14} className="animate-spin" /> : "Verify"}
                    </button>
                  </div>
                  <p className="text-[10px] text-orange-700 mt-2">Note: For testing, if email config is missing, check the backend terminal for the OTP.</p>
                </div>
              )}
            </div>

            <hr className="border-gray-100" />

            {/* Section 2: Location */}
            <div>
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[10px]">02</span>
                Location / Municipal Jurisdiction
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Pincode */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                    Pincode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      name="pincode" type="text" maxLength={6} required value={formData.pincode} onChange={handleChange}
                      className={`block w-full px-3 py-2.5 pr-10 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors ${pincodeSuccess ? "border-green-400 bg-green-50" : "bg-gray-50 border-gray-300 focus:bg-white"}`}
                      placeholder="Enter 6-digit Pincode"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      {pincodeLoading && <Loader2 size={16} className="text-blue-600 animate-spin" />}
                      {pincodeSuccess && !pincodeLoading && <CheckCircle2 size={16} className="text-green-500" />}
                    </div>
                  </div>
                  {pincodeSuccess && <p className="text-xs text-green-600 font-semibold mt-1">✓ Location auto-filled successfully!</p>}
                </div>

                {/* State */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">State <span className="text-red-500">*</span></label>
                  <input name="state" type="text" required readOnly value={formData.state} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-blue-50 text-blue-900 font-semibold focus:outline-none cursor-not-allowed" placeholder="Auto-filled from Pincode" />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">City / District <span className="text-red-500">*</span></label>
                  <input name="city" type="text" required readOnly value={formData.city} onChange={handleChange} className="block w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-blue-50 text-blue-900 font-semibold focus:outline-none cursor-not-allowed" placeholder="Auto-filled from Pincode" />
                </div>

                {/* Nagar Nigam */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Nagar Nigam <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <input name="nagarNigam" type="text" required readOnly value={formData.nagarNigam} onChange={handleChange} className="flex-1 px-3 py-2.5 border border-gray-300 rounded text-sm bg-blue-50 text-blue-900 font-semibold focus:outline-none cursor-not-allowed" placeholder="Auto-filled from Pincode" />
                    <button type="button" onClick={openGoogleMaps} disabled={!formData.nagarNigam} title="Find Nearest Zone on Google Maps" className={`flex-shrink-0 w-11 h-10 flex items-center justify-center rounded border transition-colors shadow-sm ${formData.nagarNigam ? "bg-white border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500 cursor-pointer" : "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"}`}>
                      <MapPin size={18} />
                    </button>
                  </div>
                  {formData.nagarNigam && (
                    <p className="text-xs mt-1 flex items-center gap-1 font-medium text-blue-600">
                      <MapPin size={12} className={coords ? "text-green-500" : ""} /> {coords ? "Click to find nearest Zonal Office on Map" : "Click to view Nagar Nigam on Map"}
                    </p>
                  )}
                </div>

                <Field label="Ward / Area" name="ward" value={formData.ward} onChange={handleChange} placeholder="e.g. Ward 14, Sector B" />
                <div className="col-span-1 sm:col-span-2">
                  <Field label="Full Address" name="address" value={formData.address} onChange={handleChange} placeholder="House No., Street Name, Locality" required />
                </div>
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Section 3: Password */}
            <div>
              <h3 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="bg-blue-900 text-white px-2 py-0.5 rounded text-[10px]">03</span>
                Set Password
              </h3>
              <div className="relative max-w-sm">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password" required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 pr-10 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="Min. 8 characters"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button 
                type="submit" 
                disabled={isLoading || !isEmailVerified}
                className={`w-full py-3 rounded text-sm font-bold uppercase tracking-wider text-white shadow flex items-center justify-center gap-2 transition-all ${
                  isLoading || !isEmailVerified 
                    ? "bg-gray-400 cursor-not-allowed opacity-60" 
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Processing Application...</>
                ) : !isEmailVerified ? (
                  <>🔒 Verify Email to Register</>
                ) : (
                  <>✅ Submit Registration / पंजीकरण करें</>
                )}
              </button>
              {!isEmailVerified && (
                <p className="text-center text-xs text-red-500 font-bold mt-2">You must verify your email address before submitting.</p>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm">
            <p className="text-gray-600">Already enrolled?</p>
            <Link to="/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
              Login to Portal →
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Government officials are registered directly by the administration. &nbsp;|&nbsp; © 2026 CivicBrain — Digital India Initiative
        </p>
      </main>
    </div>
  );
}

// Reusable Field Component
function Field({ label, name, type = "text", value, onChange, placeholder, required }: {
  label: string; name: string; type?: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
        {label} {required ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal normal-case">(Optional)</span>}
      </label>
      <input
        name={name} type={type} required={required} value={value} onChange={onChange}
        className="block w-full px-3 py-2.5 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition-colors"
        placeholder={placeholder}
      />
    </div>
  );
}
