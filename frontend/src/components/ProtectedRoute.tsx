import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  // In a real app, this should check the actual token via context or Redux.
  // For the hackathon/demo, we'll check localStorage for user data.
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if the user's role is in the allowedRoles array
    if (!allowedRoles.includes(user.role)) {
      // Role not allowed - redirect to their default dashboard or access denied
      switch(user.role) {
        case 'FIELD_OFFICER': return <Navigate to="/officer/dashboard" replace />;
        case 'DEPT_HEAD': return <Navigate to="/department/dashboard" replace />;
        case 'COMMISSIONER': return <Navigate to="/admin/dashboard" replace />;
        default: return <Navigate to="/citizen/dashboard" replace />;
      }
    }

    // Role is allowed, render the child routes
    return <Outlet />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}
