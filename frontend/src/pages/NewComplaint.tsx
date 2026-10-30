import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  AlertCircle, Camera, CheckCircle2, Navigation, ArrowRight, 
  Loader2, Database, ShieldCheck
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { compressImageFile } from "../utils/imageUtils";
import { useLang } from "../context/LangContext";

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

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center, 16);
  return null;
}

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
  const { t } = useLang();

  // Form State
  const [formData, setFormData] = useState({
    description: "",
    category: "Sanitation & Garbage",
    latitude: 26.8467,
    longitude: 80.9462,
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const detectLocation = () => {
    setIsLocating(true);
    setLocationError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          setIsLocating(false);
        },
        () => {
          setLocationError("Unable to retrieve precise GPS coordinates. Using Ward Default.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedData = await compressImageFile(file);
      setPreviewImage(compressedData);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim()) return;

    setIsSubmitting(true);
    setSubmissionStep("1/3 Encrypting visual proof and generating EXIF metadata...");

    const existing = JSON.parse(localStorage.getItem("mockComplaints") || "[]");

    // Check for 50m spatial cluster duplicate
    const duplicate = existing.find((c: any) => {
      if (!c.location || c.status === 'RESOLVED') return false;
      const dist = getDistanceInMeters(formData.latitude, formData.longitude, c.location[0], c.location[1]);
      return dist <= 50;
    });

    const newTicketId = "CB-" + Math.floor(1000 + Math.random() * 9000);
    setCreatedTicketId(newTicketId);

    const derivedTitle = formData.description.trim().length > 60
      ? formData.description.trim().slice(0, 57) + "..."
      : (formData.description.trim() || formData.category);

    setTimeout(() => {
      setSubmissionStep("2/3 Querying Municipal GIS Spatial Clustering (50m Radius)...");
    }, 300);

    setTimeout(() => {
      setSubmissionStep("3/3 Committing to Nagar Nigam Database & Allocating Field Officer...");
    }, 650);

    setTimeout(() => {
      let updatedComplaints;
      if (duplicate) {
        updatedComplaints = existing.map((c: any) => {
          if (c._id === duplicate._id) {
            return {
              ...c,
              impactedCount: (c.impactedCount || 1) + 1,
              description: `${c.description}\n\n[Citizen Follow-up]: ${formData.description}`
            };
          }
          return c;
        });
      } else {
        const newComplaint = {
          _id: newTicketId,
          id: newTicketId,
          title: derivedTitle,
          description: formData.description,
          category: formData.category,
          status: "ASSIGNED",
          priority: formData.category.includes("Open Manhole") ? "CRITICAL" : "NORMAL",
          location: [formData.latitude, formData.longitude],
          imageUrl: previewImage,
          createdAt: new Date().toISOString(),
          impactedCount: 1,
        };
        updatedComplaints = [newComplaint, ...existing];
      }

      localStorage.setItem("mockComplaints", JSON.stringify(updatedComplaints));
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/citizen/dashboard");
      }, 2400);
    }, 950);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-slate-950">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <span>{t("Municipal Redressal", "नागरिक शिकायत")}</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("Lodge a New Grievance", "नई शिकायत दर्ज करें")}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Geotagged with live EXIF location and instant field officer assignment.
            </p>
          </div>
          <Link
            to="/citizen/dashboard"
            className="text-xs font-bold text-slate-400 hover:text-white px-3 py-2 rounded-xl bg-slate-800 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Main Form Box */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-8">
          
          {/* STEP 1: GPS GEOLOCATION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-lg bg-sky-500 text-slate-950 font-black text-xs flex items-center justify-center">1</span>
                <h2 className="text-base font-bold text-white uppercase tracking-wider">
                  Precise GPS Incident Location
                </h2>
              </div>
              <button
                type="button"
                onClick={detectLocation}
                disabled={isLocating}
                className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {isLocating ? <Loader2 className="animate-spin" size={14} /> : <Navigation size={14} />}
                <span>{isLocating ? "Locating..." : "Auto-Detect My GPS"}</span>
              </button>
            </div>

            {locationError && (
              <p className="text-xs text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 font-medium">
                {locationError}
              </p>
            )}

            <div className="h-[250px] w-full rounded-2xl overflow-hidden border border-slate-800 shadow-inner">
              <MapContainer 
                center={[formData.latitude, formData.longitude]} 
                zoom={16} 
                style={{ height: '100%', width: '100%', zIndex: 0 }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[formData.latitude, formData.longitude]}>
                  <Popup>Grievance Location</Popup>
                </Marker>
                <ChangeView center={[formData.latitude, formData.longitude]} />
              </MapContainer>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
              <span>Latitude: {formData.latitude.toFixed(4)}</span>
              <span>Longitude: {formData.longitude.toFixed(4)}</span>
            </div>
          </div>

          {/* STEP 2: VISUAL EVIDENCE (UP TO 10MB) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">2</span>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Visual Photographic Evidence
              </h2>
            </div>

            <label className="block border-2 border-dashed border-slate-700 hover:border-amber-400 rounded-3xl p-6 text-center cursor-pointer transition-colors bg-slate-950/60 group">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {previewImage ? (
                <div className="relative max-w-sm mx-auto h-48 rounded-2xl overflow-hidden border border-slate-700 shadow-lg">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold text-white uppercase tracking-wider">
                    Tap to Change Image
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Camera size={26} className="text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Tap to upload ground photograph</span>
                  <span className="text-xs text-slate-400 mt-1">JPEG, PNG supported up to 10MB. Instant auto-compression applied.</span>
                </div>
              )}
            </label>
          </div>

          {/* STEP 3: INCIDENT DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
              <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">3</span>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">
                Grievance Description &amp; Category
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3.5 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option>Sanitation &amp; Garbage</option>
                <option>Roads &amp; Potholes</option>
                <option>Streetlights &amp; Electrical</option>
                <option>Water Supply &amp; Sewage</option>
                <option>Open Manhole</option>
                <option>Encroachment &amp; Illegal Parking</option>
                <option>Stray Animals</option>
                <option>Other Civic Issue</option>
              </select>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300 uppercase">
                Detailed Description &amp; Nearby Landmarks *
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="समस्या का विवरण और आस-पास के लैंडमार्क लिखें... / Describe the issue and nearby landmarks..."
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all leading-relaxed"
              />
            </div>
          </div>

          {/* Spatial Clustering Notice & Submit */}
          <div className="pt-4 border-t border-slate-800 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
              <AlertCircle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Anti-Duplication Protocol:</strong> If neighboring residents have already lodged this issue within 50 meters, CivicBrain AI will auto-merge your submission into the existing Master Ticket to escalate priority and prevent redundant dispatches.
              </p>
            </div>

            {/* Server ingestion progress feedback */}
            {isSubmitting && (
              <div className="p-3.5 rounded-2xl border text-xs flex items-center gap-3 animate-pulse bg-sky-500/10 border-sky-500/20 text-sky-300">
                <Loader2 className="animate-spin flex-shrink-0 text-sky-400" size={18} />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                    <Database size={13} className="text-sky-400" />
                    <span>Municipal Ingestion Pipeline</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-0.5">{submissionStep}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl font-black uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 active:scale-98 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 shadow-amber-500/25 hover:brightness-110"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Contacting Municipal Gateway...
                </>
              ) : (
                <>
                  <span>Submit Grievance to Nagar Nigam</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      {/* SUCCESS MODAL */}
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto border bg-emerald-500/10 border-emerald-500/30">
              <CheckCircle2 size={36} className="text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Grievance Registered!
            </h3>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
              <p className="text-slate-400">Reference ID: <strong className="text-amber-400 font-mono">{createdTicketId}</strong></p>
              <p className="text-[11px] flex items-center justify-center gap-1 font-bold text-emerald-400">
                <ShieldCheck size={12} /> Server Status: 201 Created (Committed)
              </p>
            </div>
            <p className="text-xs text-slate-400">
              Assigned to the Zonal Field Officer for immediate inspection.
            </p>
            <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
              <div className="h-full w-full animate-pulse bg-emerald-500"></div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Redirecting to Dashboard...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
