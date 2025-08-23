import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AuthDebug from "./components/debug/AuthDebug";
import { useAuthInit } from "./hooks/useAuthInit";
import { queryClient } from "./lib/queryClient";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";

function AppContent() {
  // Initialize authentication on app startup
  useAuthInit();

  return (
    <div className="min-h-screen bg-base-200" data-theme="chatapp">
      <Routes>
        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <ProtectedRoute requireAuth={false}>
              <LoginPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <ProtectedRoute requireAuth={false}>
              <SignupPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Debug component for development */}
      <AuthDebug />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContent />
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
