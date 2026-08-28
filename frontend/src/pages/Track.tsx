import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Truck, CheckCircle2, Star, Image as ImageIcon, Bot } from 'lucide-react';


export default function Track() {
  const [ticketId, setTicketId] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const [ticket, setTicket] = useState<any>(null);
  const [searched, setSearched] = useState(false);

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
    setTimeout(() => {
      const all = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
      const found = all.find((t:any) => t._id === idToSearch || t._id === `CB-${idToSearch}`);
      setTicket(found || null);
      setIsTracking(false);
    }, 800);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(ticketId) handleTrack(ticketId);
  };

  const getStage = (t:any) => {
    if (t.status === "RESOLVED" || t.status === "ARCHIVED") return 5;
    if (t.status === "IN_PROGRESS") return 4;
    if (t.status === "ASSIGNED") return 3;
    if (t.status === "CLUSTERED") return 2;
    return 1; // OPEN
  };

  const currentStage = ticket ? getStage(ticket) : 0;

  const trackingStages = [
    { id: 1, title: "Submitted & AI Triaged", desc: "Category logged and severity assessed.", icon: <Bot size={20} /> },
    { id: 2, title: "Clustered / Assigned", desc: "Merged with local neighbors or assigned directly.", icon: <MapPin size={20} /> },
    { id: 3, title: "Assigned to Field Officer", desc: "Officer deployed to location.", icon: <Clock size={20} /> },
    { id: 4, title: "Work in Progress", desc: "Maintenance crew is on site.", icon: <Truck size={20} /> },
    { id: 5, title: "Resolved & Verified", desc: "Issue fixed. AI verified.", icon: <CheckCircle2 size={20} /> }
  ];

  return (
    <div className="bg-white min-h-screen pt-8 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-6">
        
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight mb-3">Track Your Grievance</h1>
          <p className="text-gray-500 font-medium text-sm">Enter your 6-digit Ticket ID (e.g. CB-1234) to track real-time AI and Field Officer updates.</p>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 mb-10 relative overflow-hidden">
          <form onSubmit={onSubmit} className="relative z-10">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="Enter Ticket ID..." 
                  className="w-full bg-gray-50 text-gray-900 border border-gray-200 pl-12 pr-4 py-4 rounded-xl font-bold uppercase tracking-wider focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={isTracking}
                className="bg-[#111827] text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-gray-800 transition-all shadow-lg flex items-center justify-center min-w-[140px]"
              >
                {isTracking ? "Locating..." : "Track"}
              </button>
            </div>
          </form>
        </div>

        {searched && !isTracking && !ticket && (
          <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100 text-red-600 font-bold uppercase tracking-widest">
            Ticket Not Found
          </div>
        )}

        {ticket && !isTracking && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            
            <div className="bg-[#111827] p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {ticket.category}
                  </span>
                  <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {ticket._id}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold mt-3">{ticket.title}</h2>
                <div className="flex items-center mt-4 text-blue-100 text-sm font-medium">
                  <span className="flex items-center mr-6"><Clock size={16} className="mr-1.5" /> {new Date(ticket.createdAt).toLocaleString()}</span>
                  <span className="flex items-center"><Star size={16} className="mr-1.5 text-yellow-400" /> {ticket.priority} Priority</span>
                </div>
              </div>
            </div>

            {ticket.imageUrl && (
              <div className="bg-gray-50 p-6 border-b border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                  <ImageIcon size={14} className="mr-2" /> Uploaded Evidence
                </h3>
                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video bg-gray-200">
                  <img src={ticket.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            <div className="p-8 md:p-10">
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest mb-8 border-b pb-4">Live Tracking</h3>
              <div className="relative">
                {trackingStages.map((stage, index) => {
                  const isCompleted = stage.id <= currentStage;
                  

                  return (
                    <div key={stage.id} className="flex mb-8 relative last:mb-0">
                      {index !== trackingStages.length - 1 && (
                        <div className={`absolute left-5 top-10 bottom-[-32px] w-0.5 ${stage.id < currentStage ? 'bg-green-500' : 'bg-gray-200 border-dashed border-l-2 border-gray-200 bg-transparent'}`}></div>
                      )}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-sm ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-300'}`}>
                        {isCompleted ? <CheckCircle2 size={20} /> : stage.icon}
                      </div>
                      <div className="ml-6 pt-1">
                        <h4 className={`font-bold text-sm uppercase tracking-wider mb-1 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{stage.title}</h4>
                        <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>{stage.desc}</p>
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

