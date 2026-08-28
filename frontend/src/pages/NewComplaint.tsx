import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle, Camera, CheckCircle2, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Component to namically change map view when coordinates update
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

// Utility: Haversine distance in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(dp/2) * Math.sin(dp/2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function NewComplaint() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Sanitation",
    latitude: 0,
    longitude: 0,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Auto-detect GPS Location
  const detectLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData((prev) => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Unable to fetch location. Please ensure location permissions are granted.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let masterTicket: any = null;
    let newMockComplaint: any = null;
    
    try {
      let existing = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
      
      // AI Spatial Clustering Check (50m radius + Same Category)
      for (let c of existing) {
        if (c.category === formData.category && 
            c.status !== 'RESOLVED' && 
            c.status !== 'DELETED BY CITIZEN' && 
            c.location) {
          const distance = getDistanceInMeters(formData.latitude, formData.longitude, c.location[0], c.location[1]);
          if (distance <= 50) {
            masterTicket = c;
            break;
          }
        }
      }

      const newId = "CB-" + Math.floor(Math.random() * 10000);
      newMockComplaint = {
        _id: newId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        createdAt: new Date().toISOString(),
        location: [formData.latitude, formData.longitude],
        imageUrl: previewImage
      };

      if (masterTicket) {
        // AI Visual / Spatial Match found!
        // Increment Master Ticket Priority and Impact count
        masterTicket.impactedCount = (masterTicket.impactedCount || 1) + 1;
        if (masterTicket.impactedCount >= 5) masterTicket.priority = "CRITICAL";
        else if (masterTicket.impactedCount >= 2) masterTicket.priority = "HIGH";
        
        // Update existing master ticket in array
        existing = existing.map((t:any) => t._id === masterTicket._id ? masterTicket : t);
        
        // Save the citizen's complaint as "CLUSTERED" to show in their personal dashboard
        newMockComplaint.status = "CLUSTERED";
        newMockComplaint.masterTicketId = masterTicket._id;
        newMockComplaint.remarks = `Automatically clustered with Master Ticket ${masterTicket._id} via AI Vision & Spatial Matching (50m radius).`;
      } else {
        newMockComplaint.status = "OPEN";
        newMockComplaint.impactedCount = 1;
        newMockComplaint.priority = "MEDIUM";
      }

      localStorage.setItem("mockComplaints", JSON.stringify([newMockComplaint, ...existing]));
      setShowSuccess(true);
      setTimeout(() => navigate("/citizen/dashboard"), 4000);

    } catch (storageError) {
      // Handle LocalStorage Quota Exceeded (Images too large)
      console.warn("Storage quota exceeded. Retrying without image...");
      try {
        // Strip the massive base64 image out and retry
        if (masterTicket) {
          masterTicket.imageUrl = undefined;
        }
        newMockComplaint.imageUrl = undefined;
        
        let fallbackExisting = JSON.parse(localStorage.getItem("mockComplaints") || "[]");
        // Update the master ticket without image if it was clustered
        if (masterTicket) {
           fallbackExisting = fallbackExisting.map((t:any) => t._id === masterTicket._id ? masterTicket : t);
        }
        
        localStorage.setItem("mockComplaints", JSON.stringify([newMockComplaint, ...fallbackExisting]));
        setShowSuccess(true);
        setTimeout(() => navigate("/citizen/dashboard"), 4000);
      } catch (fatalError) {
        alert("Critical Error: Even text storage is full. Please clear your browser cache.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link to="/citizen/dashboard" className="text-sm font-bold text-gray-500 hover:text-[#111827] transition-colors flex items-center">
            &larr; Back to Dashboard
          </Link>
          <h2 className="mt-4 text-3xl font-bold font-serif text-[#111827] tracking-tight">Report Civic Issue</h2>
          <p className="mt-2 text-sm text-gray-500 max-w-xl">Lodge a formal grievance. Our AI routing engine will auto-verify the location and assign it to the nearest Zonal Officer.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-100 p-8 sm:p-12">
          <form onSubmit={handleSubmit} className="space-y-10">
            
            {/* Step 1: GPS Auto-Detection & Map */}
            <div>
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-[#E05344] text-white flex items-center justify-center font-bold font-serif text-lg mr-3 shadow-lg shadow-[#E05344]/30">1</span>
                <h3 className="text-xl font-bold text-[#111827]">Geo-Location Sensing</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4 ml-11">Our Autonomous Spatial Engine requires coordinates to find active duplicate complaints within a 50m radius.</p>
              
              <div className="ml-11">
                {!formData.latitude ? (
                  <button
                    type="button"
                    onClick={detectLocation}
                    disabled={isLocating}
                    className="bg-[#111827] hover:bg-gray-800 text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center"
                  >
                    <Navigation size={16} className="mr-2" />
                    {isLocating ? "Sensing Location..." : "Detect My Location"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="text-green-700 bg-green-50 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest border border-green-200 flex items-center shadow-sm">
                        <CheckCircle2 size={16} className="mr-2" />
                        Coordinates Locked: {formData.latitude.toFixed(5)}, {formData.longitude?.toFixed(5)}
                      </div>
                      <button
                        type="button"
                        onClick={detectLocation}
                        className="text-gray-500 hover:text-gray-900 text-xs font-bold uppercase tracking-widest underline"
                      >
                        Recalibrate
                      </button>
                    </div>
                    
                    <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-gray-200 shadow-inner z-0">
                      <MapContainer 
                        center={[formData.latitude, formData.longitude]} 
                        zoom={16} 
                        style={{ height: '100%', width: '100%', zIndex: 0 }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Marker position={[formData.latitude, formData.longitude]}>
                          <Popup>Incident Location</Popup>
                        </Marker>
                        <ChangeView center={[formData.latitude, formData.longitude]} />
                      </MapContainer>
                    </div>
                  </div>
                )}
                {locationError && <p className="mt-2 text-xs text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100">{locationError}</p>}
              </div>
            </div>

            <div className="border-t border-gray-100 my-8"></div>

            {/* Step 2: Visual Evidence */}
            <div>
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-[#E05344] text-white flex items-center justify-center font-bold font-serif text-lg mr-3 shadow-lg shadow-[#E05344]/30">2</span>
                <h3 className="text-xl font-bold text-[#111827]">Visual Evidence</h3>
              </div>
              <div className="ml-11">
                <label className="block w-full border-2 border-dashed border-gray-300 hover:border-[#E05344] bg-gray-50 hover:bg-[#E05344]/5 transition-colors rounded-2xl p-8 text-center cursor-pointer group">
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  {previewImage ? (
                    <div className="relative w-full max-w-sm mx-auto h-48 rounded-xl overflow-hidden shadow-md">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase tracking-widest">Change Photo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Camera size={28} className="text-gray-400 group-hover:text-[#E05344]" />
                      </div>
                      <span className="text-sm font-bold text-gray-700">Tap to upload live photo</span>
                      <span className="text-xs text-gray-500 mt-2">JPEG/PNG up to 5MB. EXIF Geotags will be extracted.</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="border-t border-gray-100 my-8"></div>

            {/* Step 3: Issue Details */}
            <div>
              <div className="flex items-center mb-4">
                <span className="w-8 h-8 rounded-full bg-[#E05344] text-white flex items-center justify-center font-bold font-serif text-lg mr-3 shadow-lg shadow-[#E05344]/30">3</span>
                <h3 className="text-xl font-bold text-[#111827]">Incident Details</h3>
              </div>
              <div className="ml-11 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Category <span className="text-[#E05344]">*</span></label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({...prev, category: e.target.value}))}
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-[#111827] focus:border-[#111827] sm:text-sm bg-gray-50 focus:bg-white font-bold text-gray-700"
                  >
                    <option>Sanitation & Garbage</option>
                    <option>Roads & Potholes</option>
                    <option>Streetlights & Electrical</option>
                    <option>Water Supply & Sewage</option>
                    <option>Encroachment</option>
                    <option>Stray Animals</option>
                    <option>Other Civic Issue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Short Title <span className="text-[#E05344]">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({...prev, title: e.target.value}))}
                    placeholder="e.g. Open manhole on main road"
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-[#111827] focus:border-[#111827] sm:text-sm bg-gray-50 focus:bg-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Detailed Description <span className="text-[#E05344]">*</span></label>
                  <textarea
                    required
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                    placeholder="Describe the exact issue and landmarks nearby..."
                    className="block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm focus:ring-[#111827] focus:border-[#111827] sm:text-sm bg-gray-50 focus:bg-white font-medium resize-none"
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-8 ml-11">
              <div className="bg-yellow-50/50 border border-yellow-200 p-4 mb-6 rounded-xl flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-yellow-700 font-medium">
                  If this issue alrea exists in our system near your location, it will be automatically clustered into the Master Ticket to prioritize resolution.
                </p>
              </div>
              <button
                type="submit"
                disabled={isSubmitting || !formData.latitude}
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-xs font-bold text-white uppercase tracking-widest ${isSubmitting || !formData.latitude ? 'bg-gray-300 cursor-not-allowed' : 'bg-[#E05344] hover:bg-[#DC2626]'} transition-transform hover:-translate-y-0.5 focus:outline-none`}
              >
                {isSubmitting ? "Processing..." : "Submit Grievance"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SUCCESS MODAL ANIMATION */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform transition-all animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Complaint Registered!</h3>
            <p className="text-gray-500 text-sm mb-6">
              Your grievance has been successfully lodged and assigned to the nearest field officer.
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-600 h-full animate-[progress_3s_ease-in-out_forwards]"></div>
            </div>
            <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-wider">Redirecting to Dashboard...</p>
          </div>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes progress {
              0% { width: 0%; }
              100% { width: 100%; }
            }
          `}} />
        </div>
      )}
    </div>
  );
}




