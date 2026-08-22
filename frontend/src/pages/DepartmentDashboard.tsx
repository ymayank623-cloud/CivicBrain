import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { 
  Building2, Users, AlertOctagon, Activity, LogOut, Search, ShieldAlert, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function DepartmentDashboard() {
  const navigate = useNavigate();
  
  // Real-time WebSocket Sync
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('ticket_escalated', (data) => {
      console.log('Real-time escalation alert received:', data);
      // In a real app, we would refetch or update state here.
      // E.g., alert(`RED ALERT: Ticket ${data.ticketId} just breached SLA!`);
    });
    return () => { socket.disconnect(); };
  }, []);
  
  // Tickets State
  const [tickets, setTickets] = useState<any[]>([]);

  // Dynamic Metrics
  const metrics = {
    deptName: "Civic Utilities Board",
    activeTickets: tickets.length,
    pendingAssignment: tickets.filter(t => !t.assignedTo).length,
    slaMet: "100%", // Mock
    escalated: 0 // Mock
  };

  // Real-time SLA Timers
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Load mock complaints from localStorage for the offline demo flow
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    
    // Map them to the format DepartmentDashboard expects
    const mappedTickets = demoComplaints.map((c: any) => ({
      id: c._id,
      title: c.title,
      location: c.location ? `Lat: ${c.location[0].toFixed(3)}, Lng: ${c.location[1].toFixed(3)}` : "Unknown Area",
      category: c.category,
      slaHours: c.category === "Open Manhole" ? 4 : c.category === "Water Leak" ? 12 : 24,
      createdAt: new Date(c.createdAt).getTime(),
      status: c.status || "OPEN",
      assignedTo: c.status === "ASSIGNED" || c.status === "IN_PROGRESS" ? "Er. Ramesh (Field Officer)" : null
    }));
    
    setTickets(mappedTickets);
  }, []);

  const handleAssignOfficer = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'ASSIGNED', assignedTo: "Er. Ramesh (Field Officer)" } : t));
    alert("Officer Auto-Assigned based on Nearest Location (Mock)");
  };

  const getSLAStatus = (ticket: any) => {
    const totalSlaMs = ticket.slaHours * 60 * 60 * 1000;
    const elapsedMs = now - ticket.createdAt;
    const remainingMs = totalSlaMs - elapsedMs;
    const elapsedPercentage = (elapsedMs / totalSlaMs) * 100;
    
    // Format remaining time (Live Countdown)
    const isBreached = remainingMs < 0;
    const absRemaining = Math.abs(remainingMs);
    const hours = Math.floor(absRemaining / (1000 * 60 * 60));
    const mins = Math.floor((absRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((absRemaining % (1000 * 60)) / 1000);
    const countdown = `${isBreached ? '-' : ''}${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    let alertLevel = "ON TRACK";
    let color = "green";
    
    if (elapsedPercentage >= 100) {
      alertLevel = "LEVEL-UP: AUTO-ESCALATED TO COMMISSIONER";
      color = "red";
    } else if (elapsedPercentage >= 75) {
      alertLevel = "WARNING: LEVEL-UP IMMINENT";
      color = "orange";
    }

    return { elapsedPercentage, countdown, alertLevel, color, isBreached };
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans pb-12 selection:bg-[#E05344] selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Elegant Header */}
      <nav className="bg-[#111827] text-white sticky top-0 z-50 shadow-sm py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Building2 className="text-white" size={20} />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight">CivicBrain</span>
              <span className="text-[#E05344] font-bold text-xs uppercase tracking-[0.2em] ml-3 hidden sm:block border-l border-white/20 pl-3">
                Department Portal
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <span className="text-sm font-medium text-gray-400 hidden sm:block">Welcome, Chief Engineer</span>
              <button onClick={handleLogout} className="text-gray-400 hover:text-[#E05344] transition-colors flex items-center">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-[#111827] tracking-tight">{metrics.deptName}</h1>
          <p className="text-gray-500 mt-2">Department Overview & SLA Compliance Dashboard</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 mb-2 flex items-center"><Activity size={18} className="mr-2"/> Active Tickets</div>
            <div className="font-serif text-5xl font-bold text-[#111827]">{metrics.activeTickets}</div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 mb-2 flex items-center"><Users size={18} className="mr-2"/> Pending Assignment</div>
            <div className="font-serif text-5xl font-bold text-[#111827]">{metrics.pendingAssignment}</div>
          </div>
          <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col justify-between">
            <div className="text-gray-500 mb-2 flex items-center"><CheckCircle2 size={18} className="mr-2"/> SLA Met Rate</div>
            <div className="font-serif text-5xl font-bold text-green-600">{metrics.slaMet}</div>
          </div>
          <div className="bg-[#111827] rounded-[2rem] p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-6 -mr-6 text-white/5 transform rotate-12"><ShieldAlert size={150} /></div>
            <div className="text-gray-300 mb-2 flex items-center relative z-10"><AlertOctagon size={18} className="mr-2 text-[#E05344]"/> Breached SLA</div>
            <div className="font-serif text-5xl font-bold text-[#E05344] relative z-10">{metrics.escalated}</div>
          </div>
        </div>

        {/* Manual / Auto Officer Assignment Table */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/40 border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-[#FBFBFB]">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#111827]">SLA Escalation Engine & Assignments</h2>
              <p className="text-gray-500 text-sm mt-1">Live tracking of ticket SLA progression and auto-escalations.</p>
            </div>
            <div className="hidden md:flex bg-white px-4 py-2 border border-gray-200 rounded-full items-center shadow-sm">
              <Search size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Search Ticket ID..." className="outline-none text-sm text-[#111827]" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F8F9FA] text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <th className="py-4 px-8 font-bold">Ticket Details</th>
                  <th className="py-4 px-8 font-bold">Officer Assignment</th>
                  <th className="py-4 px-8 font-bold">SLA Health (Escalation)</th>
                  <th className="py-4 px-8 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-500 font-medium">
                      No active tickets matching this criteria. Everything is clean! ðŸƒ
                    </td>
                  </tr>
                ) : (
                  tickets.map(ticket => {
                    const sla = getSLAStatus(ticket);
                    return (
                    <tr key={ticket.id} className="hover:bg-[#FBFBFB] transition-colors">
                      <td className="py-6 px-8">
                        <div className="font-bold text-[#111827] text-lg mb-1">{ticket.title}</div>
                        <div className="text-xs text-gray-500 uppercase tracking-widest flex items-center">
                          <span className="text-[#E05344] font-bold mr-2">{ticket.id}</span> | <span className="ml-2">{ticket.location}</span>
                        </div>
                      </td>
                      
                      <td className="py-6 px-8">
                        {ticket.assignedTo ? (
                          <div className="inline-flex items-center px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-sm font-bold text-gray-700">
                            {ticket.assignedTo}
                          </div>
                        ) : (
                          <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-50 border border-yellow-200 text-sm font-bold text-yellow-700">
                            Pending Assignment
                          </div>
                        )}
                      </td>

                      <td className="py-6 px-8">
                        <div className="flex justify-between text-xs mb-1 font-bold">
                          <span className={sla.color === 'red' ? 'text-red-600' : sla.color === 'orange' ? 'text-orange-600' : 'text-green-600'}>{sla.alertLevel}</span>
                          <span className={`font-mono ${sla.color === 'red' ? 'text-red-600' : sla.color === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>{sla.countdown}</span>
                        </div>
                        <div className="mb-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${sla.color === 'red' ? 'bg-red-500' : sla.color === 'orange' ? 'bg-orange-500' : 'bg-green-500'}`} 
                            style={{ width: `${Math.min(sla.elapsedPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </td>

                      <td className="py-6 px-8 text-right">
                        {!ticket.assignedTo ? (
                          <button 
                            onClick={() => handleAssignOfficer(ticket.id)}
                            className="bg-[#111827] hover:bg-gray-800 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-transform hover:-translate-y-0.5 inline-flex items-center"
                          >
                            Auto-Assign <ChevronRight size={14} className="ml-1" />
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Monitoring
                          </span>
                        )}
                      </td>
                    </tr>
                  )})
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}




