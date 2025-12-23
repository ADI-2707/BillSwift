import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import InteractiveGrid from "../components/InteractiveGrid";

const API_URL = "http://127.0.0.1:8000";

const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [query, setQuery] = useState("");
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [filterError, setFilterError] = useState("");

  const handleLoginInput = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError("");
  };

  const handleLogin = async () => {
    if (!loginForm.email || !loginForm.password) {
      return setLoginError("Please fill out all fields.");
    }

    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userEmail", res.data.email);

      if (res.data.role === "admin") navigate("/admin");
      else navigate("/");
    } catch (error) {
      setLoginError(error.response?.data?.detail || "Login failed");
    }
  };

  const handleBillSearch = async () => {
    setSearchError("");
    if (!token) return setSearchError("Please login first!");
    if (!query.trim()) return setSearchError("Enter a Bill ID to search.");

    const billId = query.trim();

    try {
      const res = await axios.get(`${API_URL}/billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/view-bills", { state: { billFromSearch: res.data } });
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError("No bill found with this ID for your account.");
      } else {
        setSearchError(err.response?.data?.detail || "Search failed");
      }
    }
  };

  const handleFilterApply = () => {
    setFilterError("");
    setSearchError("");
    if (!token) return setSearchError("Please login first!");

    if ((product && !rating) || (!product && rating)) {
      return setFilterError("Please select both product type and rating.");
    }
    if (!product && !rating) {
      return setFilterError("Select a product and rating to proceed.");
    }

    navigate("/add-bill", {
      state: { product, rating },
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]/40 text-white font-sans pb-20  rounded-lg mt-20">
      {/* MAIN BANNER */}
      <div className="text-center pt-20 mb-12 px-4">
        <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Manage Bills & Orders Faster with{" "}
          <span className="text-red-600">
            B<span className="text-white">ill</span>Swift
          </span>
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Track orders, generate bills, and stay organized with a powerful yet
          simple tool designed for engineering & industrial teams.
        </p>
      </div>

      {/* GRID CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 relative">
        {/* Divider for Desktop */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>

        {/* LEFT BOX: ORDERS & SEARCH */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-sm">
            {token ? (
              <>
                <h1 className="text-xl font-black tracking-widest text-center mb-6">
                  <span className="text-green-500">O</span>RDERS
                </h1>

                {searchError && (
                  <p className="mb-4 text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                    {searchError}
                  </p>
                )}

                {/* 🔍 BILL SEARCH */}
                <div className="group flex items-center w-full bg-black/40 border border-white/10 px-4 py-1 rounded-2xl focus-within:border-green-500/50 transition-all">
                  <input
                    type="text"
                    placeholder="Search Bill by ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBillSearch()}
                    className="bg-transparent outline-none placeholder-gray-600 w-full py-3 text-sm focus:text-white"
                  />
                  <button
                    onClick={handleBillSearch}
                    className="text-green-500 font-bold hover:text-green-400 text-sm ml-2 active:scale-95 transition-all"
                  >
                    Search
                  </button>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
                  Use Bill ID to quickly find your bills or apply product filters below.
                </p>

                {/* FILTERS */}
                <div className="flex flex-col gap-5 mt-8 border-t border-white/5 pt-8">
                  {filterError && (
                    <p className="text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                      {filterError}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Product Type</label>
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="" className="bg-[#1a1a1a]">Select Product</option>
                      <option value="DOL" className="bg-[#1a1a1a]">DOL Starter</option>
                      <option value="RDOL" className="bg-[#1a1a1a]">RDOL Starter</option>
                      <option value="S/D" className="bg-[#1a1a1a]">S/D Starter</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Rating (kW)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      <option value="" className="bg-[#1a1a1a]">Select Rating</option>
                      <option value="0.06" className="bg-[#1a1a1a]">0.06 kW</option>
                      <option value="0.09" className="bg-[#1a1a1a]">0.09 kW</option>
                      <option value="0.12" className="bg-[#1a1a1a]">0.12 kW</option>
                      <option value="0.18" className="bg-[#1a1a1a]">0.18 kW</option>
                      <option value="0.25" className="bg-[#1a1a1a]">0.25 kW</option>
                      <option value="0.37" className="bg-[#1a1a1a]">0.37 kW</option>
                    </select>
                  </div>

                  <button
                    onClick={handleFilterApply}
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Apply Filters
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-4">
                <InteractiveGrid />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT BOX: LOGIN */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-[#1a1a1a] border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl backdrop-blur-sm">
            {!token ? (
              <>
                <h1 className="text-xl font-black tracking-widest text-center mb-6">
                  <span className="text-green-500">L</span>OGIN
                </h1>

                <p className="text-gray-500 text-sm text-center mb-4 leading-relaxed">
                  Access your account to manage bills and order history.
                </p>

                <p className="text-center text-xs mb-6">
                  Not a user?{" "}
                  <Link
                    to="/signup"
                    className="text-green-500 font-bold underline hover:text-green-400 ml-1"
                  >
                    Sign Up
                  </Link>
                </p>

                {loginError && (
                  <p className="mb-6 text-red-500 text-xs bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 text-center">
                    {loginError}
                  </p>
                )}

                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      onChange={handleLoginInput}
                      placeholder="Enter your email"
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-all placeholder:text-gray-700"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Password</label>
                    <input
                      name="password"
                      type="password"
                      onChange={handleLoginInput}
                      placeholder="Enter your password"
                      className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-green-500 outline-none transition-all placeholder:text-gray-700"
                    />
                  </div>

                  <button
                    onClick={handleLogin}
                    className="w-full mt-6 bg-red-600 hover:bg-red-500 text-white font-black py-4 rounded-xl shadow-xl transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    Login to Portal
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 text-xs font-bold tracking-tighter animate-pulse">
                  ✨ Dashboard Animation Incoming...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;