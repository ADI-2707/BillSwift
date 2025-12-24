import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [stats, setStats] = useState({
    pending_users: 0,
    total_users: 0,
    products_count: 0,
    bills_count: 0,
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
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg overflow-y-auto mt-10">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <h1 className="text-2xl font-bold p-6 text-center">
          Admin Dashboard
        </h1>

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        <div className="p-6 grid grid-cols-4 gap-6">
          <DashboardCard title="Pending Approvals" value={stats.pending_users} />
          <DashboardCard title="Total Users" value={stats.total_users} />
          <DashboardCard title="Products Listed" value={stats.products_count} />
          <DashboardCard title="Bills Created" value={stats.bills_count} />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-green-200/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-center shadow-md">
    <h4 className="text-sm text-gray-300">{title}</h4>
    <p className="text-3xl font-bold mt-2 text-green-400">{value}</p>
  </div>
);

export default AdminDashboard;
