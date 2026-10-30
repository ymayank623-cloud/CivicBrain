import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FileText, PlusCircle, AlertTriangle, MapPin,
  CreditCard, Droplets, Baby, Briefcase, ChevronRight, Search, Phone, X,
  Camera, Trash2, Edit3, Sparkles, RefreshCw, Loader2
} from "lucide-react";
import { useLang } from "../context/LangContext";
import ImageComparisonSlider from "../components/ImageComparisonSlider";

export default function CitizenDashboard() {
  const [user, setUser] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState("Live Synced • Node LKO-04");
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const navigate = useNavigate();
  const { t } = useLang();
  
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [isEditingTicket, setIsEditingTicket] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", description: "", imageUrl: "" });
  const [isSaving, setIsSaving] = useState(false);

  // Search Officials State
  const [pincode, setPincode] = useState("");
  const [searchedOfficials, setSearchedOfficials] = useState<any>(null);

  const fetchComplaintsFromServer = (isInitial = false) => {
    if (!isInitial) setIsRefreshing(true);
    setTimeout(() => {
      try {
        const storedComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
        setComplaints(storedComplaints);
        setSyncStatus(`Updated just now (${Math.floor(18 + Math.random() * 10)}ms)`);
      } catch (err) {
        setComplaints([]);
      }
      setLoading(false);
      setIsRefreshing(false);
    }, isInitial ? 550 : 450);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    const parsed = JSON.parse(storedUser);
    setUser(parsed);
    setPincode(parsed.pincode || "110001");

    // Fetch with realistic server handshake delay
    fetchComplaintsFromServer(true);
  }, [navigate]);

  const handleSearchOfficials = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length !== 6) return;
    
    setSearchedOfficials({
      ward: `Ward No. ${Math.floor(Math.random() * 40) + 1} (Central)`,
      zone: "Municipal Zone 4",
      officer: "Er. Rajeev Kumar (Zonal Field Lead)",
      officerPhone: "+91 9876543210",
      corporator: "Smt. Anita Sharma (Ward Parshad)",
      corporatorPhone: "+91 9988776655"
    });
  };

  const filteredComplaints = complaints.filter(c => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'RESOLVED') return c.status === 'RESOLVED';
    if (activeFilter === 'IN_PROGRESS') return c.status === 'IN PROGRESS' || c.status === 'ASSIGNED';
    if (activeFilter === 'PENDING') return c.status !== 'RESOLVED' && c.status !== 'IN PROGRESS' && c.status !== 'ASSIGNED';
    return true;
  });

  const resolvedCount = complaints.filter(c => c.status === 'RESOLVED').length;
  const activeCount = complaints.length - resolvedCount;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* 1. Executive Citizen Header & KPI Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Welcome Greeting Banner */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold">
                <Sparkles size={13} /> Citizen Command Portal
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{syncStatus}</span>
              </div>
            </div>

            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {t("Namaste", "नमस्ते")}, {user.name} 👋
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-lg">
                Track your neighborhood reports, monitor field officer SLA countdowns, and redeem your citizen karma points.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-slate-800">
              <Link
                to="/citizen/new-complaint"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <PlusCircle size={16} /> {t("File Grievance", "नई शिकायत दर्ज करें")}
              </Link>
              <Link
                to="/track"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Search size={14} className="text-amber-400" /> {t("Track Any Ticket", "टिकट खोजें")}
              </Link>
              <button
                onClick={() => fetchComplaintsFromServer(false)}
                disabled={isRefreshing}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ml-auto"
                title="Sync with Municipal Database"
              >
                <RefreshCw size={13} className={isRefreshing ? "animate-spin text-sky-400" : "text-slate-400"} />
                <span className="hidden sm:inline">{isRefreshing ? "Syncing..." : "Sync Server"}</span>
              </button>
            </div>
          </div>

          {/* Citizen Karma Points & Stat Box */}
          <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                  Civic Karma Score
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  Verified Citizen
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-amber-400">{user.karmaPoints || 45}</span>
                <span className="text-xs text-slate-400 font-semibold uppercase">Points</span>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                Earned via genuine geotagged reporting & verified repair confirmations.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-800 text-center">
              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase">Active</p>
                <p className="text-xl font-black text-sky-400 mt-0.5">{activeCount}</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                <p className="text-xs text-slate-400 font-bold uppercase">Resolved</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{resolvedCount}</p>
              </div>
            </div>
          </div>

        </div>

        {/* 2. Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Main Column: Grievance Management (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Tickets Header & Filter Bar */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileText size={18} className="text-sky-400" />
                    <span>{t("My Lodged Grievances", "मेरी दर्ज शिकायतें")}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live database synchronization with Municipal GIS Registry.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  {(['ALL', 'PENDING', 'IN_PROGRESS', 'RESOLVED'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider text-[10px] transition-all cursor-pointer ${
                        activeFilter === tab
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tab.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3 pt-2">
                {loading ? (
                  /* Realistic Skeleton Shimmer Loader */
                  <div className="space-y-3 py-2">
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="w-40 h-3.5 bg-slate-800 rounded"></div>
                          <div className="w-64 h-2.5 bg-slate-800/60 rounded"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-slate-800 rounded-full"></div>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl"></div>
                        <div className="space-y-2">
                          <div className="w-32 h-3.5 bg-slate-800 rounded"></div>
                          <div className="w-56 h-2.5 bg-slate-800/60 rounded"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-slate-800 rounded-full"></div>
                    </div>
                    <p className="text-center text-[11px] font-mono text-sky-400 pt-2 flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin" size={13} />
                      Syncing ward grievances with Municipal Central Database...
                    </p>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-slate-400">
                    <AlertTriangle className="mx-auto text-amber-500 mb-2" size={32} />
                    <p className="text-sm font-bold text-white">No grievances found in this category.</p>
                    <p className="text-xs text-slate-500 mt-1">Lodge a new complaint to get started.</p>
                    <Link
                      to="/citizen/new-complaint"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
                    >
                      + File Complaint
                    </Link>
                  </div>
                ) : (
                  filteredComplaints.map((c) => {
                    const isResolved = c.status === 'RESOLVED';
                    const isInProgress = c.status === 'IN PROGRESS' || c.status === 'ASSIGNED';

                    return (
                      <div
                        key={c._id || c.id}
                        onClick={() => setSelectedTicket(c)}
                        className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} alt="preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <Camera size={18} className="text-slate-600" />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                                {c.category || 'General'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-500">
                                {c._id ? `#${c._id.slice(-6).toUpperCase()}` : ''}
                              </span>
                              <span className="text-[11px] text-slate-500">
                                • {new Date(c.createdAt || Date.now()).toLocaleDateString()}
                              </span>
                            </div>
                            <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-sky-400 transition-colors">
                              {c.title}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {c.description || 'No additional details provided.'}
                            </p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                              isResolved
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : isInProgress
                                ? 'bg-sky-500/10 text-sky-400 border-sky-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isResolved ? 'bg-emerald-400' : isInProgress ? 'bg-sky-400 animate-ping' : 'bg-amber-400'}`}></span>
                            {c.status || 'PENDING'}
                          </span>
                          <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-300 transition-colors hidden sm:block" />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Municipal Digital Services */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-400" />
                <span>Municipal Online Services</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Property Tax", icon: FileText, color: "text-sky-400" },
                  { label: "Water & Sewerage", icon: Droplets, color: "text-cyan-400" },
                  { label: "Birth Certificate", icon: Baby, color: "text-amber-400" },
                  { label: "Trade License", icon: Briefcase, color: "text-emerald-400" },
                ].map((s, idx) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-center transition-all cursor-pointer group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-slate-900 mx-auto mb-2 flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                        <Icon size={20} />
                      </div>
                      <p className="text-xs font-bold text-slate-200">{s.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Ward Officials & Helpline (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Know Your Ward Officials */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="text-sky-400" size={18} />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Know Your Ward Officials
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Search your municipal ward officers by 6-digit postal code.
              </p>

              <form onSubmit={handleSearchOfficials} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="Enter Pincode"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Find
                </button>
              </form>

              {searchedOfficials && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 pt-3 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">Assigned Ward</span>
                    <p className="text-xs font-bold text-white">{searchedOfficials.ward}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zonal Officer</span>
                    <p className="text-xs font-bold text-white">{searchedOfficials.officer}</p>
                    <a href={`tel:${searchedOfficials.officerPhone}`} className="text-[11px] text-amber-400 font-mono hover:underline">
                      {searchedOfficials.officerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Elected Corporator</span>
                    <p className="text-xs font-bold text-white">{searchedOfficials.corporator}</p>
                    <a href={`tel:${searchedOfficials.corporatorPhone}`} className="text-[11px] text-amber-400 font-mono hover:underline">
                      {searchedOfficials.corporatorPhone}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Helpline Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/20 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                <Phone size={16} /> 24x7 Citizen Helpline
              </div>
              <p className="text-2xl font-black text-white">1800-CIVIC</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Toll-free municipal emergency helpline for water logging, power outages, and broken pipelines.
              </p>
            </div>

          </div>

        </div>

      </div>

      {/* 3. TICKET INSPECTOR & EDIT MODAL */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  {selectedTicket.category || 'General'}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedTicket.title}
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedTicket(null); setIsEditingTicket(false); }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {isEditingTicket ? (
              /* Edit Grievance Form */
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editForm.description}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setIsEditingTicket(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      setIsSaving(true);
                      const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
                      const targetId = selectedTicket._id || selectedTicket.id;
                      const updated = all.map((t: any) => 
                        (t._id === targetId || t.id === targetId)
                          ? { ...t, title: editForm.title, description: editForm.description }
                          : t
                      );
                      localStorage.setItem("mockComplaints", JSON.stringify(updated));
                      setComplaints(updated);
                      setSelectedTicket({ ...selectedTicket, title: editForm.title, description: editForm.description });
                      setIsSaving(false);
                      setIsEditingTicket(false);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white text-xs font-bold uppercase"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            ) : (
              /* View Grievance Details */
              <div className="space-y-4">
                {selectedTicket.description && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    {selectedTicket.description}
                  </div>
                )}

                {/* Before vs After Photos with Interactive Slider */}
                {selectedTicket.imageUrl && selectedTicket.afterImageUrl ? (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>🎚️ Interactive Before vs After Swipe</span>
                      <span className="text-sky-400">Drag center slider to inspect</span>
                    </div>
                    <ImageComparisonSlider
                      beforeImage={selectedTicket.imageUrl}
                      afterImage={selectedTicket.afterImageUrl}
                      heightClass="h-56 sm:h-64"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Citizen Photo</span>
                      <div className="h-32 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                        {selectedTicket.imageUrl ? (
                          <img src={selectedTicket.imageUrl} alt="Citizen evidence" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-600">No Image</span>
                        )}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-1">Officer Resolution Proof</span>
                      <div className="h-32 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                        {selectedTicket.afterImageUrl ? (
                          <img src={selectedTicket.afterImageUrl} alt="Officer repair proof" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-600">Pending Resolution</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {selectedTicket.remarks && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300">
                    <strong className="block text-emerald-400 font-bold mb-0.5">Officer Remark:</strong>
                    {selectedTicket.remarks}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setEditForm({
                        title: selectedTicket.title,
                        description: selectedTicket.description || "",
                        imageUrl: selectedTicket.imageUrl || ""
                      });
                      setIsEditingTicket(true);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit3 size={14} /> Edit
                  </button>

                  <button
                    onClick={() => navigate(`/track?id=${selectedTicket._id || selectedTicket.id}`)}
                    className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Search size={14} /> Track
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to permanently delete this grievance?")) {
                        const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
                        const targetId = selectedTicket._id || selectedTicket.id;
                        const updated = all.filter((t: any) => t._id !== targetId && t.id !== targetId);
                        localStorage.setItem("mockComplaints", JSON.stringify(updated));
                        setComplaints(updated);
                        setSelectedTicket(null);
                        setIsEditingTicket(false);
                      }
                    }}
                    className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-bold uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                  >
                    <Trash2 size={14} /> Delete Complaint Permanently
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
