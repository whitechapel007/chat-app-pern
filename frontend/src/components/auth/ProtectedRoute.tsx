import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import LoadingSpinner from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

const ProtectedRoute = ({
  children,
  redirectTo = "/login",
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthStore();
  const location = useLocation();

  // Show loading spinner while checking authentication or during initialization
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Save the attempted location for redirect after login
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  // If authentication is not required but user is authenticated
  // (useful for login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    const from = (location.state as { from?: string })?.from || "/";
    return <Navigate to={from} replace />;
  }

  // Render children if all conditions are met
  return <>{children}</>;
};

export default ProtectedRoute;
