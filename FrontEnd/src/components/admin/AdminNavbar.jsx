import { FiLogOut } from "react-icons/fi";

const AdminNavbar = () => {
  return (
    <header className="h-14 bg-black/70 border-b border-white/10 px-6 flex items-center justify-between">
      <h3 className="text-green-400 font-semibold">Admin Panel</h3>

      <button
        className="text-red-400 hover:text-red-500 transition flex items-center gap-2"
      >
        <FiLogOut />
        Logout
      </button>
    </header>
  );
};

export default AdminNavbar;
