import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, X, Phone, MapPin, 
  CheckCircle2, Search, Camera, Cpu
} from 'lucide-react';
import AIChatBot from '../components/AIChatBot';
import { useLang } from '../context/LangContext';

export default function Home() {
  const navigate = useNavigate();
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [user, setUser] = useState<any>(null);
  const { t } = useLang();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {}
    }
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) navigate(`/track?id=${ticketId.trim()}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-slate-950 text-white min-h-screen selection:bg-sky-500 selection:text-white">
      {/* 1. HERO SECTION (High-Tech Municipal Command Center Style) */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 border-b border-slate-800">
        {/* Ambient Gradient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[400px] h-[300px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div 
            initial="hidden" animate="visible" variants={staggerContainer}
            className="flex flex-col items-center space-y-6"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-bold text-sky-400">
              <span className="flex h-2 w-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span>{t("Smart City Mission 2.0 • AI Civic Platform", "स्मार्ट सिटी मिशन 2.0 • AI नागरिक मंच")}</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]">
              {t("Next-Gen", "अग्रणी")}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-400">
                {t("Urban Intelligence", "शहरी बुद्धिमत्ता")}
              </span><br />
              {t("& Swift Redressal.", "और त्वरित समाधान।")}
            </motion.h1>

            <motion.p variants={fadeUp} className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              {t(
                "Empowering citizens and municipal field teams with real-time AI computer vision, spatial clustering, and automated GPS-locked verification. Eliminating red-tape from root to resolution.",
                "नागरिकों और नगर निगम फील्ड टीमों को रीयल-टाइम AI कंप्यूटर विजन, स्पैटियल क्लस्टरिंग और ऑटोमेटेड GPS वेरिफिकेशन के साथ सशक्त बनाना।"
              )}
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-2">
              {!user ? (
                <>
                  <Link 
                    to="/login"
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Camera size={18} /> {t("File a Grievance", "शिकायत दर्ज करें")}
                  </Link>
                  <button 
                    onClick={() => setTrackingModalOpen(true)}
                    className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm tracking-wide flex items-center gap-2 transition-all cursor-pointer active:scale-95"
                  >
                    <Search size={18} className="text-amber-400" /> {t("Track Ticket", "शिकायत ट्रैक करें")}
                  </button>
                  <Link 
                    to="/login"
                    className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider pl-2 transition-colors"
                  >
                    {t("Officer Portal →", "अधिकारी पोर्टल →")}
                  </Link>
                </>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {user.role === 'CITIZEN' ? (
                    <>
                      <Link 
                        to="/citizen/dashboard"
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-bold text-sm tracking-wide shadow-lg flex items-center gap-2"
                      >
                        {t("Citizen Dashboard", "नागरिक डैशबोर्ड")} <ArrowRight size={16} />
                      </Link>
                      <Link 
                        to="/citizen/new-complaint"
                        className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm tracking-wide shadow-lg flex items-center gap-2"
                      >
                        ➕ {t("File New Ticket", "नई शिकायत")}
                      </Link>
                    </>
                  ) : (
                    <Link 
                      to="/officer/dashboard"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-sm tracking-wide shadow-lg flex items-center gap-2"
                    >
                      {t("Officer Field Command", "फील्ड कमांड डैशबोर्ड")} <ArrowRight size={16} />
                    </Link>
                  )}
                  <span className="text-xs text-slate-400 pl-2">
                    {t("Welcome", "स्वागत है")}, <strong className="text-white">{user.name}</strong>
                  </span>
                </div>
              )}
            </motion.div>

            {/* Direct Quick Track Form */}
            <motion.div variants={fadeUp} className="pt-4 w-full max-w-lg mx-auto">
              <form onSubmit={handleTrackSubmit} className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
                <div className="flex items-center gap-2 pl-3 flex-1">
                  <Search size={16} className="text-slate-400" />
                  <input
                    type="text"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder={t("Enter Ticket ID (e.g. CB-8842)", "टिकट आईडी दर्ज करें (e.g. CB-8842)")}
                    className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full uppercase"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {t("Track", "ट्रैक")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 2. CORE SYSTEM ARCHITECTURE: 4-STEP LIFECYCLE */}
      <section className="py-20 bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-amber-400 font-bold uppercase tracking-widest text-xs">
              {t("Transparent Workflow", "पारदर्शी कार्यप्रणाली")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              {t("From Citizen Snap to Ground Resolution", "नागरिक रिपोर्ट से जमीनी समाधान तक")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                icon: Camera,
                title: t("Photo & GPS Lockdown", "फोटो और GPS लॉकडाउन"),
                desc: t("Citizen uploads live photo up to 10MB. Exact EXIF coordinates ensure accurate pin on municipal GIS.", "नागरिक 10MB तक की लाइव फोटो अपलोड करता है। EXIF जीपीएस सटीक स्थान लॉक करता है।")
              },
              {
                step: "02",
                icon: Cpu,
                title: t("AI Triaging & Clustering", "AI वर्गीकरण व क्लस्टरिंग"),
                desc: t("AI auto-classifies issue severity and merges duplicate reports within 50 meters into one Master Ticket.", "AI समस्या की गंभीरता को पहचानता है और 50 मीटर के दायरे में डुप्लिकेट शिकायतों को जोड़ता है।")
              },
              {
                step: "03",
                icon: MapPin,
                title: t("Field Officer TSP Routing", "फील्ड ऑफिसर TSP रूटिंग"),
                desc: t("Assigned field officer receives optimized shortest route across Lucknow/Delhi wards on live maps.", "अधिकारी को लाइव मैप्स पर सभी कार्यों के लिए सबसे छोटा और कुशल रूट मिलता है।")
              },
              {
                step: "04",
                icon: CheckCircle2,
                title: t("Dual Vision Verification", "दोहरा विजन सत्यापन"),
                desc: t("Officer takes 'After Repair' photo. Computer vision checks background similarity before marking resolved.", "मरम्मत के बाद की फोटो को AI बैकग्राउंड से मैच करता है, जिससे फर्जी काम असंभव हो जाता है।")
              }
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 relative group hover:border-slate-700 transition-all">
                  <div className="text-4xl font-black text-slate-800 group-hover:text-amber-500/20 transition-colors mb-4">
                    {item.step}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center mb-4">
                    <IconComp size={20} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. SIX PILLARS OF CIVICBRAIN */}
      <section className="py-20 bg-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-sky-400 font-bold uppercase tracking-widest text-xs">
              {t("Architectural Innovations", "तकनीकी नवाचार")}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-2">
              {t("Engineered for Zero Corruption", "भ्रष्टाचार-मुक्त प्रशासन के लिए निर्मित")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                t: "1. Anti-Ghost AI Vision Verification",
                d: "Compares before and after repair images with visual color histograms and dHash edge matrices to stop fake closures.",
                badge: "Computer Vision"
              },
              {
                t: "2. 50-Meter Spatial Clustering",
                d: "Consolidates dozens of resident calls for the same pothole or broken streetlight into a single actionable ticket.",
                badge: "GIS & GeoJSON"
              },
              {
                t: "3. Auto SLA Escalation Countdown",
                d: "Guaranteed 4-hour SLA timers. Automatically flags overdue complaints and escalates priority to supervisors.",
                badge: "Automated Rules"
              },
              {
                t: "4. Traveling Salesperson (TSP) Routing",
                d: "Calculates the mathematical shortest route for municipal repair trucks, reducing fuel costs and response times.",
                badge: "Algorithms"
              },
              {
                t: "5. Citizen Karma Rewards",
                d: "Citizens earn points for genuine reporting and verifying neighbors' repairs, redeemable for municipal utility rebates.",
                badge: "Incentive Layer"
              },
              {
                t: "6. Predictive Monsoon Heatmaps",
                d: "Analyzes seasonal drainage complaints to pre-deploy suction pumps in high-risk waterlogging zones before rains start.",
                badge: "Predictive Analytics"
              }
            ].map((usp, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 inline-block mb-3">
                    {usp.badge}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">{usp.t}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{usp.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EMERGENCY HELPLINE & FOOTER */}
      <footer className="py-16 bg-slate-950 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pb-12 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white font-black text-sm">
                CB
              </div>
              <div>
                <p className="text-white font-bold text-sm">CivicBrain Nagar Nigam Portal</p>
                <p className="text-slate-400 text-[11px]">Digital India Initiative • Smart City Governance</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <a 
                href="tel:180024842" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:bg-amber-400 transition-colors"
              >
                <Phone size={14} /> 24x7 Helpline: 1800-CIVIC
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-wrap justify-between items-center gap-4 text-[11px]">
            <p>© 2026 CivicBrain. All rights reserved. Government of India.</p>
            <div className="flex items-center gap-4">
              <Link to="/help-faq" className="hover:text-white transition-colors">Help & FAQ</Link>
              <Link to="/track" className="hover:text-white transition-colors">Track Grievance</Link>
              <Link to="/login" className="hover:text-white transition-colors">Portal Login</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating AI ChatBot */}
      <AIChatBot />

      {/* Track Ticket Modal */}
      <AnimatePresence>
        {trackingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">{t("Track Grievance Status", "शिकायत स्थिति ट्रैक करें")}</h3>
                <button onClick={() => setTrackingModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={20} /></button>
              </div>
              <form onSubmit={handleTrackSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    {t("Enter Grievance Reference ID", "टिकट आईडी दर्ज करें")}
                  </label>
                  <input 
                    type="text" 
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    placeholder="e.g. CB-8842"
                    className="w-full text-base px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white outline-none focus:ring-2 focus:ring-sky-500 uppercase font-mono tracking-wider"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all uppercase tracking-wider text-xs cursor-pointer shadow-lg shadow-sky-600/30"
                >
                  {t("View Live Status Timeline", "लाइव टाइमलाइन देखें")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
