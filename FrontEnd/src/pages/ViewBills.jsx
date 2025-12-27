import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../api/base";
import { useNavigate } from "react-router-dom";

const ViewBills = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  // Memoize headers to prevent unnecessary re-renders
  const authHeaders = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_URL}/billing/my-bills`, {
        headers: authHeaders,
      });
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load bills");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin" && role !== "user") {
      navigate("/unauthorized");
      return;
    }

    fetchBills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, token, role]);

  const deleteBillFromUI = (billId) => {
    setData((prev) => prev.filter((b) => b.id !== billId));
  };

  const openBill = (billId) => {
    navigate("/add-bill", { state: { billId } });
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
        <p className="animate-pulse text-gray-400 font-bold tracking-widest text-xs uppercase">Loading Your History...</p>
      </div>
    </div>
  );

  return (
    <div className="home-wrapper">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl custom-heading">
            Your Orders
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-xl mx-auto">
            Manage your generated orders, view component breakdowns, or hide them from your dashboard.
          </p>
        </header>

        {error && (
          <div className="error-box flex items-center justify-center gap-3 mb-10 max-w-2xl mx-auto">
            <span className="text-lg">⚠️</span> {error}
          </div>
        )}

        {data.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 bg-[#0a0a0a]/80 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-md max-w-2xl mx-auto mt-10">
            <p className="text-gray-500 text-lg text-center mb-6">No orders found in your history.</p>
            <button 
              onClick={() => navigate("/add-bill")}
              className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-black rounded-xl transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs"
            >
              + Create your first order
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {data.map((bill) => (
              <div 
                key={bill.id} 
                className="group flex flex-col bg-[#0a0a0a]/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl hover:border-green-500/40 hover:shadow-green-900/10 transition-all duration-500 backdrop-blur-sm"
              >
                {/* Card Header */}
                <div className="bg-white/5 p-5 border-b border-white/5 flex justify-between items-center">
                  <span className="font-mono text-[10px] text-gray-500 tracking-widest uppercase group-hover:text-green-500 transition-colors">
                    ID: {bill.bill_number}
                  </span>
                  <span className="text-[10px] font-black text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 uppercase">
                    {bill.created_at
                      ? new Date(bill.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })
                      : "-"}
                  </span>
                </div>

                {/* Card Body */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                  <div className="mb-8">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">Total Amount</p>
                    <div className="flex items-baseline gap-1">
                       <span className="text-green-400 font-mono text-xl">₹</span>
                       <span className="text-4xl font-black text-white font-mono tracking-tighter">
                         {parseFloat(bill.total_amount).toLocaleString("en-IN")}
                       </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => openBill(bill.id)}
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl active:scale-95 text-xs uppercase tracking-widest cursor-pointer"
                    >
                      Open Breakdown
                    </button>

                    <button
                      onClick={() => deleteBillFromUI(bill.id)}
                      className="w-full bg-white/5 hover:bg-red-500/10 text-gray-500 hover:text-red-500 border border-white/5 hover:border-red-500/20 font-black py-3 rounded-2xl transition-all text-[10px] uppercase tracking-widest cursor-pointer"
                    >
                      Hide Order
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBills;