import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import { User, Receipt, CreditCard, Calendar } from "lucide-react";

const Account = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch User Info + Bills (Backend)
  const fetchAccountData = async () => {
    try {
      // Fetch user profile
      const userRes = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);

      // Fetch bills
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
      <div className="bg-gradient-to-b from-emerald-900/20 to-transparent pt-16 pb-12">
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-500" />
            Recent Billing Activity
          </h2>
          <span className="text-xs bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20">
            {bills.length} Total Bills
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Improved Table Container */}
        <div className="bg-[#111] border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-800">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Bill ID
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
                {bills.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-white/[0.02] transition-colors group"
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

          {bills.length === 0 && (
            <div className="py-20 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 mb-4">
                <CreditCard className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-500">
                No billing history found in your account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
