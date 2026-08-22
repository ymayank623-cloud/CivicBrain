import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, CheckCircle2, Clock, Truck, Bot, ShieldCheck, Star, Landmark, ChevronRight, Image as ImageIcon } from "lucide-react";

export default function Track() {
  const [searchId, setSearchId] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  // Mock Ticket Data for Presentation
  const mockTicket = {
    id: "CB-8842",
    category: "Streetlight",
    location: "Sector 14, Main Road",
    priority: "HIGH",
    impactedCount: 24,
    slaLeft: "2 Hours 15 Mins",
    officer: "Er. Ramesh Kumar (JE)",
    currentStage: 4,
    beforeImage: "https://images.unsplash.com/photo-1517722014278-c256a91a6fba?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80",
    afterImage: "https://images.unsplash.com/photo-1621600411688-4be93cd68504?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" // Example resolved image
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      setIsTracking(true);
    }
  };

  const trackingStages = [
    {
      id: 1,
      title: "Submitted & AI Triaged",
      desc: `Category: ${mockTicket.category} | Severity Tagged`,
      icon: <Bot size={20} />,
    },
    {
      id: 2,
      title: "Merged into Master Ticket",
      desc: `Grouped with ${mockTicket.impactedCount} local neighbors to prioritize.`,
      icon: <MapPin size={20} />,
    },
    {
      id: 3,
      title: "Assigned to Junior Engineer",
      desc: `Assigned to ${mockTicket.officer}. SLA: ${mockTicket.slaLeft} remaining.`,
      icon: <Clock size={20} />,
    },
    {
      id: 4,
      title: "Work in Progress",
      desc: "Maintenance crew is on site.",
      icon: <Truck size={20} />,
    },
    {
      id: 5,
      title: "AI Resolution Verified",
      desc: "Before vs After vision match completed.",
      icon: <ShieldCheck size={20} />,
    },
    {
      id: 6,
      title: "Final Closure",
      desc: "Ticket closed & Civic Karma awarded to reporters.",
      icon: <Star size={20} />,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Govt Color Band */}
      <div className="w-full h-2 flex fixed top-0 z-50">
        <div className="h-full bg-orange-500 w-1/3"></div>
        <div className="h-full bg-white w-1/3"></div>
        <div className="h-full bg-green-600 w-1/3"></div>
      </div>

      <nav className="bg-blue-900 text-white shadow-md pt-2">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link to="/" className="flex items-center">
              <Landmark className="h-6 w-6 text-white mr-3" />
              <span className="font-extrabold text-lg tracking-wide uppercase">Nagar Nigam Track</span>
            </Link>
            <Link to="/login" className="text-sm font-bold text-orange-400 hover:text-orange-300 transition-colors uppercase tracking-widest">
              Login
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {!isTracking ? (
          <div className="bg-white rounded-xl shadow-2xl border-t-4 border-orange-500 p-8 text-center mt-12">
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-900 rounded-full flex items-center justify-center mb-6">
              <Search size={32} />
            </div>
            <h1 className="text-2xl font-extrabold text-gray-900 uppercase">Track Civic Issue</h1>
            <p className="text-gray-500 mt-2 mb-8">Enter your Ticket ID to get real-time Swiggy-like live status</p>
            
            <form onSubmit={handleSearch} className="max-w-md mx-auto relative">
              <input
                type="text"
                required
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="e.g. #CB-8842"
                className="w-full pl-6 pr-12 py-4 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 uppercase transition-all"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-900 hover:bg-blue-800 text-white rounded-full px-6 font-bold transition-colors flex items-center"
              >
                <ChevronRight size={24} />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
            {/* Ticket Header Card */}
            <div className="bg-blue-900 p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <MapPin size={120} />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {mockTicket.category}
                  </span>
                  <span className="text-sm font-bold bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                    {mockTicket.id}
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold mt-3">{mockTicket.location}</h2>
                <div className="flex items-center mt-4 text-blue-100 text-sm font-medium">
                  <span className="flex items-center mr-6"><Clock size={16} className="mr-1.5" /> SLA: {mockTicket.slaLeft}</span>
                  <span className="flex items-center"><Star size={16} className="mr-1.5 text-yellow-400" /> High Priority</span>
                </div>
              </div>
            </div>

            {/* AI Before / After Vision (Show if stage >= 4 for demo purposes) */}
            <div className="bg-gray-50 p-6 border-b border-gray-100">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex items-center">
                <ImageIcon size={14} className="mr-2" /> AI Vision Evidence
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video bg-gray-200">
                  <img src={mockTicket.beforeImage} alt="Before" className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded uppercase backdrop-blur-md">Before</div>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-gray-200 shadow-sm aspect-video bg-gray-200 flex items-center justify-center">
                  {mockTicket.currentStage >= 5 ? (
                    <>
                      <img src={mockTicket.afterImage} alt="After" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase shadow-md">Fixed</div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Clock size={24} className="mx-auto mb-2 opacity-50" />
                      <span className="text-xs font-medium uppercase tracking-widest">Awaiting Fix</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Swiggy-style Timeline */}
            <div className="p-8">
              <h3 className="text-sm font-extrabold text-gray-800 uppercase tracking-widest mb-8 border-b pb-4">Live Tracking</h3>
              <div className="relative">
                {trackingStages.map((stage, index) => {
                  const isCompleted = stage.id < mockTicket.currentStage;
                  const isActive = stage.id === mockTicket.currentStage;

                  return (
                    <div key={stage.id} className="flex mb-8 relative last:mb-0">
                      {/* Vertical Line Connector */}
                      {index !== trackingStages.length - 1 && (
                        <div className={`absolute left-5 top-10 bottom-[-32px] w-0.5 
                          ${stage.id < mockTicket.currentStage ? 'bg-green-500' : 'bg-gray-200 border-dashed border-l-2 border-gray-200 bg-transparent'}`} 
                        ></div>
                      )}

                      {/* Icon Bubble */}
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-sm
                        ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                          isActive ? 'bg-white border-orange-500 text-orange-500 ring-4 ring-orange-100 animate-pulse' : 
                          'bg-white border-gray-300 text-gray-300'}`}
                      >
                        {isCompleted ? <CheckCircle2 size={20} /> : stage.icon}
                      </div>

                      {/* Content */}
                      <div className="ml-6 pt-1">
                        <h4 className={`text-sm font-bold uppercase tracking-wide
                          ${isCompleted ? 'text-gray-900' : isActive ? 'text-orange-600' : 'text-gray-400'}`}
                        >
                          {stage.title}
                        </h4>
                        <p className={`text-sm mt-1 
                          ${isCompleted ? 'text-gray-600' : isActive ? 'text-gray-800 font-medium' : 'text-gray-400'}`}
                        >
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-center">
              <button onClick={() => setIsTracking(false)} className="text-sm font-bold text-blue-900 hover:text-blue-700 uppercase tracking-wide">
                Track Another Ticket
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
