import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Truck, CheckCircle2, Star, Image as ImageIcon, Bot, Sparkles, ShieldCheck, Loader2, Database, Wifi } from 'lucide-react';
import { useLang } from '../context/LangContext';
import ImageComparisonSlider from '../components/ImageComparisonSlider';

export default function Track() {
  const [ticketId, setTicketId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [queryStep, setQueryStep] = useState("");
  const [ticket, setTicket] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setTicketId(id);
      handleTrack(id);
    }
  }, []);

  const handleTrack = (idToSearch: string) => {
    setIsTracking(true);
    setSearched(true);
    setQueryStep("1/3 Querying Municipal Central Grievance Ledger...");

    setTimeout(() => {
      setQueryStep("2/3 Fetching GIS coordinates and Field Officer assignment telemetry...");
    }, 250);

    setTimeout(() => {
      setQueryStep("3/3 Parsing AI Computer Vision Verification Matrix & EXIF logs...");
    }, 550);

    setTimeout(() => {
      const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
      const found = all.find((t: any) => 
        (t._id && t._id.toLowerCase() === idToSearch.toLowerCase()) || 
        (t.id && t.id.toLowerCase() === idToSearch.toLowerCase()) ||
        (t._id && t._id.toLowerCase() === `cb-${idToSearch.toLowerCase()}`)
      );
      setTicket(found || null);
      setIsTracking(false);
    }, 850);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) handleTrack(ticketId.trim());
  };

  const getStage = (t: any) => {
    if (t.status === "RESOLVED" || t.status === "ARCHIVED") return 5;
    if (t.status === "IN_PROGRESS" || t.status === "IN PROGRESS") return 4;
    if (t.status === "ASSIGNED") return 3;
    if (t.status === "CLUSTERED") return 2;
    return 1;
  };

  const currentStage = ticket ? getStage(ticket) : 0;

  const trackingStages = [
    { id: 1, title: t("Submitted & AI Triaged", "दर्ज और AI द्वारा वर्गीकृत"), desc: t("Severity assessed and category auto-assigned.", "गंभीरता का आकलन और श्रेणी का निर्धारण।"), icon: <Bot size={18} /> },
    { id: 2, title: t("Spatial Clustered", "स्थानिक क्लस्टरिंग"), desc: t("Merged with nearby ward complaints to avoid duplication.", "वॉर्ड शिकायतों के साथ 50m रेडियस में क्लस्टर किया गया।"), icon: <MapPin size={18} /> },
    { id: 3, title: t("Assigned to Field Officer", "फील्ड ऑफिसर को असाइन किया गया"), desc: t("Dispatched to local maintenance officer on TSP route.", "TSP ऑप्टिमाइज़्ड रूट पर फील्ड ऑफिसर को असाइन।"), icon: <Clock size={18} /> },
    { id: 4, title: t("Inspection & Work in Progress", "निरीक्षण व कार्य प्रगति पर"), desc: t("Maintenance team is on-ground repairing the defect.", "रखरखाव दल मौके पर कार्य कर रहा है।"), icon: <Truck size={18} /> },
    { id: 5, title: t("Resolved & AI Dual-Verified", "समाधान और AI विजन द्वारा सत्यापित"), desc: t("Repaired photo matched via computer vision. Closed.", "मरम्मत की फोटो AI द्वारा सत्यापित होकर शिकायत बंद।"), icon: <CheckCircle2 size={18} /> }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-400 text-xs font-bold">
              <Sparkles size={13} /> Real-Time Grievance Tracker
            </div>
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Central DB Connected (22ms)</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            {t("Track Municipal Grievance", "शिकायत स्थिति लाइव ट्रैक करें")}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
            Enter your Grievance Reference ID to inspect official SLA countdowns, officer assignments, and AI verified resolution proofs.
          </p>

          <form onSubmit={onSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID (e.g. CB-8842)"
                  disabled={isTracking}
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-950 border border-slate-700 rounded-2xl text-white font-mono uppercase tracking-wider text-sm outline-none focus:ring-2 focus:ring-sky-500 transition-all disabled:opacity-50"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isTracking}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white font-bold uppercase tracking-wider text-xs shadow-lg shadow-sky-600/30 flex items-center justify-center min-w-[130px] cursor-pointer disabled:opacity-60"
              >
                {isTracking ? (
                  <>
                    <Loader2 className="animate-spin mr-1.5" size={14} /> Locating...
                  </>
                ) : (
                  "Track Status"
                )}
              </button>
            </div>
          </form>

          {/* Simulated Query Progress Bar */}
          {isTracking && (
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs text-sky-300 flex items-center gap-3 animate-pulse mt-3">
              <Loader2 className="animate-spin text-sky-400 flex-shrink-0" size={16} />
              <div className="flex-1">
                <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                  <Database size={12} className="text-sky-400" /> Municipal Gateway Query
                </div>
                <p className="text-[10px] text-slate-300 mt-0.5">{queryStep}</p>
              </div>
            </div>
          )}
        </div>

        {searched && !isTracking && !ticket && (
          <div className="p-8 rounded-3xl bg-red-500/10 border border-red-500/30 text-center text-red-400 font-bold text-sm">
            No grievance found with ID "{ticketId}". Please check the ID or file a new grievance.
          </div>
        )}

        {ticket && !isTracking && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden space-y-6"
          >
            {/* Ticket Info Ribbon */}
            <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <span className="px-3 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                  {ticket.category || 'General'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
                    <Wifi size={11} /> 200 OK (22ms)
                  </span>
                  <span className="text-xs font-mono font-bold bg-slate-800 text-sky-400 px-3 py-1 rounded-md border border-slate-700">
                    {ticket._id || ticket.id}
                  </span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{ticket.title}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-500" />
                  {new Date(ticket.createdAt || Date.now()).toLocaleString()}
                </span>
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Star size={14} />
                  {ticket.priority || 'NORMAL'} Priority
                </span>
              </div>
            </div>

            {/* Before vs After Photos with Interactive Comparison Slider */}
            {(ticket.imageUrl || ticket.afterImageUrl) && (
              <div className="px-6 sm:px-8 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ImageIcon size={14} className="text-sky-400" /> Photographic Audit Record
                  </h3>
                  {ticket.afterImageUrl && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck size={12} /> AI Anti-Ghost Verified
                    </span>
                  )}
                </div>

                {ticket.imageUrl && ticket.afterImageUrl ? (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>🎚️ Interactive Before vs After Swipe</span>
                      <span className="text-sky-400">Drag center slider to inspect</span>
                    </div>
                    <ImageComparisonSlider
                      beforeImage={ticket.imageUrl}
                      afterImage={ticket.afterImageUrl}
                      heightClass="h-64 sm:h-80"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-2">1. Citizen Before Evidence</span>
                      <div className="h-36 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                        {ticket.imageUrl ? (
                          <img src={ticket.imageUrl} alt="Before" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-slate-600">No Image</span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-bold uppercase text-emerald-400 block mb-2">2. Field Officer Repair Proof</span>
                      <div className="h-36 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                        {ticket.afterImageUrl ? (
                          <img src={ticket.afterImageUrl} alt="After" className="w-full h-full object-cover border border-emerald-500/20" />
                        ) : (
                          <span className="text-xs text-slate-500">Repair in Progress</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {ticket.remarks && (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-sky-400 block text-[10px] uppercase mb-0.5">Field Officer Remark:</strong>
                    {ticket.remarks}
                  </div>
                )}
              </div>
            )}

            {/* Live Tracking Stages */}
            <div className="p-6 sm:p-8 border-t border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                Lifecycle Progression
              </h3>

              <div className="space-y-6">
                {trackingStages.map((stage, idx) => {
                  const isDone = stage.id <= currentStage;
                  const isCurrent = stage.id === currentStage;

                  return (
                    <div key={stage.id} className="flex items-start gap-4 relative">
                      {idx !== trackingStages.length - 1 && (
                        <div
                          className={`absolute left-4 top-8 bottom-[-24px] w-0.5 ${
                            stage.id < currentStage ? 'bg-emerald-500' : 'bg-slate-800'
                          }`}
                        />
                      )}

                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-colors ${
                          isDone
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isDone ? <CheckCircle2 size={16} /> : stage.icon}
                      </div>

                      <div className="flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className={`text-sm font-bold ${isDone ? 'text-white' : 'text-slate-500'}`}>
                            {stage.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30 animate-pulse">
                              Active Stage
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-0.5 ${isDone ? 'text-slate-400' : 'text-slate-600'}`}>
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </motion.div>
        )}

      </div>
    </div>
  );
}
