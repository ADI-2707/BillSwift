// FrontEnd/src/pages/admin/BillsAdmin.jsx
import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";
import { Trash2, Receipt, Mail, Calendar, IndianRupee, Search } from "lucide-react";

const BillsAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [emailSearch, setEmailSearch] = useState("");
  // New state for debounced value
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
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }
    getAllBills();
  }, []);

  // Logic for Debouncing the search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(emailSearch);
    }, 300); // 300ms delay

    return () => {
      clearTimeout(handler); // Cleanup if user types again within 300ms
    };
  }, [emailSearch]);

  // Filter bills whenever debounced search value changes
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
    <div className="flex h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg mt-10 overflow-y-auto backdrop-blur-sm">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />

        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent">
                  Order Management
                </h1>
                <p className="text-gray-400 text-sm mt-1">Review and manage all system transactions</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Filter by user email..."
                    value={emailSearch}
                    onChange={(e) => setEmailSearch(e.target.value)}
                    className="bg-[#111] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-all w-64"
                  />
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg">
                  <span className="text-emerald-500 font-mono font-bold">{filteredBills.length}</span>
                  <span className="text-gray-400 text-xs ml-2 uppercase tracking-widest">Orders</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
                <span>⚠️</span> {error}
              </div>
            )}

            <div className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Order Details</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">User Info</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-400 tracking-wider text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredBills.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500 italic">
                        {bills.length === 0 ? "No bills found in the system." : "No bills match this user email."}
                      </td>
                    </tr>
                  ) : (
                    filteredBills.map((bill) => (
                      <tr key={bill.id} className="transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                              <Receipt className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="font-mono text-sm text-gray-200">{bill.bill_number}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail className="w-3.5 h-3.5 text-gray-500" />
                            {bill.user_email || "System User"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Calendar className="w-3.5 h-3.5" />
                            {bill.created_at ? new Date(bill.created_at).toLocaleDateString('en-IN') : "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-emerald-400 font-bold font-mono">
                            <IndianRupee className="w-3.5 h-3.5 mr-1" />
                            {parseFloat(bill.total_amount).toLocaleString('en-IN')}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-red-500">
                          <button
                            onClick={() => deleteBill(bill.id)}
                            className="p-2 hover:text-red-500 hover:bg-red-400/10 rounded-full transition-all cursor-pointer"
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