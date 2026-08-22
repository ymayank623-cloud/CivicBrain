import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export default function Dashboard({ role }: { role: string }) {
  const getRoleInfo = () => {
    switch (role) {
      case "citizen": return { title: "Citizen Dashboard", color: "bg-blue-600", bg: "bg-blue-50" };
      case "officer": return { title: "Field Officer Dashboard", color: "bg-orange-600", bg: "bg-orange-50" };
      case "department": return { title: "Department Head Dashboard", color: "bg-purple-600", bg: "bg-purple-50" };
      case "admin": return { title: "Commissioner Dashboard", color: "bg-red-600", bg: "bg-red-50" };
      default: return { title: "Dashboard", color: "bg-gray-600", bg: "bg-gray-50" };
    }
  };

  const { title, color, bg } = getRoleInfo();

  return (
    <div className={`min-h-screen ${bg} p-8`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <LayoutDashboard className={`w-8 h-8 text-white p-1.5 rounded-lg ${color}`} />
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          </div>
          <Link to="/login" className="flex items-center text-gray-600 hover:text-gray-900 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
            <ArrowLeft size={16} className="mr-2" /> Logout
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <LayoutDashboard className="text-gray-400 w-8 h-8" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Welcome to your dashboard</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            This space is reserved for Phase 2 and beyond, where we will build the specific modules for this role.
          </p>
        </div>
      </div>
    </div>
  );
}
