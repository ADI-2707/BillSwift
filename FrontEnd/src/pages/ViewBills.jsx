import { useState, useEffect } from "react";
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

  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_URL}/billing/my-bills`, {
        headers: { Authorization: `Bearer ${token}` },
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
  }, []);

  const deleteBillFromUI = (billId) => {
    // Only remove from UI per requirement
    setData((prev) => prev.filter((b) => b.id !== billId));
  };

  const openBill = (billId) => {
    navigate("/add-bill", { state: { billId } });
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
      <div className="animate-pulse">Loading Your History...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a]/80 text-white font-sans pb-20 border-2 border-white/20 rounded-lg mt-20">
      <div className="max-w-5xl mx-auto p-6 md:p-10">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Your Bills
        </h1>

        {error && (
          <div className="mb-6 mt-10 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-3">
            <span>⚠️</span> {error}
          </div>
        )}

        {data.length === 0 && !error ? (
          <div className="text-center py-20 bg-[#1a1a1a] rounded-3xl border border-white/5 shadow-xl mt-10">
            <p className="text-gray-500 text-lg">No bills found in your history.</p>
            <button 
              onClick={() => navigate("/add-bill")}
              className="mt-4 text-green-500 hover:text-green-400 font-bold transition-all"
            >
              + Create your first bill
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.map((bill) => (
              <div 
                key={bill.id} 
                className="group bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-xl hover:border-green-500/30 transition-all duration-300"
              >
                {/* Card Header */}
                <div className="bg-white/5 p-4 border-b border-white/5 flex justify-between items-center">
                  <span className="font-mono text-xs text-gray-400 tracking-wider">
                    {bill.bill_number}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/40 px-2 py-1 rounded">
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
                <div className="p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-xs text-gray-500 uppercase mb-1">Total Amount</p>
                      <p className="text-3xl font-black text-green-400 font-mono">
                        ₹{parseFloat(bill.total_amount).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => openBill(bill.id)}
                      className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-2 rounded-xl transition-all shadow-lg active:scale-95 text-sm"
                    >
                      Open Bill
                    </button>

                    <button
                      onClick={() => deleteBillFromUI(bill.id)}
                      className="px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 hover:border-red-500/40 font-bold py-2 rounded-xl transition-all text-sm"
                      title="Hide from list"
                    >
                      Delete
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