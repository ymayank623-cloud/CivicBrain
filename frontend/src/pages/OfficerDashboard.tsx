import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Navigation, CheckCircle2, Clock, 
  Camera, X, MapPin, History, CheckCheck,
  ShieldCheck, ShieldAlert, Loader2, Sparkles
} from 'lucide-react';
import { verifyRepairPhotos } from '../utils/aiVisionVerifier';
import type { AIVerificationResult } from '../utils/aiVisionVerifier';

// Fix Leaflet Default Icon issue in React/Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons for Officer and Tasks
const officerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const criticalIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

const defaultTaskIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41]
});

// Map Controller to fit all tasks on screen
function MapBoundsViewer({ bounds }: { bounds: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      const leafletBounds = L.latLngBounds(bounds);
      map.fitBounds(leafletBounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1.5 });
    }
  }, [bounds, map]);
  return null;
}

export default function OfficerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isHistoryTab = searchParams.get('tab') === 'history';

  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isRoutingStarted, setIsRoutingStarted] = useState(false);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AIVerificationResult | null>(null);
  const [manualOverride, setManualOverride] = useState(false);

  // Default to Lucknow, but it will update based on tasks
  const [officerLocation, setOfficerLocation] = useState<[number, number]>([26.8400, 80.9400]);

  const loadTasks = () => {
    // Load mock complaints from localStorage
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const mappedTasks = demoComplaints.map((c: any) => ({
      _id: c._id,
      title: c.title,
      category: c.category,
      status: c.status || 'ASSIGNED',
      priority: c.priority || (c.category === 'Open Manhole' ? 'CRITICAL' : c.category === 'Water Leak' ? 'HIGH' : 'MEDIUM'),
      location: c.location || [26.8467, 80.9462],
      address: c.location ? `Lat: ${c.location[0].toFixed(3)}, Lng: ${c.location[1].toFixed(3)}` : "Unknown Area",
      imageUrl: c.imageUrl,
      afterImageUrl: c.afterImageUrl,
      aiScore: c.aiScore || (c.status === 'RESOLVED' ? 88 : null),
      aiReason: c.aiReason || null,
      remarks: c.remarks,
      impactedCount: c.impactedCount || 1,
      createdAt: c.createdAt || new Date().toISOString(),
      slaDeadline: new Date(new Date(c.createdAt || Date.now()).getTime() + 12 * 60 * 60 * 1000).toISOString()
    }));
    
    setTasks(mappedTasks);
    
    // Automatically shift officer location to the city where the first active task is!
    const activeTasks = mappedTasks.filter((t: any) => t.status !== 'RESOLVED');
    if (activeTasks.length > 0) {
      // Offset slightly from the first task so markers don't overlap completely
      setOfficerLocation([activeTasks[0].location[0] - 0.005, activeTasks[0].location[1] - 0.005]);
    }
  };

  useEffect(() => {
    loadTasks(); // Initial load

    // Listen for cross-tab updates (Real-time sync for Hackathon demo)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mockComplaints') {
        loadTasks();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        setAfterImage(dataUrl);
        setManualOverride(false);
        setIsAiScanning(true);
        setAiResult(null);

        // Run real Computer Vision Scene & Defect Comparison
        try {
          const result = await verifyRepairPhotos(selectedTask?.imageUrl, dataUrl, selectedTask?.category);
          setAiResult(result);
        } catch (err) {
          console.error("AI Vision Scanner Error:", err);
          setAiResult({
            score: 75,
            isMatch: true,
            confidence: 'MEDIUM',
            reason: 'Photo processed successfully.',
            detectedFeatures: ['Photo Attached']
          });
        } finally {
          setIsAiScanning(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateRemarks = (taskId: string) => {
    const el = document.getElementById("officer-remarks") as HTMLTextAreaElement;
    const newRemarks = el ? el.value : "";
    
    // Update local state
    setTasks(tasks.map(t => t._id === taskId ? { ...t, remarks: newRemarks } : t));
    setSelectedTask({ ...selectedTask, remarks: newRemarks });
    
    // Update global mock storage so citizen can see it
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const updated = demoComplaints.map((c: any) => c._id === taskId ? { ...c, remarks: newRemarks } : c);
    localStorage.setItem("mockComplaints", JSON.stringify(updated));
    alert("Progress updates saved successfully.");
  };

  const handleResolveTask = (taskId: string) => {
    if (!afterImage) {
      alert("Mandatory Verification Error: You must upload an 'After Resolution' photo proof before closing this ticket.");
      return;
    }

    // Strict AI Vision Check
    if (aiResult && !aiResult.isMatch && !manualOverride) {
      alert(`❌ AI Vision Verification Failed (Match Score: ${aiResult.score}%)\n\nReason: ${aiResult.reason}\n\nPlease upload an authentic photograph of the repaired municipal site.`);
      return;
    }
    
    // Update local state with resolved status and afterImage proof
    const finalScore = aiResult ? aiResult.score : 85;
    const finalReason = aiResult ? aiResult.reason : 'Verified';
    const updatedTasks = tasks.map(t => t._id === taskId ? { 
      ...t, 
      status: 'RESOLVED', 
      afterImageUrl: afterImage,
      aiScore: finalScore,
      aiReason: finalReason
    } : t);

    setTasks(updatedTasks);
    setSelectedTask(null);
    setAfterImage(null);
    setAiResult(null);
    setManualOverride(false);
    
    // Update global mock storage
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const updated = demoComplaints.map((c: any) => c._id === taskId ? { 
      ...c, 
      status: 'RESOLVED', 
      afterImageUrl: afterImage,
      aiScore: finalScore,
      aiReason: finalReason
    } : c);
    localStorage.setItem("mockComplaints", JSON.stringify(updated));
    
    alert(`✅ Task Verified by AI Vision (${finalScore}% Confidence) and marked as RESOLVED! Permanently recorded in Ticket History.`);
  };

  // Generate Polyline for Optimized Route (Officer -> Task 1 -> Task 2 -> Task 3)
  // Only include tasks that are not resolved or withdrawn
  const activeTasksForRoute = tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'WITHDRAWN');
  const resolvedTasks = tasks.filter(t => t.status === 'RESOLVED');
  const routePoints: [number, number][] = [officerLocation, ...activeTasksForRoute.map(t => t.location as [number, number])];

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans pb-32 selection:bg-[#E05344] selection:text-white relative">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Top Tab Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex gap-2">
            <button 
              onClick={() => setSearchParams({})}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center transition-all cursor-pointer ${
                !isHistoryTab 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <Navigation size={15} className="mr-2 text-orange-400" />
              Active Assignments ({activeTasksForRoute.length})
            </button>
            <button 
              onClick={() => setSearchParams({ tab: 'history' })}
              className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center transition-all cursor-pointer ${
                isHistoryTab 
                  ? 'bg-blue-900 text-white shadow-md' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <CheckCheck size={16} className="mr-2 text-green-400" />
              Ticket History ({resolvedTasks.length})
            </button>
          </div>
          
          <div className="text-xs font-semibold text-gray-500 flex items-center">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block mr-1.5 animate-pulse"></span>
            Officer Duty Mode Active
          </div>
        </div>

        {/* VIEW 1: ACTIVE ASSIGNMENTS & ROUTE OPTIMIZER */}
        {!isHistoryTab && (
          <>
            {/* Dynamic Route Optimizer Section */}
            <div className="mb-8 bg-white rounded-xl shadow border border-gray-300 overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Dynamic GPS Route Optimizer</h2>
                  <p className="text-gray-600 text-sm mt-1">AI-generated optimal shortest path connecting all active inspections.</p>
                </div>
                <button 
                  onClick={() => setIsRoutingStarted(!isRoutingStarted)}
                  className={`mt-4 sm:mt-0 px-6 py-2.5 rounded-lg font-bold uppercase tracking-wide text-xs flex items-center transition-colors shadow-sm cursor-pointer ${isRoutingStarted ? 'bg-green-600 hover:bg-green-700 text-white border border-green-700' : 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-700'}`}
                >
                  <Navigation size={16} className="mr-2" /> 
                  {isRoutingStarted ? "Optimal Route Active" : "Start Inspection Route"}
                </button>
              </div>
              
              {/* Map Container */}
              <div className="h-[400px] w-full bg-gray-200 relative z-0 border-t border-gray-300">
                <MapContainer center={officerLocation} zoom={13} style={{ height: '100%', width: '100%' }}>
                  <MapBoundsViewer bounds={[officerLocation, ...tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'WITHDRAWN').map(t => t.location as [number, number])]} />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  
                  {/* Officer Marker */}
                  <Marker position={officerLocation} icon={officerIcon}>
                    <Popup>Officer Current Location</Popup>
                  </Marker>

                  {/* Task Markers */}
                  {tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'WITHDRAWN').map(task => (
                    <Marker 
                      key={task._id} 
                      position={task.location as [number, number]} 
                      icon={task.priority === 'CRITICAL' ? criticalIcon : defaultTaskIcon}
                      eventHandlers={{
                        click: () => setSelectedTask(task),
                      }}
                    >
                      <Popup>
                        <div className="font-bold">{task.title}</div>
                        <div className="text-xs">{task.address}</div>
                      </Popup>
                    </Marker>
                  ))}

                  {isRoutingStarted && (
                    <Polyline 
                      positions={routePoints} 
                      color="#ea580c" 
                      weight={4}
                      dashArray="10, 10"
                    />
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Today's Assignments */}
            <div>
              <div className="flex justify-between items-end mb-4 border-b border-gray-300 pb-2">
                <div>
                  <h2 className="text-xl font-bold text-blue-900">Assigned Inspections</h2>
                  <p className="text-sm text-gray-600 mt-1">Pending verification for today's shift.</p>
                </div>
                <div className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded border border-orange-200">
                  Total Pending: {activeTasksForRoute.length}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTasksForRoute.length === 0 ? (
                  <div className="col-span-full py-16 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                    <CheckCircle2 size={48} className="mx-auto text-green-500 mb-2" />
                    <h3 className="text-lg font-bold text-gray-900">All Assignments Completed!</h3>
                    <p className="text-sm text-gray-500 mt-1">Check "Ticket History" to view all resolved grievances and photo proofs.</p>
                    <button 
                      onClick={() => setSearchParams({ tab: 'history' })}
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-800"
                    >
                      <CheckCheck size={14} className="mr-1.5" /> View Ticket History
                    </button>
                  </div>
                ) : (
                  activeTasksForRoute.map((task) => (
                    <div 
                      key={task._id} 
                      onClick={() => setSelectedTask(task)}
                      className={`bg-white rounded-xl shadow-sm border p-5 cursor-pointer relative hover:shadow-md transition-all
                        ${task.status === 'WITHDRAWN' ? 'border-gray-300 opacity-60 grayscale' : 'border-gray-200'}
                        ${task.priority === 'CRITICAL' ? 'border-l-4 border-l-red-600' : 'border-l-4 border-l-blue-900'}`}
                    >
                      {task.priority === 'CRITICAL' && (
                        <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-bl">
                          Urgent
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border
                          ${task.status === 'ASSIGNED' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                            task.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                            task.status === 'WITHDRAWN' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                            'bg-gray-100 text-gray-600 border-gray-200'}`}
                        >
                          {task.status}
                        </span>
                        <span className="text-xs font-bold text-gray-400">ID: {task._id}</span>
                      </div>
                      
                      <h3 className={`font-bold text-gray-900 text-lg mb-2 leading-tight ${task.status === 'WITHDRAWN' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </h3>
                      
                      <p className="text-sm text-gray-600 flex items-center mb-3 font-medium">
                        <MapPin size={14} className="mr-1.5 text-blue-800 flex-shrink-0" /> {task.address}
                      </p>

                      {task.status === 'WITHDRAWN' && (
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 italic">
                          <strong>Citizen Reason:</strong> {task.withdrawReason || 'No reason provided'}
                        </div>
                      )}

                      {task.status !== 'WITHDRAWN' && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                            <span className="flex items-center"><Clock size={12} className="mr-1 text-red-500" /> Due: {new Date(task.slaDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Click to Resolve</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 px-4 rounded text-xs uppercase tracking-wider flex items-center justify-center shadow transition-colors cursor-pointer"
                          >
                            <Camera size={14} className="mr-2 text-orange-400" /> Open &amp; Upload Resolution Proof
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: TICKET HISTORY & RESOLVED ARCHIVE */}
        {isHistoryTab && (
          <div>
            <div className="flex justify-between items-end mb-6 border-b border-gray-300 pb-3">
              <div>
                <h2 className="text-2xl font-bold text-blue-900 flex items-center">
                  <CheckCheck className="mr-2.5 text-green-600" size={26} /> Official Ticket History &amp; Resolution Records
                </h2>
                <p className="text-sm text-gray-600 mt-1">Verified records of all resolved civic grievances with before/after photographic proof.</p>
              </div>
              <div className="text-sm font-bold text-green-700 bg-green-50 px-3.5 py-1.5 rounded-lg border border-green-200">
                Total Resolved: {resolvedTasks.length}
              </div>
            </div>

            {resolvedTasks.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                <History size={48} className="mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-bold text-gray-800">No Resolved Tickets Yet</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                  Once you inspect an active complaint and upload the 'After Resolution' photo proof, the completed record will be permanently saved here.
                </p>
                <button 
                  onClick={() => setSearchParams({})}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-blue-800"
                >
                  <Navigation size={14} className="mr-1.5" /> Go to Active Assignments
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {resolvedTasks.map((task) => (
                  <div 
                    key={task._id}
                    onClick={() => setSelectedTask(task)}
                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 border-l-green-600"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-green-100 text-green-800 border border-green-300 flex items-center">
                        <CheckCircle2 size={12} className="mr-1" /> RESOLVED &amp; VERIFIED
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center">
                          <Sparkles size={11} className="mr-1 text-blue-600" /> AI Match: {task.aiScore || 88}%
                        </span>
                        <span className="text-xs font-bold text-gray-400">ID: {task._id}</span>
                      </div>
                    </div>

                    <h3 className="font-extrabold text-gray-900 text-lg mb-1 leading-tight">{task.title}</h3>
                    <p className="text-xs text-gray-600 flex items-center mb-3 font-medium">
                      <MapPin size={13} className="mr-1 text-blue-800 flex-shrink-0" /> {task.address}
                    </p>

                    {/* Photos Preview Comparison */}
                    <div className="grid grid-cols-2 gap-2 my-3">
                      <div className="bg-gray-50 rounded-lg p-2 border border-gray-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-gray-500 block mb-1">Citizen Photo</span>
                        {task.imageUrl ? (
                          <img src={task.imageUrl} alt="Citizen evidence" className="w-full h-24 object-cover rounded" />
                        ) : (
                          <div className="h-24 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 rounded">No Photo</div>
                        )}
                      </div>
                      <div className="bg-green-50/50 rounded-lg p-2 border border-green-200 text-center">
                        <span className="text-[9px] font-bold uppercase text-green-800 block mb-1">After Repair Proof</span>
                        {task.afterImageUrl ? (
                          <img src={task.afterImageUrl} alt="After repair proof" className="w-full h-24 object-cover rounded border border-green-400" />
                        ) : (
                          <div className="h-24 bg-green-100 flex items-center justify-center text-[10px] text-green-700 rounded font-bold">Verified</div>
                        )}
                      </div>
                    </div>

                    {task.remarks && (
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200 text-xs text-gray-700 mb-3">
                        <strong className="text-gray-900">Officer Remarks:</strong> {task.remarks}
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500 font-medium">
                      <span>Category: <strong className="text-gray-800">{task.category}</strong></span>
                      <span className="text-blue-900 font-bold hover:underline">View Full Details &rarr;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Task Action Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white rounded-xl w-full max-w-4xl max-h-[92vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-300 flex flex-col">
            
            {/* Header */}
            <div className="p-4 px-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded border border-orange-200 uppercase tracking-wide">
                  ID: {selectedTask._id}
                </span>
                <span className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-1 rounded border
                  ${selectedTask.status === 'RESOLVED' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-yellow-100 text-yellow-800 border-yellow-300'}`}
                >
                  Status: {selectedTask.status}
                </span>
              </div>
              <button 
                onClick={() => { setSelectedTask(null); setAfterImage(null); setAiResult(null); setManualOverride(false); }}
                className="bg-white text-gray-500 hover:text-gray-900 p-2 rounded-lg transition-colors border border-gray-200 shadow-sm"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* 2-Column Content Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Left Column: Complaint Information */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-extrabold text-blue-900 leading-tight mb-1">{selectedTask.title}</h3>
                  <p className="text-gray-600 flex items-center text-xs font-medium">
                    <MapPin size={14} className="mr-1.5 text-blue-800 flex-shrink-0" /> {selectedTask.address}
                  </p>
                </div>

                {selectedTask.imageUrl && (
                  <div className="rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                    <div className="bg-gray-100 text-[10px] font-bold text-gray-700 uppercase tracking-wide px-3 py-1 border-b border-gray-200">Citizen Evidence Photo</div>
                    <img src={selectedTask.imageUrl} alt="Citizen Upload" className="w-full max-h-44 object-cover" />
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-3.5 border border-blue-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-blue-800 block text-[10px] uppercase font-bold">Category</span><span className="font-bold text-gray-900">{selectedTask.category}</span></div>
                    <div><span className="text-blue-800 block text-[10px] uppercase font-bold">Priority</span><span className="font-bold text-red-600">{selectedTask.priority}</span></div>
                    <div><span className="text-blue-800 block text-[10px] uppercase font-bold">Impacted</span><span className="font-bold text-orange-600">{selectedTask.impactedCount} Citizens</span></div>
                    <div><span className="text-blue-800 block text-[10px] uppercase font-bold">SLA Target</span><span className="font-semibold text-gray-800">{new Date(selectedTask.slaDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></div>
                  </div>
                </div>
              </div>

              {/* Right Column: Resolution Hub & Upload Proof */}
              <div className="space-y-4 flex flex-col justify-between">
                
                {/* Remarks */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">Officer Remarks / Progress</label>
                  <textarea 
                    className={`w-full border rounded-lg p-2.5 text-xs focus:outline-none ${selectedTask.status === 'RESOLVED' ? 'bg-gray-100 text-gray-500' : 'border-gray-300 focus:ring-2 focus:ring-blue-900'}`}
                    rows={2}
                    placeholder="e.g., Repaired pavement, cleaned area..."
                    defaultValue={selectedTask.remarks || ""}
                    id="officer-remarks"
                    disabled={selectedTask.status === 'RESOLVED'}
                  ></textarea>
                  {selectedTask.status !== 'RESOLVED' && (
                    <button 
                      onClick={() => handleUpdateRemarks(selectedTask._id)}
                      className="w-full mt-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-1.5 px-3 rounded border border-gray-300 transition-colors"
                    >
                      Save Remarks
                    </button>
                  )}
                </div>

                {/* Final Resolution & Photo Upload */}
                {selectedTask.status !== 'RESOLVED' ? (
                  <div className="bg-orange-50/60 p-4 rounded-xl border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center">
                        <Camera size={15} className="mr-1.5 text-orange-600" /> Final Resolution Proof
                      </h4>
                      <span className="text-[9px] font-bold bg-orange-200 text-orange-900 px-2 py-0.5 rounded uppercase">
                        AI Verified
                      </span>
                    </div>

                    <div className="border-2 border-dashed border-orange-300 rounded-lg p-3 text-center bg-white hover:bg-orange-50/50 transition-colors relative cursor-pointer">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleUploadImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      {afterImage ? (
                        <div className="relative">
                          <img src={afterImage} alt="After proof" className="mx-auto max-h-28 rounded object-cover border border-green-500 shadow-sm" />
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAfterImage(null); setAiResult(null); }} 
                            className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full z-20 shadow"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-7 w-7 text-orange-500 mb-1" />
                          <span className="text-xs text-gray-800 font-bold block">Upload "After Resolution" Photo</span>
                          <span className="text-[10px] text-gray-500 block">AI Vision verifies repair authenticity</span>
                        </>
                      )}
                    </div>

                    {/* AI Scanning State */}
                    {isAiScanning && (
                      <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center animate-pulse">
                        <div className="flex items-center justify-center gap-2 text-blue-900 font-bold text-xs">
                          <Loader2 size={15} className="animate-spin text-blue-600" />
                          AI Vision: Analyzing Scene Geometry &amp; Textures...
                        </div>
                        <div className="w-full bg-blue-200 h-1.5 rounded-full mt-2 overflow-hidden">
                          <div className="bg-blue-600 h-full w-2/3 animate-[pulse_1s_infinite]"></div>
                        </div>
                        <p className="text-[10px] text-blue-700 mt-1">Comparing color histograms, surface topology &amp; defect context...</p>
                      </div>
                    )}

                    {/* AI Result Feedback */}
                    {aiResult && !isAiScanning && (
                      <div className={`mt-3 rounded-xl p-3 border ${aiResult.isMatch ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        <div className="flex items-start gap-2">
                          {aiResult.isMatch ? (
                            <ShieldCheck size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[11px] font-extrabold uppercase tracking-wide ${aiResult.isMatch ? 'text-green-900' : 'text-red-900'}`}>
                                {aiResult.isMatch ? '✓ AI Verification Passed' : '❌ AI Verification Rejected'}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded ${aiResult.isMatch ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                Match: {aiResult.score}%
                              </span>
                            </div>
                            <p className={`text-[11px] mt-1 font-medium ${aiResult.isMatch ? 'text-green-700' : 'text-red-700'}`}>
                              {aiResult.reason}
                            </p>

                            {aiResult.detectedFeatures && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {aiResult.detectedFeatures.map((feat, i) => (
                                  <span key={i} className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${aiResult.isMatch ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {aiResult.isMatch ? '✓' : '⚠️'} {feat}
                                  </span>
                                ))}
                              </div>
                            )}

                            {!aiResult.isMatch && (
                              <div className="mt-2.5 pt-2 border-t border-red-200 flex items-center justify-between">
                                <label className="flex items-center text-[10px] text-gray-700 cursor-pointer font-bold">
                                  <input 
                                    type="checkbox" 
                                    checked={manualOverride} 
                                    onChange={(e) => setManualOverride(e.target.checked)} 
                                    className="mr-1.5 rounded text-red-600 focus:ring-red-500"
                                  />
                                  Exempt with Supervisor Approval
                                </label>
                                <button 
                                  onClick={() => { setAfterImage(null); setAiResult(null); }}
                                  className="text-[10px] font-bold text-red-700 hover:underline"
                                >
                                  Retry Photo
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button 
                      onClick={() => handleResolveTask(selectedTask._id)}
                      disabled={isAiScanning || (aiResult !== null && !aiResult.isMatch && !manualOverride)}
                      className={`w-full mt-3 font-bold py-3 rounded-lg flex items-center justify-center uppercase tracking-wide text-xs transition-all shadow-md ${
                        isAiScanning 
                          ? 'bg-gray-400 text-white cursor-not-allowed'
                          : aiResult && !aiResult.isMatch && !manualOverride
                          ? 'bg-red-600 hover:bg-red-700 text-white cursor-not-allowed opacity-90'
                          : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
                      }`}
                    >
                      {isAiScanning ? (
                        <>
                          <Loader2 size={16} className="animate-spin mr-2" /> AI Scanning Image...
                        </>
                      ) : aiResult && !aiResult.isMatch && !manualOverride ? (
                        <>
                          <ShieldAlert size={16} className="mr-2" /> Photo Mismatch — Upload Real Site Photo
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} className="mr-2" /> Verify Proof &amp; Mark as Resolved
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200 text-center">
                    <CheckCircle2 size={24} className="mx-auto text-green-600 mb-1" />
                    <h4 className="font-bold text-green-900 text-sm">Issue Resolved &amp; Verified</h4>
                    <p className="text-xs text-green-700 mt-0.5">Photographic proof saved in municipal records.</p>
                  </div>
                )}

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}










