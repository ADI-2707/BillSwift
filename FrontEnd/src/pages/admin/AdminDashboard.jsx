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
  const [productsCount, setProductsCount] = useState(0);
  const [error, setError] = useState("");

  const fetchStats = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [pendingRes, usersRes, billsRes, productsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users/pending`, { headers }),
        axios.get(`${API_URL}/admin/users/all`, { headers }),
        axios.get(`${API_URL}/admin/billing/all-bills`, { headers }),
        axios.get(`${API_URL}/products`, { headers }),
      ]);

      setPending(pendingRes.data.length || 0);
      setTotalUsers(usersRes.data.length || 0);
      setTotalBills(billsRes.data.length || 0);
      setProductsCount(productsRes.data.length || 0);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load dashboard stats");
    }
  };

  useEffect(() => {
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
    <div className="flex min-h-screen bg-black/50 text-white border-2 border-white/20 rounded-lg overflow-y-auto mt-10">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <h1 className="text-2xl font-bold p-6 text-center">Admin Dashboard</h1>
        {error && (
          <p className="text-red-500 text-sm text-center mt-4">{error}</p>
        )}

        <div className="p-6 grid grid-cols-4 gap-6">
          <DashboardCard title="Pending Approvals" value={pending} />
          <DashboardCard title="Total Users" value={totalUsers} />
          <DashboardCard title="Products Listed" value={productsCount} />
          <DashboardCard title="Bills Created" value={totalBills} />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-green-200/10 backdrop-blur-md border border-white/20 p-6 rounded-xl text-center shadow-md cursor-pointer hover:bg-green-400/20 hover:text-white transition-colors">
    <h4 className="text-sm text-gray-300">{title}</h4>
    <p className="text-3xl font-bold mt-2 text-green-400">{value}</p>
  </div>
);

export default AdminDashboard;