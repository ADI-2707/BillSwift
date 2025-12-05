import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const AdminDashboard = () => {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 grid grid-cols-4 gap-6">
          <DashboardCard title="Pending Approvals" value="12" />
          <DashboardCard title="Total Users" value="120" />
          <DashboardCard title="Products Listed" value="57" />
          <DashboardCard title="Bills Created" value="234" />
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
