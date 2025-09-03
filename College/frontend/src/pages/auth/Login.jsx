import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 🔹 Dummy authentication (replace with backend API later)
    if (email === "admin@gmail.com" && password === "admin123") {
      localStorage.setItem("role", "ADMIN");
      localStorage.setItem("token", "dummy-admin-token");
      navigate("/admin");
    } else if (email === "staff@gmail.com" && password === "staff123") {
      localStorage.setItem("role", "STAFF");
      localStorage.setItem("token", "dummy-staff-token");
      navigate("/staff");
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-800">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-6">
          Attendance Management System
        </h2>
        {error && (
          <div className="bg-red-100 text-red-600 p-2 rounded-md mb-4 text-center">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition duration-300 font-medium"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
