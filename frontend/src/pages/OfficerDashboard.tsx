import React, { useState, useEffect } from 'react';

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { 
  Navigation, CheckCircle2, Clock, 
  Camera, X, MapPin
} from 'lucide-react';

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
  
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isRoutingStarted, setIsRoutingStarted] = useState(false);
  const [afterImage, setAfterImage] = useState<string | null>(null);
  const [showPrevious, setShowPrevious] = useState(false);
  
  // Custom Toast Animation State
  
  
  
  
  // Default to Lucknow, but it will update based on tasks
  const [officerLocation, setOfficerLocation] = useState<[number, number]>([26.8400, 80.9400]);

  useEffect(() => {
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
        impactedCount: c.impactedCount || 1,
        slaDeadline: new Date(new Date(c.createdAt).getTime() + 12 * 60 * 60 * 1000).toISOString()
      }));
      
      setTasks(mappedTasks);
      
      // Automatically shift officer location to the city where the first active task is!
      const activeTasks = mappedTasks.filter((t: any) => t.status !== 'RESOLVED');
      if (activeTasks.length > 0) {
        // Offset slightly from the first task so markers don't overlap completely
        setOfficerLocation([activeTasks[0].location[0] - 0.005, activeTasks[0].location[1] - 0.005]);
      }
    };

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
      reader.onloadend = () => {
        setAfterImage(reader.result as string);
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

  const handleArchiveTask = (taskId: string) => {
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: 'ARCHIVED' } : t));
    setSelectedTask(null);
    
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const updated = demoComplaints.map((c: any) => c._id === taskId ? { ...c, status: 'ARCHIVED' } : c);
    localStorage.setItem("mockComplaints", JSON.stringify(updated));
  };

  const handleResolveTask = (taskId: string) => {
    if (!afterImage) {
      alert("Mandatory Verification Error: You must upload an 'After Resolution' photo proof before closing this ticket.");
      return;
    }
    
    // Update local state with resolved status and afterImage proof
    setTasks(tasks.map(t => t._id === taskId ? { ...t, status: 'RESOLVED', afterImageUrl: afterImage } : t));
    setSelectedTask(null);
    setAfterImage(null);
    
    // Update global mock storage
    const demoComplaints = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
    const updated = demoComplaints.map((c: any) => c._id === taskId ? { ...c, status: 'RESOLVED', afterImageUrl: afterImage } : c);
    localStorage.setItem("mockComplaints", JSON.stringify(updated));
    alert("Task verified and marked as RESOLVED with photographic evidence!");
  };

  // Generate Polyline for Optimized Route (Officer -> Task 1 -> Task 2 -> Task 3)
  // Only include tasks that are not resolved or withdrawn
  const activeTasksForRoute = tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'WITHDRAWN');
  const routePoints: [number, number][] = [officerLocation, ...activeTasksForRoute.map(t => t.location as [number, number])];

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans pb-32 selection:bg-[#E05344] selection:text-white relative">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Dynamic Route Optimizer Section */}
        <div className="mb-8 bg-white rounded shadow border border-gray-300 overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center bg-gray-50">
            <div>
              <h2 className="text-xl font-bold text-blue-900">Dynamic GPS Route Optimizer</h2>
              <p className="text-gray-600 text-sm mt-1">AI-generated optimal shortest path connecting all active inspections.</p>
            </div>
            <button 
              onClick={() => setIsRoutingStarted(!isRoutingStarted)}
              className={`mt-4 sm:mt-0 px-6 py-2 rounded font-bold uppercase tracking-wide text-xs flex items-center transition-colors shadow-sm ${isRoutingStarted ? 'bg-green-600 hover:bg-green-700 text-white border border-green-700' : 'bg-orange-600 hover:bg-orange-700 text-white border border-orange-700'}`}
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
              Total Pending: {tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'ARCHIVED').length}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'ARCHIVED').length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white rounded shadow-sm border border-gray-200">
                You have no active assignments for today! Great job.
              </div>
            ) : (
              tasks.filter(t => t.status !== 'RESOLVED' && t.status !== 'ARCHIVED').map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => setSelectedTask(task)}
                  className={`bg-white rounded shadow-sm border p-5 cursor-pointer relative hover:shadow transition-shadow
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
                    <MapPin size={14} className="mr-1.5" /> {task.address}
                  </p>

                  {task.status === 'WITHDRAWN' && (
                    <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600 italic">
                      <strong>Citizen Reason:</strong> {task.withdrawReason || 'No reason provided'}
                    </div>
                  )}

                  {task.status !== 'WITHDRAWN' && (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        <Clock size={12} className="mr-1 text-red-500" /> Due: {new Date(task.slaDeadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Task Action Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200 border border-gray-300">
            <button 
              onClick={() => { setSelectedTask(null); setAfterImage(null); }}
              className="absolute top-4 right-4 bg-gray-100 text-gray-500 hover:text-gray-900 p-2 rounded transition-colors z-10 border border-gray-200"
            >
              <X size={20} />
            </button>
            
            <div className="p-6">
              <div className="text-[10px] font-bold text-orange-600 uppercase tracking-wide mb-1">Issue ID: {selectedTask._id}</div>
              <h3 className="text-2xl font-bold text-blue-900 leading-tight mb-2">{selectedTask.title}</h3>
              <p className="text-gray-600 flex items-center mb-5 text-sm font-medium">
                <MapPin size={16} className="mr-2 text-blue-800" /> {selectedTask.address}
              </p>

              {selectedTask.imageUrl && (
                <div className="mb-5 rounded overflow-hidden border border-gray-300 shadow-sm">
                  <div className="bg-gray-100 text-[10px] font-bold text-gray-600 uppercase tracking-wide px-3 py-1.5 border-b border-gray-200">Citizen Evidence Image</div>
                  <img src={selectedTask.imageUrl} alt="Citizen Upload" className="w-full max-h-48 object-cover" />
                </div>
              )}
              
              <div className="bg-blue-50 rounded p-4 mb-6 border border-blue-100">
                <h4 className="text-[10px] font-bold text-blue-900 uppercase tracking-wide mb-2 border-b border-blue-200 pb-1">Ticket Details</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-blue-800 block text-[10px] uppercase font-bold mb-0.5">Category</span><span className="font-semibold text-gray-900">{selectedTask.category}</span></div>
                  <div><span className="text-blue-800 block text-[10px] uppercase font-bold mb-0.5">Priority</span><span className="font-bold text-red-600">{selectedTask.priority}</span></div>`n                    <div><span className="text-blue-800 block text-[10px] uppercase font-bold mb-0.5">Impacted Citizens</span><span className="font-bold text-orange-600">{selectedTask.impactedCount} Complaints</span></div>
                  <div className="col-span-2"><span className="text-blue-800 block text-[10px] uppercase font-bold mb-0.5">SLA Deadline</span><span className="font-semibold text-gray-900">{new Date(selectedTask.slaDeadline).toLocaleString()}</span></div>
                </div>
              </div>

              {/* ALWAYS VISIBLE EDIT REMARKS SECTION */}
              <div className="mb-6">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Officer Remarks / Edit Progress</label>
                <textarea 
                  className={`w-full border rounded p-3 text-sm focus:outline-none ${selectedTask.status === 'RESOLVED' || selectedTask.status === 'WITHDRAWN' || selectedTask.status === 'ARCHIVED' ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'border-gray-300 focus:ring-2 focus:ring-blue-900 focus:border-blue-900'}`}
                  rows={2}
                  placeholder="e.g., Pothole filled with gravel, waiting for tar to dry..."
                  defaultValue={selectedTask.remarks || ""}
                  id="officer-remarks"
                  disabled={selectedTask.status === 'RESOLVED' || selectedTask.status === 'WITHDRAWN' || selectedTask.status === 'ARCHIVED'}
                ></textarea>
                
                {selectedTask.status !== 'RESOLVED' && selectedTask.status !== 'WITHDRAWN' && selectedTask.status !== 'ARCHIVED' ? (
                  <div className="mt-3">
                    <button 
                      onClick={() => handleUpdateRemarks(selectedTask._id)}
                      className="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded uppercase tracking-wide transition-colors shadow-sm"
                    >
                      Save Progress Remarks
                    </button>
                  </div>
                ) : selectedTask.status === 'WITHDRAWN' ? (
                  <div className="mt-3">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200 mb-2">
                      <X size={16} className="mr-2" /> Ticket withdrawn by citizen.
                    </div>
                    <button 
                      onClick={() => handleArchiveTask(selectedTask._id)}
                      className="w-full text-xs bg-gray-800 hover:bg-gray-900 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider transition-colors shadow-sm"
                    >
                      Acknowledge & Archive
                    </button>
                  </div>
                ) : selectedTask.status === 'ARCHIVED' ? (
                  <div className="mt-3 text-xs font-bold text-gray-600 uppercase tracking-widest flex items-center bg-gray-100 p-3 rounded-lg border border-gray-200">
                    <CheckCircle2 size={16} className="mr-2 text-gray-500" /> Acknowledged and Archived.
                  </div>
                ) : (
                  <div className="mt-3 text-xs font-bold text-green-600 uppercase tracking-widest flex items-center bg-green-50 p-3 rounded-lg border border-green-200">
                    <CheckCircle2 size={16} className="mr-2" /> This issue has been solved and locked.
                  </div>
                )}
              </div>
              {/* FINAL RESOLUTION SECTION FOR ALL ACTIVE TASKS */}
              {selectedTask.status !== 'RESOLVED' && selectedTask.status !== 'WITHDRAWN' && selectedTask.status !== 'ARCHIVED' && (
                <div className="mt-5 pt-5 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center">
                      <Camera size={15} className="mr-1.5 text-orange-600" /> Final Resolution &amp; Photographic Proof
                    </h4>
                    <span className="text-[10px] font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded border border-orange-200 uppercase">
                      Mandatory Proof
                    </span>
                  </div>
                  
                  {/* Image Upload for Resolution */}
                  <div className="mb-4">
                    <label className="block text-[10px] font-bold text-gray-700 uppercase tracking-wide mb-2">Upload After-Repair Image (Proof)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer relative bg-gray-50/50">
                      <input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={handleUploadImage}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                      />
                      {afterImage ? (
                        <div className="relative">
                          <img src={afterImage} alt="After resolution proof" className="mx-auto max-h-40 rounded object-cover border border-green-500 shadow-sm" />
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setAfterImage(null); }} 
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full z-20 shadow"
                          >
                            <X size={14}/>
                          </button>
                          <div className="text-[10px] font-bold text-green-700 mt-2 flex items-center justify-center">
                            <CheckCircle2 size={12} className="mr-1" /> Photo attached! Click below to complete.
                          </div>
                        </div>
                      ) : (
                        <>
                          <Camera className="mx-auto h-8 w-8 text-orange-600 mb-2" />
                          <span className="text-xs text-gray-800 font-bold block">Click to Capture / Upload "After Resolution" Photo</span>
                          <p className="text-[10px] text-gray-500 mt-1 font-medium">Ticket cannot be resolved without photographic proof.</p>
                        </>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleResolveTask(selectedTask._id)}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded flex items-center justify-center uppercase tracking-wide text-xs transition-colors shadow-md cursor-pointer"
                    >
                      <CheckCircle2 size={16} className="mr-2" /> Verify Proof &amp; Mark as Resolved
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showPrevious && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded w-full max-w-4xl overflow-hidden shadow-2xl relative flex flex-col max-h-[85vh] border border-gray-300"
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-blue-900">Official Records (History)</h2>
                <p className="text-sm text-gray-600 mt-1">Previous and completed assignments.</p>
              </div>
              <button 
                onClick={() => setShowPrevious(false)}
                className="p-2 bg-white border border-gray-300 text-gray-500 hover:text-gray-900 rounded transition-colors shadow-sm"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.filter(t => t.status === 'RESOLVED' || t.status === 'ARCHIVED').length === 0 ? (
                  <div className="col-span-full py-12 text-center text-gray-500 font-medium">
                    No previous assignments found in the system.
                  </div>
                ) : (
                  tasks.filter(t => t.status === 'RESOLVED' || t.status === 'ARCHIVED').map((task) => (
                    <div 
                      key={task._id} 
                      onClick={() => {
                        setShowPrevious(false);
                        setSelectedTask(task);
                      }}
                      className="bg-gray-50 rounded border border-gray-200 p-5 shadow-sm hover:border-gray-400 hover:shadow transition-all cursor-pointer relative"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border bg-white text-gray-700 border-gray-300">
                          {task.status}
                        </span>
                        <span className="text-xs font-bold text-gray-400">ID: {task._id}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">{task.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center font-medium">
                        <MapPin size={14} className="mr-1.5 text-blue-800" /> {task.address}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}










