import { ChevronDown, ChevronUp, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const faqs = [
  {
    category: "Grievance Filing",
    items: [
      { q: "Shikayat kaise darj karein? (How to file a complaint?)", a: "Portal par login karke 'File Complaint' button par click karein. Category chunein, location select karein, photo upload karein aur submit karein. Aapko ek unique Ticket ID milega." },
      { q: "Kya complaint ke saath photo zaroori hai?", a: "Photo optional hai lekin highly recommended hai. Photo upload karne se complaint ki priority badh jaati hai aur AI verification easy hoti hai." },
      { q: "Complaint submit karne ke baad kya hoga?", a: "Complaint automatically AI se process hogi. Duplicate check hoga, priority assign hogi, aur nearest available Field Officer ko assign ho jayegi. Aapko SMS/notification milega." },
      { q: "Ek din mein kitni complaints darj kar sakte hain?", a: "Registered citizen 10 complaints per day kar sakta hai. Spam complaints se Trust Score down hota hai." },
    ]
  },
  {
    category: "Ticket Tracking",
    items: [
      { q: "Apni complaint ka status kaise dekhein?", a: "'Track Grievance' page par jaiye aur apna Ticket ID enter karein (e.g., CB-8842). Live status dikhega  Assigned, In Progress, ya Resolved." },
      { q: "Ticket ID kahaan milega?", a: "Complaint submit hone par screen par show hoga aur registered mobile/email par SMS/email aayega." },
      { q: "Complaint ka koi response nahi aa raha toh kya karein?", a: "Agar SLA time guzar gaya aur koi response nahi, toh system automatically senior officer ko escalate kar deta hai. Aap 'Report False Update' button bhi use kar sakte hain." },
    ]
  },
  {
    category: "Civic Karma Points",
    items: [
      { q: "Civic Karma Points kya hote hain?", a: "Ye ek reward system hai. Genuine complaint karne par, neighborhood verification karne par, aur officer ke resolved ticket ko confirm karne par points milte hain." },
      { q: "Points ka kya use hai?", a: "Future mein points ko House Tax rebate aur Municipal Service Certificates se link kiya jayega. Filhaal leaderboard par rank dikhti hai." },
      { q: "'Neighborhood Verification' kya hai?", a: "Jab officer koi ticket resolve mark karta hai, toh aas-paas ke citizens ko verify karne ka option milta hai. 'Verified (Fixed)' dabane par +10 points milte hain." },
    ]
  },
  {
    category: "Technical Issues",
    items: [
      { q: "Login nahi ho raha hai?", a: "Demo accounts use karein: citizen@email.com (Citizen), officer@demo.com (Field Officer), dept@demo.com (Dept Head), admin@demo.com (Commissioner). Koi bhi password chalega." },
      { q: "Photo upload nahi ho rahi?", a: "Photo 5MB se kam honi chahiye. Badi photos automatically compress karke save hoti hain. Agar phir bhi issue ho toh complaint bina photo ke submit karein." },
      { q: "Portal slow lag raha hai?", a: "Browser cache clear karein (Ctrl+Shift+Del) aur page refresh karein. Chrome ya Firefox use karein best experience ke liye." },
    ]
  },
];

export default function HelpFaq() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  return (
    <div className="min-h-screen bg-gray-100">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Page Header */}
      <div className="bg-blue-900 text-white py-8 px-6 border-b-4 border-orange-500">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Help & Frequently Asked Questions</h1>
          <p className="text-blue-200 text-sm"> •‡‚  Citizen Support Center</p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 py-10 flex flex-col lg:flex-row gap-8">

        {/* FAQ Sections */}
        <div className="flex-1 space-y-8">
          {faqs.map((section) => (
            <div key={section.category} className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-900 text-white px-5 py-3 font-bold text-sm uppercase tracking-wider border-b-2 border-orange-500">
                {section.category}
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, i) => {
                  const key = `${section.category}-${i}`;
                  const open = openIndex === key;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => toggle(key)}
                        className="w-full text-left px-5 py-4 flex justify-between items-start gap-4 hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-semibold text-sm text-blue-900">{item.q}</span>
                        {open ? <ChevronUp size={18} className="text-orange-500 flex-shrink-0 mt-0.5" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />}
                      </button>
                      {open && (
                        <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed bg-blue-50 border-l-4 border-orange-400">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Contact & Quick Links */}
        <div className="w-full lg:w-72 flex-shrink-0 space-y-4">
          {/* Contact Card */}
          <div className="bg-blue-900 text-white rounded shadow-md p-5 border-t-4 border-orange-500">
            <h3 className="font-bold text-base mb-4"> Contact Support</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Helpline</p>
                  <p className="text-blue-200">1800-CIVIC (Free)</p>
                  <p className="text-blue-300 text-xs">MonSat, 9 AM  6 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-orange-400 flex-shrink-0" />
                <div>
                  <p className="font-bold">Email Support</p>
                  <p className="text-blue-200 text-xs">support@civicbrain.gov.in</p>
                  <p className="text-blue-300 text-xs">Response within 24 hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-sm text-blue-900 mb-3 uppercase tracking-wide border-b border-gray-200 pb-2">Quick Links</h3>
            <div className="space-y-2">
              {[
                { label: " File a New Complaint", to: "/citizen/new-complaint" },
                { label: " Track Complaint Status", to: "/track" },
                { label: " Login to Portal", to: "/login" },
                { label: " Register as Citizen", to: "/register" },
                { label: " Back to Home", to: "/" },
              ].map(link => (
                <Link key={link.to} to={link.to} className="block text-sm text-blue-800 hover:text-orange-600 hover:bg-orange-50 px-2 py-1.5 rounded transition-colors font-medium">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Notice */}
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 text-xs text-yellow-900">
            <strong> Important Notice:</strong><br />
            Ye portal sirf nagar palika limits ke andar ki shikayaton ke liye hai. Aapda prabandhan ke liye 112 ya NDRF se sampark karein.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 text-white mt-10 py-6 px-6 border-t-4 border-orange-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <div className="text-blue-200">
            <p className="font-bold text-white mb-1">— — | Municipal Corporation  CivicBrain</p>
            <p> 2026 A Digital India Initiative. All Rights Reserved.</p>
          </div>
          <div className="flex gap-5 text-blue-300 font-semibold">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Use</a>
            <Link to="/" className="hover:text-white">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
