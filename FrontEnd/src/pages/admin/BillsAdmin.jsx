import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";
import { Trash2, Receipt, Mail, Calendar, IndianRupee, Search } from "lucide-react";

const BillsAdmin = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [emailSearch, setEmailSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [error, setError] = useState("");

  const getAllBills = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/billing/all-bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data || [];
      setBills(data);
      setFilteredBills(data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load bills!");
    }
  };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (role !== "admin") { navigate("/unauthorized"); return; }
    getAllBills();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(emailSearch);
    }, 300);
    return () => clearTimeout(handler);
  }, [emailSearch]);

  useEffect(() => {
    const lowerCaseSearch = debouncedSearch.toLowerCase();
    const filtered = bills.filter((bill) =>
      (bill.user_email || "").toLowerCase().includes(lowerCaseSearch)
    );
    setFilteredBills(filtered);
  }, [debouncedSearch, bills]);

  const deleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to permanently delete this bill?")) return;
    try {
      await axios.delete(`${API_URL}/admin/billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills((prev) => prev.filter((b) => b.id !== billId));
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed!");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg mt-10 mx-2 md:mx-4 overflow-hidden backdrop-blur-sm">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AdminNavbar toggleSidebar={toggleSidebar} />

        <div className="p-4 md:p-10 max-w-6xl mx-auto w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-white to-gray-500 bg-clip-text">
                Order Management
              </h2>
              <p className="text-gray-400 text-xs md:text-sm mt-1">Review and manage all customer bills</p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by email..."
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-all w-full lg:w-72"
                />
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl flex items-center justify-center gap-3">
                <span className="text-emerald-500 font-mono font-bold text-lg">{filteredBills.length}</span>
                <span className="text-gray-400 text-[10px] uppercase font-black tracking-widest">Total Orders</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
              <span>⚠️</span> {error}
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            {/* Wrapper for horizontal scroll on mobile */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Order ID</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">User Info</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-500 tracking-widest text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center text-gray-500 italic text-sm">
                        {bills.length === 0 ? "No bills found in the system." : "No bills match this criteria."}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                              <Receipt className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="font-mono text-sm font-bold text-gray-200">#{bill.bill_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            <span className="truncate max-w-[200px]">{bill.user_email || "System User"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {bill.created_at ? new Date(bill.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center text-emerald-400 font-black font-mono text-base">
                            <IndianRupee className="w-3.5 h-3.5 mr-0.5 opacity-70" />
                            {parseFloat(bill.total_amount).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="p-2.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all active:scale-90 border border-transparent hover:border-red-500/20"
                            title="Delete Bill"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsAdmin;