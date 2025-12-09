import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Backend Auth
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("email");

  const isLoggedIn = () => !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const goToAddBill = () => {
    if (isLoggedIn()) navigate("/add-bill");
    else navigate("/login?redirect=/add-bill");
  };

  const goToViewBills = () => {
    if (isLoggedIn()) navigate("/view-bills");
    else navigate("/login?redirect=/view-bills");
  };

  return (
    <>
      <div className="flex justify-between items-center mx-auto my-8 p-4 rounded-full w-[80vw] backdrop-blur-lg bg-white/5">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-1">
          <img src="/BillSwift.svg" alt="BillSwift Logo" className="h-15 mt-1 pl-10 cursor-pointer" />
        </Link>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-15 text-xl items-center">
          <NavLink to="/" className="nav_link">
            <span className="text-green-600">H</span>ome
          </NavLink>

          <button onClick={goToAddBill} className="nav_link cursor-pointer">
            <span className="text-green-600">A</span>dd Bill
          </button>

          <button onClick={goToViewBills} className="nav_link cursor-pointer">
            <span className="text-green-600">V</span>iew Bills
          </button>
        </div>

        {/* AUTH SECTION */}
        <div className="hidden md:flex gap-8 text-xl px-10 items-center">
          {isLoggedIn() ? (
            <>
              <button onClick={handleLogout} className="nav_link">
                Logout
              </button>

              {/* If admin → show Admin Dashboard shortcut */}
              {role === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="nav_link text-yellow-400"
                >
                  Admin
                </button>
              )}

              {/* Account Circle */}
              <button
                onClick={() => navigate("/account")}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold cursor-pointer border border-white"
              >
                {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav_link">Login</NavLink>
              <NavLink to="/signup" className="nav_link">Sign Up</NavLink>
            </>
          )}
        </div>

        {/* MOBILE MENU ICON */}
        <button className="md:hidden text-white text-3xl" onClick={() => setOpen(true)}>
          <HiMenuAlt3 />
        </button>
      </div>

      {/* MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-lg z-30 flex flex-col items-center justify-center gap-10 text-2xl transition-all duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setOpen(false)}
      >
        <div className="flex flex-col items-center gap-8" onClick={(e) => e.stopPropagation()}>
          <button className="absolute top-6 right-6 text-4xl" onClick={() => setOpen(false)}>
            <HiX />
          </button>

          <NavLink to="/" className="nav_link text-2xl" onClick={() => setOpen(false)}>Home</NavLink>

          <button onClick={() => { setOpen(false); goToAddBill(); }} className="nav_link text-2xl">Add Bill</button>

          <button onClick={() => { setOpen(false); goToViewBills(); }} className="nav_link text-2xl">View Bills</button>

          <div className="flex gap-10 mt-6">
            {isLoggedIn() ? (
              <>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="nav_link text-red-500">
                  Logout
                </button>

                <button
                  onClick={() => { setOpen(false); navigate("/account"); }}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-green-600 text-white font-bold"
                >
                  U
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="nav_link" onClick={() => setOpen(false)}>Login</NavLink>
                <NavLink to="/signup" className="nav_link" onClick={() => setOpen(false)}>Sign Up</NavLink>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;