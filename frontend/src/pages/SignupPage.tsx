import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import PasswordInput from "../components/ui/PasswordInput";
import { authAPI } from "../services/auth";
import { useAuthStore } from "../store/authStore";

interface SignupFormData {
  fullname: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
}

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { login, setError, clearError, error } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    mode: "onChange",
  });

  const signupMutation = useMutation({
    mutationFn: authAPI.signup,
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
        "Signup failed. Please try again.";
      setError(errorMessage);
    },
  });

  const onSubmit = (data: SignupFormData) => {
    clearError();

    // Check if passwords match
    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Remove confirmPassword before sending to API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...signupData } = data;
    signupMutation.mutate(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-500">
      <div className="w-full max-w-lg bg-white p-8 rounded-lg">
        <h1 className="text-3xl font-bold text-left text-gray-600 mb-3">
          Sign up
        </h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* First Name and Last Name Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                First name
              </label>
              <input
                type="text"
                placeholder="Sam"
                className="w-full px-4 py-4 bg-gray-100 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none transition-colors"
                {...register("fullname", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters long",
                  },
                  pattern: {
                    value: /^[a-zA-Z\s]+$/,
                    message: "First name must contain only letters and spaces",
                  },
                })}
              />
              {errors.fullname && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fullname.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <label className="block text-gray-600 text-sm font-medium mb-2">
                username
              </label>
              <input
                type="text"
                placeholder="samlee01"
                className="w-full px-4 py-4 bg-gray-100 rounded-lg border-0 text-gray-900 placeholder-gray-500 focus:bg-gray-200 focus:outline-none transition-colors"
                {...register("username", {
                  required: "username is required",
                  minLength: {
                    value: 3,
                    message: "username must be at least 3 characters long",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9]+$/,
                    message: "username must contain only letters and numbers",
                  },
                })}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>
          </div>

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
                message: "Password must be at least 8 characters long",
              },
              pattern: {
                value:
                  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.+#^])[A-Za-z\d@$!%*?&.+#^]{8,}$/,
                message:
                  "Password must contain uppercase, lowercase, number, and special character",
              },
            })}
          />

          {/* Confirm Password Field */}
          <PasswordInput
            label="Confirm Password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword", {
              required: "Please confirm your password",
            })}
          />

          {/* Gender Field */}
          <div>
            <label className="block text-gray-600 text-sm font-medium mb-2">
              Gender
            </label>
            <select
              className="w-full px-4 py-4 bg-gray-100 rounded-lg border-0 text-gray-900 focus:bg-gray-200 focus:outline-none transition-colors"
              {...register("gender", {
                required: "Please select your gender",
              })}
            >
              <option value="">Select your gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`w-full py-4 px-6 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors ${
              signupMutation.isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending
              ? "Creating account..."
              : "Create an account"}
          </button>

          {/* Sign In Link */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-black font-medium hover:underline"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
