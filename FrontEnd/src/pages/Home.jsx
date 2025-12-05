import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { deviceCatalog, usersDB } from "../data/dummyData";

const Home = () => {
  const navigate = useNavigate();

  // SEARCH + FILTERS
  const [query, setQuery] = useState("");
  const [product, setProduct] = useState("");
  const [rating, setRating] = useState("");

  // LOGIN STATE
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  // ERRORS
  const [loginError, setLoginError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [filterError, setFilterError] = useState("");

  // DEVICE RESULTS
  const [filteredDevices, setFilteredDevices] = useState(deviceCatalog);

  // ------------------ LOGIN ------------------
  const handleLoginInput = (e) => {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    setLoginError("");
  };

  const handleLogin = () => {
    const { email, password } = loginForm;

    if (!email || !password) {
      setLoginError("Please fill out all fields.");
      return;
    }

    let db = JSON.parse(localStorage.getItem("usersDB")) || usersDB;
    const user = db.find((u) => u.email === email && u.password === password);

    if (!user) {
      setLoginError("Invalid credentials or user not found.");
      return;
    }

    localStorage.setItem("loggedUser", JSON.stringify(user));
    navigate("/view-bills");
  };

  // ------------------ SEARCH / FILTER ------------------
  const handleSearch = () => {
    setSearchError("");
    setFilterError("");

    const loggedUser = localStorage.getItem("loggedUser");
    if (!loggedUser) {
      setSearchError("Please login first!");
      return;
    }

    // Must search or filter
    if (!query.trim() && !product && !rating) {
      setSearchError("Enter something to search or apply filters.");
      return;
    }

    // If filter is half filled
    if ((product && !rating) || (!product && rating)) {
      setFilterError("Please select both product type and rating.");
      return;
    }

    let results = [...deviceCatalog];

    // 🔍 SEARCH BY NAME
    if (query.trim()) {
      results = results.filter((item) =>
        item.model.toLowerCase().includes(query.toLowerCase())
      );
    }

    // 🏭 FILTER BY TYPE
    if (product) {
      results = results.filter(
        (item) => item.type.replace(/\s+/g,"").toLowerCase() === product.replace(/\s+/g,"").toLowerCase()
      );
    }

    // ⚡ FILTER BY RATING
    if (rating) {
      results = results.filter(
        (item) => item.rating.replace(/\s+/g,"").toLowerCase() === rating.replace(/\s+/g,"").toLowerCase()
      );
    }

    if (results.length === 0) {
      setSearchError("No matching devices found.");
      return;
    }

    setFilteredDevices(results);

    // Save filtered selection
    localStorage.setItem("selectedDevices", JSON.stringify(results));
    navigate("/add-bill", { state: results });
  };

  return (
    <>
      {/* HERO SECTION */}
      <div className="text-center mt-10 mb-6">
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

      <div className="w-[90vw] md:w-[75vw] mx-auto mt-20 border-white/20 pb-10 grid grid-cols-1 md:grid-cols-2 gap-10 relative">
        {/* VERTICAL LINE */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-white/10"></div>

        {/* LEFT: SEARCH / FILTER */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-white/2 backdrop-blur-xl gap-4 items-center border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md">
            <h1 className="text-lg font-bold text-white">
              <span className="text-green-600">O</span>RDERS
            </h1>

            {searchError && (
              <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
                {searchError}
              </p>
            )}

            {/* SEARCH BOX */}
            <div
              className="flex items-center w-full bg-white/10 border px-2 border-white/20 rounded-lg backdrop-blur-md focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 focus-within:bg-white"
            >
              <input
                type="text"
                placeholder="Search Devices..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSearchError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-transparent outline-none placeholder-gray-400 w-full py-2 focus:bg-white focus:text-black"
              />
              <button
                onClick={handleSearch}
                className="text-green-600 font-semibold hover:text-green-400 cursor-pointer"
              >
                Search
              </button>
            </div>

            
            <p className="text-center text-gray-300 text-sm mt-4">
              Use search or apply filters to find products
            </p>

            {/* FILTERS */}
            <div className="flex flex-col gap-4 w-full">
              {filterError && (
                <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
                  {filterError}
                </p>
              )}

              {/* PRODUCT */}
              <div className="flex flex-col w-full">
                <label className="text-white text-sm">Product Type</label>
                <select
                  value={product}
                  onChange={(e) => {
                    setProduct(e.target.value);
                    setFilterError("");
                  }}
                  className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-600 focus:bg-white focus:text-black focus:border-green-500 focus:ring-1 focus:ring-green-500
                  outline-none"
                >
                  <option value="">Select Product</option>
                  <option>Drives</option>
                  <option>Encoders</option>
                  <option>Motors</option>
                  <option>Battery</option>
                  <option>Solar</option>
                  <option>Feeders</option>
                  <option>Welder</option>
                </select>
              </div>

              {/* RATING */}
              <div className="flex flex-col w-full">
                <label className="text-sm">Rating (kW)</label>
                <select
                  value={rating}
                  onChange={(e) => {
                    setRating(e.target.value);
                    setFilterError("");
                  }}
                  className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-600 focus:text-black  focus:border-green-500 focus:ring-1 focus:ring-green-500 focus:bg-white"
                >
                  <option value="">Select Rating</option>
                  <option>0.5kW</option>
                  <option>1kW</option>
                  <option>2kW</option>
                  <option>2.5kW</option>
                  <option>3kW</option>
                </select>
              </div>

              {/* APPLY BUTTON */}
              <div className="flex justify-center items-center">
              <button
                onClick={handleSearch}
                className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 w-32 cursor-pointer mt-2 "
              >
                <p className='active:scale-95 transition-all duration-150'>Apply</p>
              </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: LOGIN */}
        <div className="flex justify-center">
          <div className="flex flex-col bg-white/2 gap-4 items-center border border-green-900/60 rounded-xl px-6 py-6 w-full max-w-md">
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
              <div
                className="flex items-center w-full bg-white/9 border border-white/20 rounded-lg transition-all duration-200
              focus-within:bg-white focus-within:border-green-500     focus-within:ring-1 focus-within:ring-green-500"
              >
                <input
                  name="email"
                  type="email"
                  onChange={handleLoginInput}
                  placeholder="Enter your email"
                  className="flex-1 py-2 px-3 bg-transparent outline-none
                text-gray-400 placeholder-gray-500 focus:text-black"
                />
              </div>
            </div>

            <div className="flex flex-col w-full gap-2">
              <label className="text-white text-sm">Password</label>
              <div
                className="flex items-center w-full bg-white/9 border border-white/20 rounded-lg transition-all duration-200
              focus-within:bg-white focus-within:border-green-500     focus-within:ring-1 focus-within:ring-green-500"
              >
                <input
                  name="password"
                  type="password"
                  onChange={handleLoginInput}
                  placeholder="Enter your password"
                  className="flex-1 py-2 px-3 bg-transparent outline-none
                text-gray-400 placeholder-gray-500 focus:text-black"
                />
              </div>
            </div>

            <button
              onClick={handleLogin}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 mt-2 w-32 cursor-pointer"
            >
              <p className='active:scale-95 transition-all duration-150'>Login</p> 
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;