import { Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const userStr = localStorage.getItem("user");
  
  if (!userStr) {
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (!allowedRoles.includes(user.role)) {
      if (user.role === 'FIELD_OFFICER') {
        return <Navigate to="/officer/dashboard" replace />;
      }
      return <Navigate to="/citizen/dashboard" replace />;
    }

    return <Outlet />;
  } catch (e) {
    return <Navigate to="/login" replace />;
  }
}
