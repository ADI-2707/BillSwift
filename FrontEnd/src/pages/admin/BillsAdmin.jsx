import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const BillsAdmin = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [bills, setBills] = useState([]);
  const [error, setError] = useState("");

  // Fetch all bills (Admin only)
  const getAllBills = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/billing/all-bills`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBills(res.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load bills!");
    }
  };

  useEffect(() => {
    // Redirect if not logged in
    if (!token) {
      navigate("/login");
      return;
    }

    // Redirect if not admin
    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    getAllBills();
  }, []);

  // Delete bill
  const deleteBill = async (billId) => {
    try {
      await axios.delete(`${API_URL}/admin/billing/${billId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBills(bills.filter((b) => b.billId !== billId));
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed!");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        {/* MAIN SECTION */}
        <div className="p-6 text-lg">
          <h1 className="text-2xl font-bold mb-4">All Bills</h1>

          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-3 py-1 mb-4">
              {error}
            </p>
          )}

          {bills.length === 0 ? (
            <p>No bills in the system yet.</p>
          ) : (
            bills.map((bill, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/20 p-4 rounded mt-3"
              >
                <p><b>Bill #:</b> {bill.bill_number}</p>
                <p><b>User Email:</b> {bill.user_email || bill.user_id}</p>
                <p><b>Date:</b> {bill.created_at?.split("T")[0]}</p>
                <p><b>Total:</b> ₹{bill.total_amount}</p>

                <button
                  onClick={() => deleteBill(bill.id)}
                  className="mt-3 bg-red-600 px-3 py-1 rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BillsAdmin;