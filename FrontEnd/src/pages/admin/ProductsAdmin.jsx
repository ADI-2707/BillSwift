import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const ProductsAdmin = () => {
  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />
        <div className="p-6 text-lg">Product list and editing features here.</div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
