// src/pages/ViewBills.jsx
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
    // Per requirement: only remove from UI; keep in DB
    setData((prev) => prev.filter((b) => b.id !== billId));
  };

  const openBill = (billId) => {
    navigate("/add-bill", { state: { billId } });
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Your Bills</h1>

      {error && (
        <p className="mt-3 text-red-400 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1">
          {error}
        </p>
      )}

      {data.length === 0 && !error && (
        <p className="mt-4 text-gray-400">No bills found.</p>
      )}

      {data.map((bill) => (
        <div key={bill.id} className="bg-gray-900 p-4 mt-4 rounded">
          <p>
            <b>ID:</b> {bill.bill_number}
          </p>
          <p>
            <b>Date:</b>{" "}
            {bill.created_at
              ? new Date(bill.created_at).toLocaleDateString("en-IN")
              : "-"}
          </p>
          <p>
            <b>Total:</b> ₹{bill.total_amount}
          </p>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => openBill(bill.id)}
              className="bg-green-600 px-3 py-1 rounded"
            >
              Open
            </button>

            <button
              onClick={() => deleteBillFromUI(bill.id)}
              className="bg-red-600 px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewBills;