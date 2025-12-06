import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";

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
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(userRes.data);

      // Fetch bills
      const billRes = await axios.get(`${API_URL}/billing/my-bills`, {
        headers: { Authorization: `Bearer ${token}` }
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
    <div className="min-h-screen flex flex-col items-center pt-10 text-white">
      <h1 className="text-4xl font-bold">Account</h1>

      {/* User Card */}
      <div className="mt-6 bg-white/10 p-6 rounded-xl w-[90vw] max-w-md border border-white/20">
        <p className="text-center"><strong>Email:</strong> {user.email}</p>
        <p className="text-center mt-2">
          <strong>Name:</strong> {user.first_name} {user.last_name}
        </p>
        <p className="text-center mt-2"><strong>Team:</strong> {user.team}</p>
      </div>

      <h2 className="text-2xl font-semibold mt-10">Your Bills</h2>

      {error && (
        <p className="text-red-500 mt-3">{error}</p>
      )}

      {/* Bills Table */}
      <table className="mt-4 border border-white/20 text-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Bill ID</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b) => (
            <tr key={b.bill_id}>
              <td className="px-4 py-2">{b.bill_id}</td>
              <td className="px-4 py-2">{b.created_at?.split("T")[0]}</td>
              <td className="px-4 py-2 text-green-400">₹{b.total}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {bills.length === 0 && (
        <p className="mt-4 text-gray-400">No bills found yet.</p>
      )}
    </div>
  );
};

export default Account;