import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import { User, Receipt, CreditCard, Calendar, Search, ArrowUpDown, X } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' or 'desc'

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const fetchAccountData = async () => {
    try {
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      const billRes = await axios.get(`${API_URL}/billing/my-bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBills(billRes.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load account data");
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "user" && role !== "admin") {
      navigate("/unauthorized");
      return;
    }
    fetchAccountData();
  }, []);

  const openBill = (billId) => {
    navigate("/add-bill", { state: { billId } });
  };

  // Logic for Searching, Filtering, and Sorting
  const filteredAndSortedBills = useMemo(() => {
    let result = [...bills];

    // 1. Search Filter (by Bill ID)
    if (searchQuery) {
      result = result.filter((b) =>
        b.bill_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Date Filter
    if (dateFilter) {
      result = result.filter((b) => {
        const billDate = new Date(b.created_at).toISOString().split("T")[0];
        return billDate === dateFilter;
      });
    }

    // 3. Sorting (by Total Amount)
    result.sort((a, b) => {
      const amountA = parseFloat(a.total_amount);
      const amountB = parseFloat(b.total_amount);
      return sortOrder === "asc" ? amountA - amountB : amountB - amountA;
    });

    return result;
  }, [bills, searchQuery, dateFilter, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
  };

  if (!user) {
    return (
      <div className="text-center text-white mt-20">
        Loading your account...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-200 pb-20">
      {/* Profile Header Section */}
      <div className="bg-gradient-to-b from-emerald-900/10 to-transparent pt-16 pb-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-emerald-500 flex items-center justify-center text-3xl font-bold text-black shadow-lg shadow-emerald-500/20">
              {user.first_name[0]}
              {user.last_name[0]}
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h1>
              <p className="text-emerald-400 font-medium">{user.team} Team</p>
              <p className="text-slate-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-4">
        {/* Header and Counters */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Recent Billing Activity
          </h2>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700">
              Showing {filteredAndSortedBills.length} of {bills.length}
            </span>
          </div>
        </div>

        {/* Filters Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Search ID */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          {/* Date Filter */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full bg-[#111] border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm focus:border-emerald-500 outline-none transition-all appearance-none"
            />
          </div>

          {/* Sort & Clear */}
          <div className="flex gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex-1 bg-[#111] border border-slate-800 rounded-lg px-4 py-2 text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
            >
              <ArrowUpDown className="w-4 h-4 text-emerald-500" />
              {sortOrder === "asc" ? "Price: Low to High" : "Price: High to Low"}
            </button>
            {(searchQuery || dateFilter) && (
              <button
                onClick={clearFilters}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Table Container */}
        <div className="bg-[#111] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Order ID
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Date Issued
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-right">
                    Total Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAndSortedBills.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => openBill(b.id)}
                    className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4 font-mono text-sm text-slate-300 group-hover:text-emerald-400 transition-colors">
                      #{b.bill_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(b.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-emerald-400 font-bold">
                        ₹{parseFloat(b.total_amount).toLocaleString("en-IN")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedBills.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
                <CreditCard className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-500">
                {bills.length === 0 
                  ? "No billing history found in your account." 
                  : "No bills match your current filters."}
              </p>
              {(searchQuery || dateFilter) && (
                <button 
                  onClick={clearFilters}
                  className="mt-4 text-emerald-500 text-sm hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;