import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";
import { FiLock, FiShield } from "react-icons/fi";

const AdminSettings = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }
  }, [token, role, navigate]);

  const handlePasswordUpdate = async () => {
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword) {
      return setError("Please fill both fields.");
    }

    try {
      await axios.put(
        `${API_URL}/admin/update-password`,
        { current_password: currentPassword, new_password: newPassword },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to update password");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 border-2 border-white/20 rounded-lg text-white mt-10 mx-2 md:mx-4 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AdminNavbar toggleSidebar={toggleSidebar} />

        <div className="p-6 md:p-10 w-full max-w-2xl mx-auto">
          <header className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-500 bg-clip-text">
              Admin Settings
            </h2>
            <p className='text-sm text-gray-400 mt-1 flex items-center justify-center md:justify-start gap-2'>
              <FiShield className="text-green-500" /> Security and Account Management
            </p>
          </header>

          {/* Alert Messages */}
          <div className="max-w-md mx-auto md:mx-0">
            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center gap-2 animate-shake">
                <span>⚠️</span> {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-xs flex items-center gap-2">
                <span>✅</span> {success}
              </div>
            )}

            {/* PASSWORD CHANGE UI */}
            <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-2xl backdrop-blur-md shadow-2xl">
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <FiLock /> Change Password
              </h3>
              
              <div className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Current Password</label>
                  <input
                    type="password"
                    placeholder=""
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-black text-sm focus:border-green-500 focus:bg-white focus:text-black outline-none transition-all placeholder:text-gray-700"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">New Password</label>
                  <input
                    type="password"
                    placeholder=""
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none transition-all placeholder:text-gray-700"
                  />
                </div>

                <button
                  onClick={handlePasswordUpdate}
                  className="bg-red-600 hover:bg-red-500 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl transition-all active:scale-95 shadow-xl shadow-red-900/20 mt-2"
                >
                  Update Password
                </button>
              </div>
            </div>
            
            <p className="mt-8 text-[10px] text-gray-600 text-center md:text-left italic">
              Note: Changing your password will not log you out of current active sessions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;