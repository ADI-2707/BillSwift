import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setError("");

    if (!form.email || !form.password) {
      return setError("⚠️ Email and password required!");
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, {
        email: form.email,
        password: form.password,
      });

      // Store token + user role in storage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role",res.data.role);
      localStorage.setItem("userEmail", res.data.email);

      const displayName = res.data.name || res.data.first_name ? `${res.data.first_name} ${res.data.last_name}` : res.data.email;
      localStorage.setItem("userName", displayName);

      // Navigate admin → admin panel, others → bill page
      if (res.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.detail || "⚠️ Login failed");
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-5 mt-20">
      <h1 className="text-5xl font-bold">
        Login to your <span className="text-red-600">B</span>ill
        <span className="text-red-600">Swift</span> account
      </h1>

      <div className="flex flex-col gap-4 items-center backdrop-blur-md bg-white/2 border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md mt-15">
        <h1 className="text-lg font-bold text-white">
          <span className="text-green-500">L</span>OGIN
        </h1>

        <p className="text-gray-300 text-sm text-center">
          Access your account to manage your bills and view your order history.
        </p>

        <p className="text-sm">
          Not a user?{" "}
          <Link
            to="/signup"
            className="text-green-500 font-semibold underline hover:text-green-400"
          >
            Sign Up
          </Link>
        </p>

        {error && (
          <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
            {error}
          </p>
        )}

        {/* EMAIL */}
        <div className="flex flex-col w-full gap-2 mt-4">
          <label className="text-white text-sm text-start">Email</label>
          <input
            name="email"
            type="email"
            placeholder="Enter your email"
            onChange={handleChange}
            className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
          />
        </div>

        {/* PASSWORD */}
        <div className="flex flex-col w-full gap-2">
          <label className="text-white text-sm text-start">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Enter your password"
            onChange={handleChange}
            className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
          />
        </div>

        {/* LOGIN BUTTON */}
        <button
          onClick={handleLogin}
          className="primary-action-btn-1"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
