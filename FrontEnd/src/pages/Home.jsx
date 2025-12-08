import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import InteractiveGrid from "../components/InteractiveGrid";

const API_URL = "http://127.0.0.1:8000";

const Home = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // SEARCH + FILTERS
  const [query, setQuery] = useState("");      // 👉 now Bill ID
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState("");

  // LOGIN STATE
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

  // 🔍 SEARCH BILL BY ID (logged-in user only)
  const handleBillSearch = async () => {
    setSearchError("");

    if (!token) {
      return setSearchError("Please login first!");
    }

    if (!query.trim()) {
      return setSearchError("Enter a Bill ID to search.");
    }

    const billId = query.trim();

    try {
      const res = await axios.get(`${API_URL}/billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Navigate to View Bills and pass the found bill (you can use this in ViewBills.jsx)
      navigate("/view-bills", { state: { billFromSearch: res.data } });
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError("No bill found with this ID for your account.");
      } else {
        setSearchError(err.response?.data?.detail || "Search failed");
      }
    }
  };

  // 🎛 Existing filter → still used for Add Bill (do not break it)
  const handleFilterApply = () => {
    setFilterError("");
    setSearchError("");

    if (!token) {
      return setSearchError("Please login first!");
    }

    // Must select product + rating together
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
    <>
      {/* MAIN BANNER */}
      <div className="text-center mt-20 mb-6">
        <h2 className="text-5xl font-bold text-white">
          Manage Bills & Orders Faster with{" "}
          <span className="text-red-600">
            B<span className="text-white">ill</span>Swift
          </span>
        </h2>
        <p className="text-gray-400 mt-5 text-base max-w-2xl mx-auto">
          Track orders, generate bills, and stay organized with a powerful yet
          simple tool designed for engineering & industrial teams.
        </p>
      </div>

      {/* GRID */}
      <div className="w-[90vw] md:w-[75vw] mx-auto mt-20 border-white/20 grid grid-cols-1 md:grid-cols-2 relative">
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>

        {/* LEFT BOX */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-white/2 backdrop-blur-xl gap-4 items-center border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md">
            {token ? (
              <>
                <h1 className="text-lg font-bold text-white">
                  <span className="text-green-600">O</span>RDERS
                </h1>

                {searchError && (
                  <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
                    {searchError}
                  </p>
                )}

                {/* 🔍 BILL SEARCH BY ID */}
                <div className="flex items-center w-full bg-white/10 border px-2 border-white/20 rounded-lg backdrop-blur-md focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 focus-within:bg-white">
                  <input
                    type="text"
                    placeholder="Search Bill by ID..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBillSearch()}
                    className="bg-transparent outline-none placeholder-gray-400 w-full py-2 focus:bg-white focus:text-black"
                  />
                  <button
                    onClick={handleBillSearch}
                    className="text-green-600 font-semibold hover:text-green-400 cursor-pointer"
                  >
                    Search
                  </button>
                </div>

                <p className="text-center text-gray-300 text-sm mt-4">
                  Use Bill ID to quickly find your bills or apply product filters below.
                </p>

                {/* FILTERS (unchanged layout, options updated) */}
                <div className="flex flex-col gap-4 w-full">
                  {filterError && (
                    <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
                      {filterError}
                    </p>
                  )}

                  {/* PRODUCT TYPE */}
                  <div className="flex flex-col w-full">
                    <label className="text-white text-sm">Product Type</label>
                    <select
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-600 focus:bg-white focus:text-black focus:border-green-500 focus:ring-1 focus:ring-green-500 outline-none"
                    >
                      <option value="">Select Product</option>
                      <option value="DOL">DOL Starter</option>
                      <option value="RDOL">RDOL Starter</option>
                      <option value="S/D">S/D Starter</option>
                    </select>
                  </div>

                  {/* RATING */}
                  <div className="flex flex-col w-full">
                    <label className="text-sm">Rating (kW)</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-600 focus:text-black focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                    >
                      <option value="">Select Rating</option>
                      <option value="0.06">0.06 kW</option>
                      <option value="0.09">0.09 kW</option>
                      <option value="0.12">0.12 kW</option>
                      <option value="0.18">0.18 kW</option>
                      <option value="0.25">0.25 kW</option>
                      <option value="0.37">0.37 kW</option>
                    </select>
                  </div>

                  <div className="flex justify-center items-center">
                    <button
                      onClick={handleFilterApply}
                      className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 w-32 cursor-pointer mt-2"
                    >
                      <p className="active:scale-95 transition-all duration-150">
                        Apply
                      </p>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center m-5 p-5">
                <InteractiveGrid />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT BOX (login) – unchanged */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-white/2 gap-4 items-center border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md">
            {!token ? (
              <>
                <h1 className="text-lg font-bold text-white">
                  <span className="text-green-600">L</span>OGIN
                </h1>

                <p className="text-gray-300 text-center">
                  Access your account to manage bills and order history.
                </p>

                <p>
                  Not a user?{" "}
                  <Link
                    to="/signup"
                    className="text-green-600 underline hover:text-green-400"
                  >
                    Sign Up
                  </Link>
                </p>

                {loginError && (
                  <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center ">
                    {loginError}
                  </p>
                )}

                <div className="flex flex-col w-full gap-2 mt-4">
                  <label className="text-sm">Email</label>
                  <div className="flex items-center w-full bg-white/9 border border-white/20 rounded-lg transition-all duration-200 focus-within:bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                    <input
                      name="email"
                      type="email"
                      onChange={handleLoginInput}
                      placeholder="Enter your email"
                      className="flex-1 py-2 px-3 bg-transparent outline-none text-gray-400 placeholder-gray-500 focus:text-black"
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full gap-2">
                  <label className="text-white text-sm">Password</label>
                  <div className="flex items-center w-full bg-white/9 border border-white/20 rounded-lg transition-all duration-200 focus-within:bg-white focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                    <input
                      name="password"
                      type="password"
                      onChange={handleLoginInput}
                      placeholder="Enter your password"
                      className="flex-1 py-2 px-3 bg-transparent outline-none text-gray-400 placeholder-gray-500 focus:text-black"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 mt-2 w-32 cursor-pointer"
                >
                  <p className="active:scale-95 transition-all duration-150">
                    Login
                  </p>
                </button>
              </>
            ) : (
              <div className="text-gray-400 text-sm">✨ Animation Coming...</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;