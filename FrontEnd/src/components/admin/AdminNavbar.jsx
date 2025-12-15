import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear backend auth tokens
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <header className="h-14 bg-black/70 border-b border-white/10 px-6 flex items-center justify-between">
      <h3 className="text-green-400 font-semibold">Admin Panel</h3>

      <button
        onClick={handleLogout}
        className="text-red-400 px-4 py-2 rounded-lg hover:bg-red-700/90 hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-105"
      >
        <FiLogOut />
        Logout
      </button>
    </header>
  );
};

export default AdminNavbar;