import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    employee_code: "",
    team: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSignup = async () => {
    const { firstName, lastName, employee_code, team, email, password, confirmPassword } = form;

    if (!firstName || !lastName || !employee_code || !team || !email || !password || !confirmPassword) {
      return setError("Please fill out all fields.");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      await axios.post(`${API_URL}/auth/signup`, {
        first_name: firstName,
        last_name: lastName,
        employee_code,
        team,
        email,
        password,
      });

      alert("Registration sent for approval! Check your email.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center mt-20 text-center">
        <h1 className="text-5xl font-bold">
          Sign up for your <span className="text-red-600">B</span>ill
          <span className="text-red-600">Swift</span> account
        </h1>

        <div className="flex flex-col gap-4 items-center border border-green-900/60 bg-white/2 rounded-xl px-6 py-6 w-full max-w-md mt-20">
          <h1 className="text-lg font-bold text-white">
            <span className="text-green-600 font-bold text-lg">S</span>IGN UP
          </h1>

          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-semibold underline hover:text-green-400">
              Login
            </Link>
          </p>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
              {error}
            </p>
          )}

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">First Name</label>
            <input
              name="firstName"
              type="text"
              onChange={handleChange}
              placeholder="Enter first name"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Last Name</label>
            <input
              name="lastName"
              type="text"
              onChange={handleChange}
              placeholder="Enter last name"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Employee Code</label>
            <input
              name="employee_code"
              type="text"
              onChange={handleChange}
              placeholder="Enter your employee code"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Team</label>
            <select
              name="team"
              value={form.team}
              onChange={handleChange}
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            >
              <option value="">Select your team</option>
              <option value="Sales">Sales</option>
              <option value="HR">HR</option>
              <option value="Commissioning">Commissioning</option>
            </select>
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              placeholder="Re-enter password"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:bg-white focus:text-black"
            />
          </div>

          <button
            onClick={handleSignup}
            className="primary-action-btn-1"
          >
            Sign Up
          </button>
        </div>
      </div>
    </>
  );
};

export default Signup;