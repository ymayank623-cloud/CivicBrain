import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Popup, Circle, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  LogOut, ShieldCheck, AlertTriangle, TrendingUp, Activity, MapPin, Target, Trophy, Clock
} from 'lucide-react';

// Ward 14 Boundary Polygon
const ward14Polygon: [number, number][] = [
  [26.860, 80.930], [26.865, 80.950], [26.845, 80.955], [26.840, 80.935]
];

export default function CommissionerDashboard() {
  const navigate = useNavigate();
  const [heatmapData, setHeatmapData] = useState<[number, number][]>([]);

  useEffect(() => {
    // Load mock complaints from localStorage to build heatmap
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const points: [number, number][] = demoComplaints
      .filter((c: any) => c.location)
      .map((c: any) => c.location);
    setHeatmapData(points);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0F172A] font-sans selection:bg-[#E05344] selection:text-white flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        
        .pulse-marker {
          width: 24px;
          height: 24px;
          background-color: #DC2626;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          animation: pulse-ring 1.5s infinite cubic-bezier(0.66, 0, 0, 1);
          border: 2px solid white;
        }
        @keyframes pulse-ring {
          to {
            box-shadow: 0 0 0 25px rgba(220, 38, 38, 0);
          }
        }
      `}</style>

      {/* War-Room Header */}
      <nav className="bg-[#0B1121] text-white border-b border-gray-800 shadow-2xl py-3 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 flex justify-between items-center h-12">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#E05344]/20 border border-[#E05344]/50 rounded-full flex items-center justify-center">
              <ShieldCheck className="text-[#E05344]" size={22} />
            </div>
            <span className="font-serif font-bold text-2xl tracking-tight text-white">
              CivicBrain <span className="text-gray-500 font-sans text-xs ml-3 tracking-[0.2em] uppercase">Commissioner War-Room</span>
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center bg-green-500/10 text-green-400 px-3 py-1 rounded-full border border-green-500/20 text-xs font-bold uppercase tracking-widest">
              <Activity size={14} className="mr-2" /> GIS Link Active
            </div>
            <span className="text-sm font-medium text-gray-400">Welcome, Commissioner</span>
            <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: GIS MAP (Takes up 2 columns on XL screens) */}
        <div className="xl:col-span-2 flex flex-col bg-[#111827] rounded-[2rem] shadow-2xl border border-gray-800 overflow-hidden relative min-h-[600px]">
          <div className="absolute top-6 left-6 z-[400] bg-[#0B1121]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-gray-700 shadow-2xl">
            <h2 className="font-serif text-xl font-bold text-white flex items-center">
              <MapPin size={20} className="text-[#E05344] mr-2" /> Live Geospatial Grid
            </h2>
            <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Showing: Ward Boundaries & Heatmap</p>
          </div>

          <div className="absolute top-6 right-6 z-[400] flex flex-col gap-2">
            <div className="bg-[#0B1121]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 text-xs font-bold text-gray-300 flex items-center shadow-2xl">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500 mr-2"></span> Heatmap Cluster
            </div>
            <div className="bg-[#0B1121]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 text-xs font-bold text-gray-300 flex items-center shadow-2xl">
              <span className="w-3 h-3 rounded-full bg-[#3B82F6]/20 border border-[#3B82F6] mr-2"></span> Ward Polygons
            </div>
            <div className="bg-[#0B1121]/90 backdrop-blur-md px-4 py-2 rounded-xl border border-gray-700 text-xs font-bold text-gray-300 flex items-center shadow-2xl">
              <div className="pulse-marker w-3 h-3 mr-2" style={{boxShadow: 'none', animation: 'none'}}></div> Critical Escapations
            </div>
          </div>

          {/* Map */}
          <MapContainer center={[26.8500, 80.9400]} zoom={14} style={{ height: '100%', width: '100%', zIndex: 10 }}>
            {/* CartoDB Dark Matter TileLayer for War-Room Aesthetic */}
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            {/* Ward Polygon */}
            <Polygon 
              positions={ward14Polygon} 
              pathOptions={{ color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 0.1, weight: 2, dashArray: '5, 5' }} 
            >
              <Popup><strong className="text-gray-900">Ward 14 (High Alert Zone)</strong></Popup>
            </Polygon>

            {/* Simulated KDE Heatmap */}
            {heatmapData.map((coord, idx) => (
              <Circle 
                key={`heat-${idx}`}
                center={coord} 
                radius={400} 
                pathOptions={{ stroke: false, fillColor: '#EF4444', fillOpacity: 0.15 }}
              />
            ))}

            {/* Live Pulsing Critical Markers will appear here when SLAs breach */}


          </MapContainer>
        </div>

        {/* RIGHT COLUMN: ANALYTICS & PREDICTIONS */}
        <div className="flex flex-col gap-6">
          
          {/* Predictive AI Alert Card */}
          <div className="bg-gradient-to-br from-[#DC2626] to-[#991B1B] rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-transform">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 text-black/10 transform rotate-12 transition-transform group-hover:rotate-45 duration-700">
              <TrendingUp size={180} />
            </div>
            <div className="relative z-10">
              <div className="bg-black/20 inline-flex px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest mb-4 border border-white/10 backdrop-blur-md flex items-center">
                <AlertTriangle size={12} className="mr-1" /> AI Predictive Engine
              </div>
              <h3 className="font-serif text-3xl font-bold text-white mb-3 leading-tight">Monsoon Risk Detected</h3>
              <p className="text-red-100 text-sm leading-relaxed mb-6 font-medium">
                Based on historical density kernels and terrain data, <strong className="text-white">Ward 14 Underpass</strong> has an <strong className="text-white text-lg bg-black/20 px-2 rounded">85% probability</strong> of critical waterlogging within the next 48 hours of rainfall.
              </p>
              <button className="bg-white text-[#DC2626] font-bold text-xs uppercase tracking-widest px-6 py-3 rounded-full shadow-lg hover:bg-gray-100 transition-colors w-full flex justify-center items-center">
                Deploy Preventive Pumps <Target size={14} className="ml-2" />
              </button>
            </div>
          </div>

          {/* Inter-Department Leaderboard */}
          <div className="bg-[#111827] rounded-[2rem] shadow-2xl border border-gray-800 overflow-hidden flex-1 flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-[#0B1121]">
              <h3 className="font-serif text-xl font-bold text-white flex items-center">
                <Trophy size={18} className="text-yellow-500 mr-2" /> Dept Leaderboard
              </h3>
            </div>
            <div className="p-2 flex-1">
              {[
                { rank: 1, name: "Solid Waste Mgmt", score: 94, time: "4.2h avg", trend: "up", color: "text-green-400" },
                { rank: 2, name: "Electricity Dept", score: 88, time: "18h avg", trend: "up", color: "text-green-400" },
                { rank: 3, name: "Water Works", score: 72, time: "28h avg", trend: "down", color: "text-red-400" },
                { rank: 4, name: "PWD (Roads)", score: 45, time: "85h avg", trend: "down", color: "text-red-400" }
              ].map((dept, index) => (
                <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 rounded-xl transition-colors mb-1">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mr-4 ${index === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : 'bg-gray-800 text-gray-400'}`}>
                      #{dept.rank}
                    </div>
                    <div>
                      <div className="font-bold text-gray-200 text-sm">{dept.name}</div>
                      <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-center mt-0.5">
                        <Clock size={10} className="mr-1" /> SLA Speed: {dept.time}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg font-serif ${dept.color}`}>{dept.score}%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Satisfaction</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}




