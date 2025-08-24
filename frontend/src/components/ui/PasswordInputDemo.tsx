import { useState } from "react";
import PasswordInput from "./PasswordInput";

const PasswordInputDemo = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError("");
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password) {
      setError("Password is required");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    alert("Passwords match! ✅");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Password Input Demo</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={handlePasswordChange}
          error={error && !confirmPassword ? error : undefined}
        />
        
        <PasswordInput
          label="Confirm Password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={error && confirmPassword ? error : undefined}
        />
        
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Submit
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">Features:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Click the eye icon to toggle password visibility</li>
          <li>• Supports all standard input props</li>
          <li>• Built-in error message display</li>
          <li>• Customizable labels and placeholders</li>
          <li>• Accessible with proper ARIA attributes</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordInputDemo;
