import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User as UserIcon, Mail, ShieldAlert, CheckCircle2, Save } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    state: "",
    city: "",
    nagarNigam: "",
    ward: "",
    address: "",
    pincode: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setFormData({
      name: parsedUser.name || "",
      phone: parsedUser.phone || "",
      state: parsedUser.state || "",
      city: parsedUser.city || "",
      nagarNigam: parsedUser.nagarNigam || "",
      ward: parsedUser.ward || "",
      address: parsedUser.address || "",
      pincode: parsedUser.pincode || ""
    });
  }, [navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const updatedUser = { ...user, ...formData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    setSuccessMsg("Profile details updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          <UserIcon size={24} /> My Profile
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Immutable Details */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-400 to-blue-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                  {user.aadhaar ? (
                    <img src={`https://api.dicebear.com/7.x/micah/svg?seed=${user.aadhaar}&backgroundColor=f0f9ff`} alt="Aadhaar ID Photo" className="w-full h-full object-cover" title="Fetched via Aadhaar System" />
                  ) : (
                    <div className="w-full h-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-3xl uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-sm" title="Aadhaar Verified">
                  <CheckCircle2 size={12} className="text-white" />
                </div>
              </div>
              <h2 className="text-center font-bold text-lg text-gray-800">{user.name}</h2>
              <p className="text-center text-xs text-orange-600 font-bold uppercase tracking-wider mb-6">{user.role}</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Email Address</label>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1"><CheckCircle2 size={10} /> Verified ID</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Aadhaar / Virtual ID</label>
                  <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                    <ShieldAlert size={14} className="text-gray-400" />
                    <span>{user.aadhaar ? '********' + user.aadhaar.slice(-4) : 'Not Provided'}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">Immutable Govt ID</p>
                </div>
              </div>
            </div>
            
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 text-xs text-orange-800">
              <p className="font-bold flex items-center gap-1 mb-1">⚠️ Security Notice</p>
              Email and Aadhaar ID are permanently linked to this account for authentication purposes and cannot be modified.
            </div>
          </div>

          {/* Right Column: Editable Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                <h3 className="font-bold text-blue-900">Personal & Contact Details</h3>
                <p className="text-xs text-gray-500">Update your communication and location information.</p>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-4">
                {successMsg && (
                  <div className="bg-green-50 text-green-700 p-3 rounded text-sm border border-green-200 flex items-center gap-2 mb-4">
                    <CheckCircle2 size={16} /> {successMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone (+91)</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} maxLength={10} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" required />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                    <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">City / District</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Nagar Nigam</label>
                    <input type="text" name="nagarNigam" value={formData.nagarNigam} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Ward / Zone</label>
                    <input type="text" name="ward" value={formData.ward} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-900 text-sm" />
                </div>

                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded text-sm font-bold flex items-center gap-2 transition-colors">
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

