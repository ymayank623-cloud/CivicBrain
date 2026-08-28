import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, X, Phone, Sparkles } from 'lucide-react';
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
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketId.trim()) navigate(`/track?id=${ticketId}`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } }
  };
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* 1. HERO SECTION (Editorial/Magazine Layout) */}
      <section className="relative w-full max-w-7xl mx-auto px-6 md:px-12 pt-12 pb-24 flex flex-col lg:flex-row gap-16 items-center">
        {/* Left: Huge Editorial Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}
          className="w-full lg:w-1/2 relative h-[500px] lg:h-[650px] rounded-[32px] overflow-hidden shadow-2xl"
        >
          <img 
            src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?q=80&w=2070&auto=format&fit=crop" 
            alt="Smart City Infrastructure" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-8 left-8 text-white">
            <p className="text-xs font-bold tracking-widest uppercase mb-2 text-orange-400">
              {t("Smart City Initiative", "स्मार्ट सिटी पहल")}
            </p>
            <h3 className="font-serif text-2xl font-bold max-w-xs leading-snug">
              {t("Building the infrastructure of tomorrow, today.", "आज, कल के बुनियादी ढांचे का निर्माण।")}
            </h3>
          </div>
        </motion.div>

        {/* Right: Editorial Typography */}
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="w-full lg:w-1/2 flex flex-col justify-center"
        >
          <motion.h4 variants={fadeUp} className="text-orange-600 font-bold uppercase tracking-[0.2em] text-xs mb-6">
            {t("Municipal Welfare Authority", "नगर कल्याण प्राधिकरण")}
          </motion.h4>
          <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-[68px] font-bold text-blue-900 leading-[1.05] tracking-tight mb-8">
            {t("Pioneering", "अग्रणी")}<br />{t("Data-Driven", "डेटा-संचालित")}<br />{t("Urban Intelligence.", "शहरी बुद्धिमत्ता।")}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-600 text-lg leading-relaxed mb-10 max-w-lg font-medium">
            {t(
              "We merge classical civic responsibility with cutting-edge artificial intelligence to deliver transparent, accountable, and hyper-efficient municipal governance for every citizen.",
              "हम प्रत्येक नागरिक के लिए पारदर्शी, जवाबदेह और अत्यंत कुशल नगर निगम प्रशासन प्रदान करने के लिए अत्याधुनिक कृत्रिम बुद्धिमत्ता (AI) के साथ पारंपरिक नागरिक जिम्मेदारी का विलय करते हैं।"
            )}
          </motion.p>
          
          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 mb-12">
            {!user ? (
              <>
                <Link to="/login" className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-all shadow flex items-center gap-2 uppercase tracking-wide text-sm">
                  {t("Log in to Portal", "पोर्टल में लॉग इन करें")} <ArrowRight size={18} />
                </Link>
                <a href="#services" className="text-blue-900 font-bold uppercase tracking-wider text-sm hover:text-orange-600 transition-colors border-b-2 border-transparent hover:border-orange-600 pb-1">
                  {t("Explore Services", "सेवाएं खोजें")}
                </a>
              </>
            ) : (
              <>
                {user.role === 'CITIZEN' && (
                  <Link to="/citizen/dashboard" className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-all shadow flex items-center gap-2 uppercase tracking-wide text-sm">
                    {t("Go to Dashboard", "डैशबोर्ड पर जाएं")} <ArrowRight size={18} />
                  </Link>
                )}
                {user.role === 'FIELD_OFFICER' && (
                  <Link to="/officer/dashboard" className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-all shadow flex items-center gap-2 uppercase tracking-wide text-sm">
                    {t("View Assignments", "कार्य देखें")} <ArrowRight size={18} />
                  </Link>
                )}
                {user.role === 'DEPT_HEAD' && (
                  <Link to="/department/dashboard" className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-all shadow flex items-center gap-2 uppercase tracking-wide text-sm">
                    {t("View SLA Board", "SLA बोर्ड देखें")} <ArrowRight size={18} />
                  </Link>
                )}
                {user.role === 'COMMISSIONER' && (
                  <Link to="/admin/dashboard" className="bg-orange-600 text-white px-8 py-3 rounded font-bold hover:bg-orange-700 transition-all shadow flex items-center gap-2 uppercase tracking-wide text-sm">
                    {t("Open War Room", "वॉर रूम खोलें")} <ArrowRight size={18} />
                  </Link>
                )}
                <span className="text-blue-900 font-bold tracking-wider text-sm mt-2 sm:mt-0">
                  {t("Welcome", "स्वागत है")}, {user.name.split(' ')[0]} 👋
                </span>
              </>
            )}
          </motion.div>

          
        </motion.div>
      </section>

      {/* 3. OUR ESSENTIAL SERVICES (Numbered Editorial List) */}
      <section id="services" className="py-24 bg-white border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-[#111827] tracking-tight">{t("Our Essential Services", "हमारी आवश्यक सेवाएं")}</h2>
            <div className="w-24 h-1 bg-[#E05344] mx-auto mt-6"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                num: "01",
                title: t("Lodge Grievance", "शिकायत दर्ज करें"),
                desc: t("Report municipal issues instantly. From road damage to sanitation, our AI-powered routing ensures your ticket reaches the right official in seconds.", "नगर निगम की समस्याओं की तुरंत रिपोर्ट करें। हमारी AI-संचालित प्रणाली सुनिश्चित करती है कि आपका टिकट सेकंडों में सही अधिकारी तक पहुंचे।"),
                link: "/citizen/new-complaint"
              },
              {
                num: "02",
                title: t("Track Status", "स्थिति ट्रैक करें"),
                desc: t("Complete transparency. View real-time updates, field officer location, and before/after photos of your resolved complaint.", "पूर्ण पारदर्शिता। अपनी हल की गई शिकायत के रीयल-टाइम अपडेट और अधिकारी की जानकारी देखें।"),
                action: () => setTrackingModalOpen(true)
              },
              {
                num: "03",
                title: t("Civic Karma", "नागरिक कर्मा"),
                desc: t("Earn points for being an active citizen. Responsible reporting increases your trust score and prioritizes your future tickets.", "सक्रिय नागरिक होने के लिए अंक अर्जित करें। जिम्मेदार रिपोर्टिंग से आपका ट्रस्ट स्कोर बढ़ता है।"),
                link: "/help-faq"
              }
            ].map((srv, idx) => (
              <div key={idx} className="group relative">
                <div className="text-[120px] font-black text-gray-50 leading-none absolute -top-16 -left-6 -z-10 select-none transition-transform group-hover:-translate-y-2">
                  {srv.num}
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#111827] mb-4">{srv.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{srv.desc}</p>
                {srv.link ? (
                  <Link to={srv.link} className="inline-flex items-center text-[#E05344] font-bold uppercase tracking-wider text-xs hover:text-[#111827] transition-colors">
                    {t("Explore", "और जानें")} <ArrowRight size={14} className="ml-1" />
                  </Link>
                ) : (
                  <button onClick={srv.action} className="inline-flex items-center text-[#E05344] font-bold uppercase tracking-wider text-xs hover:text-[#111827] transition-colors">
                    {t("Explore", "और जानें")} <ArrowRight size={14} className="ml-1" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* 4. GROUNDBREAKING INNOVATIONS (The 6 USPs) */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h4 className="text-orange-600 font-bold uppercase tracking-[0.2em] text-xs mb-4">
              {t("Why CivicBrain?", "CivicBrain क्यों?")}
            </h4>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-[#111827] tracking-tight">
              {t("Solving Real-World Red Tape with AI", "AI के साथ असली प्रशासनिक समस्याओं का समाधान")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* USP 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="text-blue-600" />
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("1. AI Vision Verification", "1. AI विजन सत्यापन")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Eliminates 'Ghost Resolutions'. Our AI compares before/after photos using background matching and EXIF GPS lockdown (20m radius) to ensure actual work is done.", "फर्जी समाधान को रोकता है। हमारा AI बैकग्राउंड मैचिंग और 20m GPS लॉकडाउन के जरिए सुनिश्चित करता है कि असल में काम हुआ है।")}
              </p>
            </div>

            {/* USP 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("2. Spatial Clustering", "2. स्पैटियल क्लस्टरिंग")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Prevents 100 duplicate tickets for the same issue. AI uses a 50m semantic geo-radius to auto-merge duplicates into a single 'Master Ticket'.", "एक ही समस्या के 100 टिकट बनने से रोकता है। हमारा AI 50m रेडियस में सभी शिकायतों को एक 'मास्टर टिकट' में बदल देता है।")}
              </p>
            </div>

            {/* USP 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("3. Auto SLA Escalation", "3. ऑटो SLA एस्केलेशन")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Breaks red-tape. If a Junior Engineer misses the 4-hour SLA, the ticket automatically flashes as a RED ALERT on the Commissioner's dashboard.", "लालफीताशाही खत्म करता है। यदि 4 घंटे में एक्शन नहीं लिया गया, तो शिकायत सीधे कमिश्नर के डैशबोर्ड पर RED ALERT बन जाती है।")}
              </p>
            </div>

            {/* USP 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("4. TSP Route Optimizer", "4. TSP रूट ऑप्टिमाइज़र")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Acts as a fleet management tool. Generates the shortest, most optimized route for maintenance trucks using TSP algorithms on live maps.", "फील्ड ऑफिसर्स के लिए फ्लीट मैनेजमेंट टूल। लाइव मैप्स पर सबसे छोटे और ऑप्टिमाइज़्ड रूट बनाता है।")}
              </p>
            </div>

            {/* USP 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("5. Decentralized Auditing", "5. विकेंद्रीकृत ऑडिटिंग")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("When an officer closes a ticket, 5 nearby citizens get a ping to verify it. Genuine reporters earn 'Civic Karma' for tax rebates.", "शिकायत बंद होने पर 5 पड़ोसी नागरिकों से वेरिफिकेशन लिया जाता है। सही रिपोर्टिंग के लिए 'नागरिक कर्मा' पॉइंट्स मिलते हैं।")}
              </p>
            </div>

            {/* USP 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-50 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
              </div>
              <h3 className="font-bold text-lg text-[#111827] mb-3">
                {t("6. Predictive Heatmap", "6. पूर्वानुमानित हीटमैप")}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {t("Transforms from a reactive portal to preventive governance. Forecasts issues like 85% waterlogging risk before the monsoon hits.", "समस्या होने से पहले ही उसकी भविष्यवाणी। जैसे मानसून से पहले किस वॉर्ड में 85% जलभराव का खतरा है।")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "STAY CONNECTED" Footer Section */}
      <footer className="relative bg-[#111827] pt-24 pb-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <img src="https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=2070&auto=format&fit=crop" alt="City Aerial" className="w-full h-full object-cover" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl font-bold text-white tracking-wide mb-6">{t("Stay Connected", "जुड़े रहें")}</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto">{t("Subscribe to municipal updates or reach out directly to the emergency citizen helpdesk for urgent assistance.", "नगर निगम के अपडेट प्राप्त करें या तत्काल सहायता के लिए सीधे नागरिक हेल्पडेस्क से संपर्क करें।")}</p>
            <button className="bg-[#E05344] hover:bg-[#DC2626] text-white px-8 py-3.5 rounded-full font-bold uppercase tracking-wider text-sm transition-colors flex items-center gap-2 mx-auto">
              <Phone size={18} /> {t("Citizen Helpdesk: 1800-CIVIC", "नागरिक हेल्पडेस्क: 1800-CIVIC")}
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-600 pt-8 border-t border-gray-800">
            © 2026 CivicBrain Municipal Corporation. {t("A flagship initiative under Digital India. All rights reserved.", "डिजिटल इंडिया के तहत एक प्रमुख पहल। सर्वाधिकार सुरक्षित।")}
          </div>
        </div>
      </footer>

      {/* Floating AI ChatBot */}
      <AIChatBot />

      {/* Track Ticket Modal (Interactive) */}
      <AnimatePresence>
        {trackingModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#111827]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-6 bg-[#FBFBFB] border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-serif text-2xl font-bold text-[#111827]">{t("Track Complaint", "शिकायत ट्रैक करें")}</h3>
                <button onClick={() => setTrackingModalOpen(false)} className="text-gray-400 hover:text-gray-800"><X size={24} /></button>
              </div>
              <form onSubmit={handleTrackSubmit} className="p-8">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{t("Ticket ID", "टिकट आईडी")}</label>
                <input 
                  type="text" 
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="e.g. CB-8842"
                  className="w-full text-lg px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#E05344] focus:ring-0 outline-none mb-6 transition-colors uppercase"
                />
                <button type="submit" className="w-full bg-[#111827] text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors uppercase tracking-widest text-sm">
                  {t("View Live Status", "लाइव स्थिति देखें")}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




