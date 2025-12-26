import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import { Receipt, CreditCard, Calendar, Search, ArrowUpDown, X, Clock } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");
  
  // Filtering & Sorting States
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortType, setSortType] = useState("date"); 
  const [priceSortOrder, setPriceSortOrder] = useState("desc"); 
  const [dateSortOrder, setDateSortOrder] = useState("desc"); 

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
  }, [navigate, token, role]);

  const openBill = (billId) => {
    navigate("/add-bill", { state: { billId } });
  };

  // Logic for Searching, Filtering, Sorting, and LIMITING
  const filteredAndSortedBills = useMemo(() => {
    let result = [...bills];

    // 1. Search Filter
    if (searchQuery) {
      result = result.filter((b) =>
        b.bill_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Exact Date Filter
    if (dateFilter) {
      result = result.filter((b) => {
        const billDate = new Date(b.created_at).toISOString().split("T")[0];
        return billDate === dateFilter;
      });
    }

    // 3. Sorting Logic
    result.sort((a, b) => {
      if (sortType === "price") {
        const amountA = parseFloat(a.total_amount);
        const amountB = parseFloat(b.total_amount);
        return priceSortOrder === "asc" ? amountA - amountB : amountB - amountA;
      } else {
        const dateA = new Date(a.created_at);
        const dateB = new Date(b.created_at);
        return dateSortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }
    });

    // 4. LIMIT TO 20 RECORDS
    return result.slice(0, 20);
  }, [bills, searchQuery, dateFilter, sortType, priceSortOrder, dateSortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setSortType("date");
    setDateSortOrder("desc");
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="animate-pulse text-emerald-500 font-bold tracking-widest text-xs uppercase">
          Loading your account...
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <div className="pt-6 md:pt-12 pb-8 md:pb-12">
        <div className="max-w-6xl mx-auto px-4 md:px-10">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-emerald-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl border-4 border-white/10 ring-4 ring-emerald-500/20">
              {user.first_name[0]}{user.last_name[0]}
            </div>
            <div className="flex-1 pb-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                {user.first_name} {user.last_name}
              </h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-2">
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                  {user.team} Team
                </span>
                <span className="text-slate-500 text-sm font-medium">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-6">
          <h2 className="text-xl font-black flex items-center gap-2 uppercase tracking-tight">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Billing Activity
          </h2>
          {/* UPDATED COUNTER LOGIC */}
          <span className="text-[10px] font-black bg-white/5 text-slate-400 px-4 py-2 rounded-full border border-white/10 uppercase tracking-widest">
            Showing {filteredAndSortedBills.length} / {bills.length} Records
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="relative group">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors z-10 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Order ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="filter-select w-full pl-12"
            />
          </div>

          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-500 transition-colors z-20 pointer-events-none" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="filter-select w-full date-input-custom appearance-none cursor-pointer"
            />
          </div>

          <button
            onClick={() => {
              setSortType("price");
              setPriceSortOrder(priceSortOrder === "asc" ? "desc" : "asc");
            }}
            className={`filter-select flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 ${sortType === 'price' ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
          >
            <ArrowUpDown className={`w-4 h-4 ${sortType === 'price' ? 'text-emerald-500' : 'text-slate-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest">
              {priceSortOrder === "asc" ? "Price: Low-High" : "Price: High-Low"}
            </span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setSortType("date");
                setDateSortOrder(dateSortOrder === "asc" ? "desc" : "asc");
              }}
              className={`flex-1 filter-select flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 ${sortType === 'date' ? 'border-emerald-500/50 bg-emerald-500/5' : ''}`}
            >
              <Clock className={`w-4 h-4 ${sortType === 'date' ? 'text-emerald-500' : 'text-slate-500'}`} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                {dateSortOrder === "asc" ? "Date: Old-New" : "Date: New-Old"}
              </span>
            </button>
            {(searchQuery || dateFilter || sortType !== "date" || dateSortOrder !== "desc") && (
              <button
                onClick={clearFilters}
                className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 rounded-xl hover:bg-red-500/20 transition-all active:scale-95"
                title="Clear Filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {error && <div className="error-box mb-8">{error}</div>}

        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Order Reference</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Date Issued</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredAndSortedBills.map((b) => (
                  <tr key={b.id} onClick={() => openBill(b.id)} className="transition-all group cursor-pointer hover:bg-white/[0.02]">
                    <td className="px-8 py-6">
                      <span className="font-mono text-sm font-bold text-slate-300 group-hover:text-emerald-400 transition-colors">#{b.bill_number}</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-medium text-slate-400">
                        {new Date(b.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-emerald-400 font-mono font-black text-lg">₹{parseFloat(b.total_amount).toLocaleString("en-IN")}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAndSortedBills.length === 0 && (
            <div className="py-24 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-6">
                <CreditCard className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
                {bills.length === 0 ? "No records found in your vault." : "No bills match your current filters."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;