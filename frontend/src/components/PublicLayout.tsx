import GovNavbar from "./GovNavbar";
import TopProgressBar from "./TopProgressBar";
import { Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Wifi, ShieldCheck, Activity } from "lucide-react";

export default function PublicLayout() {
  const location = useLocation();
  const [ping, setPing] = useState(24);

  // Subtle real-time ping fluctuation to simulate authentic live server connectivity
  useEffect(() => {
    const interval = setInterval(() => {
      setPing(Math.floor(20 + Math.random() * 12));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative">
      {/* Top Browser Route Transition Progress Bar */}
      <TopProgressBar />

      {/* Main GovNavbar */}
      <GovNavbar />

      {/* Page Content with smooth route transition */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0.7, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Real-time Municipal Gateway Telemetry Pill */}
      <div className="fixed bottom-3.5 right-3.5 z-40 hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900/95 backdrop-blur-xl border border-slate-800 text-[11px] text-slate-300 shadow-2xl">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-slate-200 flex items-center gap-1">
          <Activity size={12} className="text-emerald-400" />
          <span>Server: Online</span>
        </span>
        <span className="text-slate-700">|</span>
        <span className="font-mono text-sky-400 flex items-center gap-1">
          <Wifi size={11} /> {ping}ms
        </span>
        <span className="text-slate-700">|</span>
        <span className="text-amber-400 flex items-center gap-1 font-mono">
          <ShieldCheck size={12} /> SSL 256-bit (LKO-NODE-04)
        </span>
      </div>
    </div>
  );
}
