import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 1. ADD SIDEBAR STATE AND TOGGLE FUNCTION
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [stats, setStats] = useState({
    pending_users: 0,
    total_users: 0,
    products_count: 0,
    bills_count: 0,
    active_components: 0,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");

    axios
      .get(`${API_URL}/admin/users/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStats(res.data))
      .catch((err) =>
        setError(err.response?.data?.detail || "Failed to load dashboard stats")
      );
  }, [token, role, navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg overflow-hidden mt-10 mx-2 md:mx-4">
      {/* 2. PASS STATE PROPS TO SIDEBAR */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col w-full h-screen overflow-y-auto custom-scrollbar">
        {/* 3. PASS TOGGLE PROP TO NAVBAR */}
        <AdminNavbar toggleSidebar={toggleSidebar} />
        
        <div className="px-6 md:px-10 mt-10">
          <h2 className="custom-heading-admin">
            Admin Dashboard
          </h2>
          <p className="text-xs md:text-sm text-gray-400 mt-1">Manage everything from here</p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
          <DashboardCard title="Pending Approvals" value={stats.pending_users} />
          <DashboardCard title="Total Users" value={stats.total_users} />
          <DashboardCard title="Products Listed" value={stats.products_count} />
          <DashboardCard title="Bills Created" value={stats.bills_count} />
          <DashboardCard title="Active Components" value={stats.active_components || 0} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

const DashboardCard = ({ title, value }) => (
  <div className="bg-green-200/10 backdrop-blur-md border border-white/20 p-4 md:p-6 rounded-xl text-center shadow-md hover:border-green-500/30 transition-all flex flex-col justify-center min-w-0">
    <h4 className="text-[10px] sm:text-xs md:text-sm text-gray-300 uppercase tracking-wider wrap-break-word">
      {title}
    </h4>
    <p className="text-xl md:text-3xl font-bold mt-2 text-green-400">
      {value}
    </p>
  </div>
);