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

  const [pending, setPending] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalBills, setTotalBills] = useState(0);
  const [error, setError] = useState("");

  // Fetch Admin Stats
  const fetchStats = async () => {
    try {
      const pendingRes = await axios.get(`${API_URL}/admin/users/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(pendingRes.data.length);

      const usersRes = await axios.get(`${API_URL}/admin/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalUsers(usersRes.data.length);

      const billsRes = await axios.get(`${API_URL}/billing/admin/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTotalBills(billsRes.data.length);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard stats");
    }
  };

  useEffect(() => {
    // Auth protection
    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    fetchStats();
  }, []);

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <div className="p-6 grid grid-cols-4 gap-6">
          <DashboardCard title="Pending Approvals" value={pending} />
          <DashboardCard title="Total Users" value={totalUsers} />
          <DashboardCard title="Products Listed" value="57" />
          <DashboardCard title="Bills Created" value={totalBills} />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-center shadow-md">
    <h4 className="text-sm text-gray-300">{title}</h4>
    <p className="text-3xl font-bold mt-2 text-green-400">{value}</p>
  </div>
);

export default AdminDashboard;
