import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const BillsAdmin = () => {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <div className="p-6 text-lg">Admin can see all bills here.</div>
      </div>
    </div>
  );
};

export default BillsAdmin;
