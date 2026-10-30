export interface MockComplaint {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLUSTERED' | 'WITHDRAWN';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  location: [number, number];
  address?: string;
  imageUrl?: string | null;
  afterImageUrl?: string | null;
  aiScore?: number | null;
  aiReason?: string | null;
  remarks?: string;
  impactedCount?: number;
  createdAt: string;
  slaDeadline?: string;
  isDemo?: boolean;
}

export const DEFAULT_MOCK_COMPLAINTS: MockComplaint[] = [
  {
    _id: "DEMO-7421",
    id: "DEMO-7421",
    title: "Open manhole on Sector 4 Main Market Road",
    description: "Deep open manhole without cover near metro pillar 14. Severe hazard for two-wheelers and pedestrians at night.",
    category: "Open Manhole",
    status: "ASSIGNED",
    priority: "CRITICAL",
    location: [26.8485, 80.9475],
    address: "Ward Sector 4 • Hazratganj Central, Lucknow",
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80",
    afterImageUrl: null,
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    impactedCount: 14,
    isDemo: true
  },
  {
    _id: "DEMO-6290",
    id: "DEMO-6290",
    title: "Heavy sewage water leakage and waterlogging",
    description: "Pipeline broken behind community park. Dirty water spilling across pedestrian pathway causing foul smell.",
    category: "Water Supply & Sewage",
    status: "ASSIGNED",
    priority: "HIGH",
    location: [26.8440, 80.9440],
    address: "Ward Sector 2 • Near Gomti Nagar Ext, Lucknow",
    imageUrl: "https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?w=600&auto=format&fit=crop&q=80",
    afterImageUrl: null,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    impactedCount: 8,
    isDemo: true
  },
  {
    _id: "DEMO-4188",
    id: "DEMO-4188",
    title: "Overflowing garbage dump near primary school gate",
    description: "Solid waste municipal bin not emptied for 4 days. Strong odor and stray animals gathering on the road.",
    category: "Sanitation & Garbage",
    status: "ASSIGNED",
    priority: "MEDIUM",
    location: [26.8420, 80.9510],
    address: "Ward Sector 7 • Civil Lines, Lucknow",
    imageUrl: "https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80",
    afterImageUrl: null,
    createdAt: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    impactedCount: 22,
    isDemo: true
  },
  {
    _id: "DEMO-2910",
    id: "DEMO-2910",
    title: "Deep pothole filled and sealed on Main Avenue",
    description: "Dangerous pothole filled with cold mix bitumen and compacted with vibratory roller.",
    category: "Roads & Potholes",
    status: "RESOLVED",
    priority: "HIGH",
    location: [26.8460, 80.9490],
    address: "Ward Sector 3 • Main Avenue, Lucknow",
    imageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    afterImageUrl: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600&auto=format&fit=crop&q=80",
    aiScore: 92,
    aiReason: "High visual consistency verified. Defect surface successfully sealed and asphalt leveled.",
    remarks: "Filled with Grade-2 bitumen asphalt mix and roller leveled. Verified on-site.",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    impactedCount: 19,
    isDemo: true
  }
];

export function getStoredComplaints(): MockComplaint[] {
  try {
    const raw = localStorage.getItem("mockComplaints");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error reading mockComplaints from localStorage:", err);
  }
  localStorage.setItem("mockComplaints", JSON.stringify(DEFAULT_MOCK_COMPLAINTS));
  return DEFAULT_MOCK_COMPLAINTS;
}

export function saveStoredComplaints(complaints: MockComplaint[]): void {
  try {
    localStorage.setItem("mockComplaints", JSON.stringify(complaints));
    // Dispatch custom event for same-tab reactivity
    window.dispatchEvent(new Event("civicbrain_complaints_updated"));
  } catch (err) {
    console.error("Error saving mockComplaints to localStorage:", err);
  }
}
