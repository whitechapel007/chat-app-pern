import { AxiosError } from "axios";
import { useEffect } from "react";
import { authAPI } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export const useAuthInit = () => {
  const {
    setUser,
    setLoading,
    setError,
    setInitialized,
    logout,
    isInitialized,
  } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      if (isInitialized) return;

      setLoading(true);
      setError(null);

      try {
        // Try to get user profile to validate existing session
        const response = await authAPI.getProfile();
        const user = response.data.data;

        // If successful, user is authenticated
        setUser(user);
      } catch (error) {
        // Handle different types of errors
        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            // 401 is expected when no valid session exists - not an error
            // Just ensure user is logged out
            await logout();
          } else {
            // Other errors (network, server errors) should be logged
            console.warn("Auth initialization failed:", error.message);
            setError("Failed to check authentication status");
            await logout();
          }
        } else {
          // Non-Axios errors
          console.warn("Unexpected error during auth initialization:", error);
          await logout();
        }
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();
  }, [isInitialized, setUser, setLoading, setError, setInitialized, logout]);

  return { isInitialized };
};
