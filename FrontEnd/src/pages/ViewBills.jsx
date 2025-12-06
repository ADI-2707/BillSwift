import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../api/base";
import { useNavigate } from "react-router-dom";

const ViewBills = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch Bills from Backend
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${API_URL}/billing/my-bills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load bills");
    }
  };

  useEffect(() => {
    // If not logged in → Go login
    if (!token) {
      navigate("/login");
      return;
    }

    // If user is not approved → Block access
    if (role !== "admin" && role !== "user") {
      navigate("/unauthorized");
      return;
    }

    fetchBills();
  }, []);

  // Delete Bill
  const deleteBill = async (billId) => {
    try {
      await axios.delete(`${API_URL}/billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh UI after deletion
      setData((prev) => prev.filter((b) => b.billId !== billId));
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
    }
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Your Bills</h1>

      {error && (
        <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1">
          {error}
        </p>
      )}

      {data.length === 0 && (
        <p className="mt-4 text-gray-400">No bills found.</p>
      )}

      {data.map((bill) => (
        <div key={bill.billId} className="bg-gray-900 p-4 mt-4 rounded">
          <p>
            <b>ID:</b> {bill.billId}
          </p>
          <p>
            <b>Date:</b> {bill.createdAt}
          </p>
          <p>
            <b>Total:</b> ${bill.total}
          </p>

          <button
            onClick={() => deleteBill(bill.billId)}
            className="mt-3 bg-red-600 px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ViewBills;