import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../components/ui/PasswordInput";
import { authAPI } from "../services/auth";
import { useAuthStore } from "../store/authStore";

interface LoginFormData {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, setError, clearError, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    mode: "onChange",
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.signin,
    onSuccess: (response) => {
      const { user } = response.data.data;
      login(user);

      // Redirect to intended destination or home
      const from = (location.state as { from?: string })?.from || "/";
      navigate(from, { replace: true });
    },
    onError: (error: AxiosError<{ error?: { message?: string } }>) => {
      const errorMessage =
        error.response?.data?.error?.message ||
        "Login failed. Please try again.";
      setError(errorMessage);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    clearError();
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-500">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-left text-gray-600 mb-3">
          Login
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="samlee@gmail.com"
              className="w-full px-4 py-4 bg-gray-100 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none transition-colors"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Please enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Field */}
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
              loginMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Signing in..." : "Sign in"}
          </button>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-black font-medium hover:underline"
              >
                Create an account
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
