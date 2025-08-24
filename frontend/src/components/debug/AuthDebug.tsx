import { useAuthStore } from "../../store/authStore";

const AuthDebug = () => {
  const { user, isAuthenticated, isLoading, isInitialized, error } =
    useAuthStore();

  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg text-xs max-w-xs">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? "✅" : "❌"}</div>
        <div>Loading: {isLoading ? "⏳" : "✅"}</div>
        <div>Initialized: {isInitialized ? "✅" : "❌"}</div>
        <div>User: {user ? user.username : "None"}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
      </div>
    </div>
  );
};

export default AuthDebug;
