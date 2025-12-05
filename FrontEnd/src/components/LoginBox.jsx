import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { dummyUsers } from "../data/dummyData";

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

  const handleLogin = () => {
    const { email, password } = form;

    if (!email || !password) {
      setError("Please fill out all fields.");
      return;
    }

    const user = dummyUsers.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      setError("Invalid credentials or user not found.");
      return;
    }

    // Save logged user
    localStorage.setItem("loggedUser", JSON.stringify(user));

    navigate("/view-bills");
  };

  return (
    <>
      <div className="flex flex-col gap-4 items-center backdrop-blur-md bg-white/2 border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md mt-10">
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

        {/* ERROR BOX */}
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
          className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 active:scale-95 transition duration-150 mt-2 w-32 cursor-pointer"
        >
          <p className="hover:scale-95">Login</p>
        </button>
      </div>
    </>
  );
};

export default Login;
