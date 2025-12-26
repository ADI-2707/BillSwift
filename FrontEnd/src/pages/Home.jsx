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
    <div className="home-wrapper">
      {/* MAIN BANNER */}
      <div className="text-center pt-10 md:pt-20 mb-8 md:mb-16 px-4">
        <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-6 tracking-tight bg-linear-to-r from-white to-gray-500 bg-clip-text leading-[1.1] text-transparent">
          Manage Bills & Orders Faster with{" "}
          <br className="hidden lg:block" />
          <span className="text-red-600">
            B<span className="text-white">ill</span>Swift
          </span>
        </h2>
        <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mt-1">
          Track and generate orders, and stay organized with a powerful yet
          simple tool designed for engineering & industrial teams.
        </p>
      </div>

      {/* GRID CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 relative">
        
        {/* Vertical Divider - Only visible on Large screens and up */}
        <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>

        {/* LEFT BOX: ORDERS & SEARCH */}
        <div className="flex justify-center items-start">
          <div className="home-card group">
            {token ? (
              <>
                <h1 className="text-xl font-black tracking-widest text-center mb-6">
                  <span className="text-green-500">O</span>RDERS
                </h1>

                {searchError && (
                  <p className="error-box">{searchError}</p>
                )}

                {/* BILL SEARCH */}
                <div className="search-input-container group">
                  <input
                    type="text"
                    placeholder="Search Bill by ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBillSearch()}
                    className="bg-transparent outline-none placeholder-gray-600 w-full py-3 text-sm focus:text-white"
                  />
                  <button onClick={handleBillSearch} className="search-btn">
                    Search
                  </button>
                </div>

                <p className="text-center text-gray-500 text-xs mt-6 leading-relaxed">
                  Use Bill ID to quickly find your bills or apply product filters below.
                </p>

                {/* FILTERS */}
                <div className="flex flex-col gap-5 mt-8 border-t border-white/5 pt-8">
                  {filterError && (
                    <p className="error-box">{filterError}</p>
                  )}

                  <div className="flex flex-col gap-2">
                    <label className="filter-label">Product Type</label>
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="filter-select"
                    >
                      <option value="" className="bg-[#1a1a1a]">Select Product</option>
                      <option value="DOL" className="bg-[#1a1a1a]">DOL Starter</option>
                      <option value="RDOL" className="bg-[#1a1a1a]">RDOL Starter</option>
                      <option value="S/D" className="bg-[#1a1a1a]">S/D Starter</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="filter-label">Rating (kW)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="filter-select"
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

                  <button onClick={handleFilterApply} className="primary-action-btn">
                    Apply Filters
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center p-4 min-h-[300px]">
                <InteractiveGrid />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT BOX: LOGIN */}
        <div className="flex justify-center items-start">
          <div className="home-card">
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
                  <Link to="/signup" className="text-green-500 font-bold underline hover:text-green-400 ml-1">
                    Sign Up
                  </Link>
                </p>

                {loginError && (
                  <p className="error-box">{loginError}</p>
                )}

                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <label className="filter-label">Email</label>
                    <input
                      name="email"
                      type="email"
                      onChange={handleLoginInput}
                      placeholder="Enter your email"
                      className="filter-select"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="filter-label">Password</label>
                    <input
                      name="password"
                      type="password"
                      onChange={handleLoginInput}
                      placeholder="Enter your password"
                      className="filter-select"
                    />
                  </div>

                  <button onClick={handleLogin} className="primary-action-btn">
                    Login to Portal
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-24">
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