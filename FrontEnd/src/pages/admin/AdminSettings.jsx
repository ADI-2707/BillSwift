import { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const AdminSettings = () => {
  const navigate = useNavigate();

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
  }, []);

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
    <div className="flex min-h-screen bg-[#0a0a0a]/80 border-2 border-white/20 rounded-lg text-white mt-10 overflow-y-auto">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 text-lg">
          <h2 className="text-2xl mb-6 font-semibold text-center">Admin Settings</h2>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-3 py-1 mb-4">
              {error}
            </p>
          )}

          {success && (
            <p className="text-green-500 text-sm bg-green-500/10 border border-green-500/40 rounded px-3 py-1 mb-4">
              {success}
            </p>
          )}

          {/* PASSWORD CHANGE UI */}
          <div className="flex flex-col gap-3 w-full max-w-sm">
            <label className="text-sm">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-300
              focus:bg-white focus:text-black focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />

            <label className="text-sm">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-gray-300
              focus:bg-white focus:text-black focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />

            <button
              onClick={handlePasswordUpdate}
              className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg 
              hover:bg-red-700 cursor-pointer mt-3 w-36"
            >
              Update Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;