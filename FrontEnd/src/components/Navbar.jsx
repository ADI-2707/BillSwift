import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";

const Navbar = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userEmail = localStorage.getItem("userEmail");
  const userName = localStorage.getItem("userName");

  const isLoggedIn = () => !!token;

  const getInitials = () => {
    if (!userName || userName.includes("@")) {
      return userEmail ? userEmail.charAt(0).toUpperCase() : "U";
    }
    const parts = userName.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
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
      {/* Main Navbar Container */}
      <nav className="navbar-container">
        {/* LOGO */}
        <Link to="/" className="flex items-center">
          <img
            src="/BillSwift.svg"
            alt="BillSwift Logo"
            className="h-10 lg:h-12 xl:h-14 cursor-pointer transition-all"
          />
        </Link>

        {/* DESKTOP NAV LINKS - Now shows only on LG (1024px) and up */}
        <div className="hidden lg:flex gap-6 xl:gap-12 text-lg xl:text-xl items-center">
          <NavLink to="/" className="nav_link">
            <span className="text-green-600">H</span>ome
          </NavLink>
          <button onClick={goToAddBill} className="nav_link cursor-pointer">
            <span className="text-green-600">A</span>dd Order
          </button>
          <button onClick={goToViewBills} className="nav_link cursor-pointer">
            <span className="text-green-600">V</span>iew Orders
          </button>
        </div>

        {/* AUTH SECTION - Desktop */}
        <div className="hidden lg:flex gap-4 xl:gap-8 text-lg xl:text-xl items-center">
          {isLoggedIn() ? (
            <>
              <button onClick={handleLogout} className="nav_link-1 cursor-pointer">
                <span className="text-red-500">L</span>ogout
              </button>

              {role === "admin" && (
                <button
                  onClick={() => navigate("/admin")}
                  className="nav_link-2 cursor-pointer"
                >
                  <span className="text-amber-500">A</span>dmin
                </button>
              )}

              <button
                onClick={() => navigate("/account")}
                className="account-circle"
              >
                {getInitials()}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav_link"><span className="text-green-500">L</span>ogin</NavLink>
              <NavLink to="/signup" className="nav_link"><span className="text-green-500">S</span>ign Up</NavLink>
            </>
          )}
        </div>

        {/* MOBILE MENU ICON - Shows on everything smaller than LG (Tablet/Mobile) */}
        <button
          className="lg:hidden text-white text-3xl focus:outline-none"
          onClick={() => setOpen(true)}
        >
          <HiMenuAlt3 />
        </button>
      </nav>

      {/* MOBILE/TABLET OVERLAY MENU */}
      <div
        className={`fixed inset-0 bg-[#111]/85 backdrop-blur-xl z-50 flex flex-col items-center justify-center gap-8 text-2xl transition-all duration-300 ${
          open ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <button className="absolute top-8 right-8 text-4xl" onClick={() => setOpen(false)}>
          <HiX />
        </button>

        <NavLink to="/" className="nav_link text-3xl border-b-2 py-3! border-[#7c7c7c]" onClick={() => setOpen(false)}><span className="text-green-500">H</span>ome</NavLink>
        <button onClick={() => { setOpen(false); goToAddBill(); }} className="nav_link text-3xl border-b-2 py-3! border-[#7c7c7c]"><span className="text-green-500">A</span>dd Order</button>
        <button onClick={() => { setOpen(false); goToViewBills(); }} className="nav_link text-3xl border-b-2 py-3! border-[#7c7c7c]"><span className="text-green-500">V</span>iew Orders</button>

        {isLoggedIn() && role === "admin" && (
          <button
            onClick={() => { setOpen(false); navigate("/admin"); }}
            className="nav_line-2 text-3xl border-b-2 py-3! border-[#7c7c7c]"
          >
            <span className="text-amber-500">A</span>dmin
          </button>
        )}

        <div className="flex flex-col items-center gap-6 mt-4">
          {isLoggedIn() ? (
            <>
              <button
                onClick={() => { setOpen(false); navigate("/account"); }}
                className="w-16 h-16 flex items-center justify-center rounded-full bg-green-600 text-white font-bold text-2xl border-2 border-white"
              >
                {getInitials()}
              </button>
              <button onClick={() => { setOpen(false); handleLogout(); }} className="nav_link border-b-2 py-3! border-[#7c7c7c]"><span className="text-red-500">L</span>
                ogout
              </button>
            </>
          ) : (
            <div className="flex gap-8">
              <NavLink to="/login" className="nav_link" onClick={() => setOpen(false)}><span className="text-green-500 border-b-2 py-3! border-[#7c7c7c]">L</span>ogin</NavLink>
              <NavLink to="/signup" className="nav_link" onClick={() => setOpen(false)}><span className="text-green-500 border-b-2 py-3! border-[#7c7c7c]">S</span>ign Up</NavLink>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;