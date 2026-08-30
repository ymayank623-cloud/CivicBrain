import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, PlusCircle, AlertTriangle, Bell, MapPin, 
  CreditCard, Droplets, Baby, Briefcase, ChevronRight, Search, Phone, X,
  Camera, Upload
} from "lucide-react";

export default function CitizenDashboard() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", imageUrl: "" });

  // Search Officials State
  const [pincode, setPincode] = useState("");
  const [searchedOfficials, setSearchedOfficials] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    setPincode(parsed.pincode || "");

    // Fetch Complaints from localStorage
    setTimeout(() => {
      try {
        const storedComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
        setComplaints(storedComplaints);
      } catch (err) {
        setComplaints([]);
      }
      setLoading(false);
    }, 800);
  }, [navigate]);

  const handleSearchOfficials = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    
    // Mock Official Data based on pincode
    setSearchedOfficials({
      ward: `Ward No. ${Math.floor(Math.random() * 50) + 1}`,
      zone: "Central Zone",
      officer: "Mr. Rajeev Kumar (Zonal Officer)",
      officerPhone: "+91 9876543210",
      corporator: "Smt. Anita Sharma (Parshad)",
      corporatorPhone: "+91 9988776655"
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Welcome & Stats */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-blue-900">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-1">Nagar Nigam Citizen Dashboard | {user.city || 'Smart City'}</p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
            <div className="text-center px-4 border-r border-gray-100">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Karma Points</p>
              <p className="text-xl font-black text-orange-600">{user.karmaPoints || 40}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Active Tickets</p>
              <p className="text-xl font-black text-blue-900">{complaints.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Main Actions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Quick Services & Payments */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 text-white px-6 py-4 flex items-center gap-2">
                <CreditCard size={20} />
                <h2 className="font-bold text-lg">Quick Services & Payments</h2>
              </div>
              <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all text-blue-900 group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:text-orange-600">
                    <FileText size={24} />
                  </div>
                  <span className="text-xs font-bold text-center">Property Tax</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all text-blue-900 group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:text-orange-600">
                    <Droplets size={24} />
                  </div>
                  <span className="text-xs font-bold text-center">Water/Sewer Bill</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all text-blue-900 group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:text-orange-600">
                    <Baby size={24} />
                  </div>
                  <span className="text-xs font-bold text-center">Birth/Death Cert.</span>
                </button>
                <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-all text-blue-900 group">
                  <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:text-orange-600">
                    <Briefcase size={24} />
                  </div>
                  <span className="text-xs font-bold text-center">Trade License</span>
                </button>
              </div>
            </div>

            {/* 2. Grievance Redressal */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={20} />
                  <h2 className="font-bold text-lg">Grievance Redressal (शिकायत)</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Link to="/citizen/new-complaint" className="bg-orange-50 border-2 border-orange-200 p-5 rounded-xl hover:bg-orange-100 transition-colors flex flex-col justify-between">
                    <div>
                      <PlusCircle className="text-orange-600 mb-3" size={32} />
                      <h3 className="font-bold text-blue-900 text-lg mb-1">Lodge New Complaint</h3>
                      <p className="text-xs text-gray-600 mb-4">Report potholes, garbage, streetlights with GPS & Photos.</p>
                    </div>
                    <span className="text-orange-600 font-bold text-xs uppercase tracking-wider flex items-center">File Now <ChevronRight size={14} className="ml-1" /></span>
                  </Link>

                  <div className="bg-blue-50 border-2 border-blue-100 p-5 rounded-xl flex flex-col justify-between">
                    <div>
                      <Search className="text-blue-600 mb-3" size={32} />
                      <h3 className="font-bold text-blue-900 text-lg mb-1">Track Status</h3>
                      <p className="text-xs text-gray-600 mb-4">Enter your ticket number to see live official updates.</p>
                    </div>
                    <form className="flex mt-2" onSubmit={(e) => { e.preventDefault(); navigate('/track'); }}>
                      <input type="text" placeholder="Ticket ID (CB-XXX)" className="w-full text-xs px-3 py-2 border rounded-l focus:ring-1 focus:ring-blue-600" />
                      <button className="bg-blue-900 text-white px-3 text-xs font-bold rounded-r uppercase tracking-wider">Search</button>
                    </form>
                  </div>
                </div>

                <h3 className="font-bold text-gray-800 text-sm mb-4 uppercase tracking-wider">Recent Tickets</h3>
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center p-6 text-gray-400 text-sm animate-pulse">Loading tickets...</div>
                  ) : complaints.length === 0 ? (
                    <div className="text-center p-6 text-gray-400 text-sm border border-dashed rounded bg-gray-50">No recent tickets found.</div>
                  ) : (
                    complaints.map(c => (
                      <div 
                        key={c._id} 
                        onClick={() => setSelectedTicket(c)}
                        className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-orange-50 hover:border-orange-200 transition-colors cursor-pointer group shadow-sm"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">{c.category}</span>
                            <span className="text-xs text-gray-500 font-medium">{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="font-bold text-gray-800 text-sm group-hover:text-blue-900 transition-colors">{c.title}</p>
                        </div>
                        <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-200">
                          {c.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* RIGHT COLUMN: Info & Widgets */}
          <div className="space-y-8">
            
            {/* 3. Locate Your Ward & Officials */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-200 px-5 py-4">
                <h2 className="font-bold text-blue-900 flex items-center gap-2"><MapPin size={18} /> Know Your Officials</h2>
              </div>
              <div className="p-5">
                <form onSubmit={handleSearchOfficials} className="flex gap-2 mb-5">
                  <input 
                    type="text" 
                    placeholder="Enter Pincode" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-full text-sm px-3 py-2 border rounded bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-900" 
                  />
                  <button type="submit" className="bg-blue-900 text-white px-3 rounded hover:bg-blue-800 transition-colors">
                    <Search size={16} />
                  </button>
                </form>

                {searchedOfficials ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-orange-50 border border-orange-200 rounded p-3 text-center">
                      <p className="font-bold text-orange-900">{searchedOfficials.ward}</p>
                      <p className="text-xs text-orange-700">{searchedOfficials.zone}</p>
                    </div>
                    
                    <div className="border border-gray-100 rounded p-3">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Zonal Officer</p>
                      <p className="text-sm font-bold text-blue-900">{searchedOfficials.officer}</p>
                      <a href={`tel:${searchedOfficials.officerPhone}`} className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium"><Phone size={12}/> {searchedOfficials.officerPhone}</a>
                    </div>

                    <div className="border border-gray-100 rounded p-3">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1">Local Parshad (Corporator)</p>
                      <p className="text-sm font-bold text-blue-900">{searchedOfficials.corporator}</p>
                      <a href={`tel:${searchedOfficials.corporatorPhone}`} className="text-xs text-blue-600 flex items-center gap-1 mt-1 font-medium"><Phone size={12}/> {searchedOfficials.corporatorPhone}</a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <MapPin size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-xs">Enter your pincode to find your local representatives.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 4. Notices, Alerts & Tenders */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-red-50 border-b border-red-100 px-5 py-4">
                <h2 className="font-bold text-red-900 flex items-center gap-2"><Bell size={18} /> Public Notices & Alerts</h2>
              </div>
              <div className="p-5 space-y-4">
                
                <div className="flex gap-3 items-start border-b border-gray-100 pb-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Water Supply Disruption</h4>
                    <p className="text-xs text-gray-600 mt-1">Scheduled maintenance in West Zone on 15th Aug, 10 AM to 4 PM.</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">2 hours ago</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start border-b border-gray-100 pb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Swachh Bharat Abhiyan</h4>
                    <p className="text-xs text-gray-600 mt-1">Join the mega cleanliness drive this Sunday at Central Park.</p>
                    <span className="text-[10px] text-gray-400 mt-1 block">Yesterday</span>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">Active Tenders</h4>
                    <p className="text-xs text-gray-600 mt-1">E-Tender for Road Repair in Ward 42 is now open.</p>
                    <Link to="#" className="text-[10px] font-bold uppercase tracking-wider text-blue-600 mt-1 block hover:underline">View Document</Link>
                  </div>
                </div>

              </div>
              <button className="w-full bg-gray-50 text-xs font-bold text-gray-600 uppercase tracking-wider py-3 hover:bg-gray-100 transition-colors">
                View All Notices
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* TICKET MODAL (View & Edit) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => { setSelectedTicket(null); setIsEditingTicket(false); }} className="absolute top-4 right-4 text-gray-400 hover:text-gray-800">
              <X size={20} />
            </button>
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-1 rounded uppercase tracking-wider">{selectedTicket.category}</span>
              <span className="text-xs text-gray-500 font-bold tracking-wider">{selectedTicket._id}</span>
            </div>

            {isEditingTicket ? (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Edit Grievance</h3>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Title</label>
                  <input type="text" value={editForm.title} onChange={e => setEditForm({...editForm, title: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none text-sm font-medium bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Description</label>
                  <textarea rows={3} value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-none text-sm font-medium bg-gray-50 focus:bg-white resize-none"></textarea>
                </div>
                
                {/* Add / Update Evidence Photo */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                    Evidence Photo (Before)
                  </label>
                  {editForm.imageUrl ? (
                    <div className="relative rounded-xl overflow-hidden border border-gray-300 h-36 bg-gray-100 flex items-center justify-center">
                      <img src={editForm.imageUrl} alt="Grievance evidence" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={() => setEditForm({ ...editForm, imageUrl: "" })}
                        className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow transition-colors"
                        title="Remove photo"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-xl p-4 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer">
                      <Camera size={22} className="text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-gray-700">Click to Upload / Add Photo</span>
                      <span className="text-[10px] text-gray-500">PNG, JPG, WebP up to 10MB</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditForm({ ...editForm, imageUrl: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-3 pt-2">
                  <div className="flex gap-3">
                    <button onClick={() => setIsEditingTicket(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">Cancel</button>
                    <button onClick={() => {
                      const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
                      const updated = all.map((t:any) => t._id === selectedTicket._id ? {
                        ...t, 
                        title: editForm.title, 
                        description: editForm.description,
                        imageUrl: editForm.imageUrl || undefined
                      } : t);
                      localStorage.setItem("mockComplaints", JSON.stringify(updated));
                      setComplaints(updated);
                      setSelectedTicket({
                        ...selectedTicket, 
                        title: editForm.title, 
                        description: editForm.description,
                        imageUrl: editForm.imageUrl || undefined
                      });
                      setIsEditingTicket(false);
                    }} className="flex-1 bg-[#111827] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors shadow-lg">Save Changes</button>
                  </div>
                  
                  <button onClick={() => {
                    if(window.confirm("Are you sure you want to permanently delete this grievance?")) {
                      const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
                      // Instead of completely removing it, we mark it as DELETED so officers can see it was withdrawn
                      const updated = all.map((t:any) => t._id === selectedTicket._id ? {...t, status: "DELETED BY CITIZEN"} : t);
                      localStorage.setItem("mockComplaints", JSON.stringify(updated));
                      setComplaints(updated);
                      setSelectedTicket(null);
                      setIsEditingTicket(false);
                    }
                  }} className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors border border-red-200 mt-2">
                    Delete Complaint Permanently
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedTicket.title}</h3>
                {selectedTicket.description && (
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedTicket.description}</p>
                  </div>
                )}
                
                {/* Before vs After Photos */}
                {(selectedTicket.imageUrl || selectedTicket.afterImageUrl) && (
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200 p-2">
                        <span className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                          Before (Citizen Evidence)
                        </span>
                        <div className="h-32 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                          {selectedTicket.imageUrl ? (
                            <img src={selectedTicket.imageUrl} alt="Before complaint" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-gray-400">No Image</span>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50/50 rounded-xl overflow-hidden border border-green-200 p-2">
                        <span className="text-[10px] font-bold uppercase text-green-800 block mb-1">
                          After (Officer Proof)
                        </span>
                        <div className="h-32 bg-green-100 rounded-lg overflow-hidden flex items-center justify-center border border-green-300">
                          {selectedTicket.afterImageUrl ? (
                            <img src={selectedTicket.afterImageUrl} alt="After resolution proof" className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center p-2">
                              <span className="text-xs text-gray-400 block">Pending Repair</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {selectedTicket.remarks && (
                      <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-gray-700">
                        <strong className="text-gray-900 block mb-0.5">Officer Resolution Remarks:</strong>
                        {selectedTicket.remarks}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3">
                  <button onClick={() => { setEditForm({ title: selectedTicket.title, description: selectedTicket.description || "", imageUrl: selectedTicket.imageUrl || "" }); setIsEditingTicket(true); }} className="flex-1 bg-white text-[#111827] py-3 rounded-xl text-xs font-bold uppercase tracking-wider border-2 border-gray-200 hover:border-gray-800 transition-colors">
                    Edit Grievance
                  </button>
                  <button onClick={() => { navigate(`/track?id=${selectedTicket._id}`); }} className="flex-1 bg-[#E05344] text-white py-3 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-600 shadow-lg transition-transform hover:-translate-y-0.5">
                    Live Track Status
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

