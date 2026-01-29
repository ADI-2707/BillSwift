import { FiLogOut, FiMenu } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const AdminNavbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  return (
    <header className="h-14 bg-black/70 border-b border-white/10 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar} 
          className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition"
        >
          <FiMenu size={20} />
        </button>
        <h3 className="text-green-400 font-semibold">Admin Panel</h3>
      </div>

      <button
        onClick={handleLogout}
        className="text-red-400 px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-red-700/90 hover:text-white transition-all flex items-center gap-2 cursor-pointer active:scale-105 text-sm md:text-base"
      >
        <FiLogOut />
        <span className="hidden xs:inline">Logout</span>
      </button>
    </header>
  );
};

export default AdminNavbar;