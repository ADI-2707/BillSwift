import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const AddBill = () => {
  const { state: selectedDevices } = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [rows, setRows] = useState(
    selectedDevices?.map((item) => ({ ...item, qty: 1 })) ?? []
  );
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const subtotal = rows.reduce((acc, r) => acc + r.price * r.qty, 0);
  const total = subtotal - (subtotal * discount) / 100;

  // 🔹 Change Quantity
  const updateQty = (idx, qty) => {
    let updated = [...rows];
    updated[idx].qty = qty;
    setRows(updated);
  };

  // 🔹 Save Bill to Backend
  const saveBill = async () => {
    setError("");

    if (!token) {
      return setError("⚠️ Please login first");
    }

    try {
      const items = rows.map((r) => ({
        product_id: r.id, // must exist in DB
        qty: r.qty,
        price: r.price,
      }));

      const payload = {
        items,
        discount,
        notes,
      };

      await axios.post(`${API_URL}/bills/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert("Bill Saved Successfully!");
      navigate("/view-bills");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save bill");
    }
  };

  if (!rows.length) {
    return (
      <div className="text-white p-8">
        <p>No items selected.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 px-4 py-2 bg-green-600 rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">New Bill</h1>

      {error && (
        <p className="text-red-500 bg-red-500/10 border border-red-600/40 p-2 rounded mt-4 text-sm">
          {error}
        </p>
      )}

      {rows.map((r, i) => (
        <div key={i} className="bg-gray-900 p-4 mt-4 rounded">
          <p>{r.type}</p>
          <p>{r.model}</p>
          <p>{r.rating}</p>
          <p>₹{r.price}</p>

          <input
            type="number"
            min="1"
            value={r.qty}
            className="input mt-2"
            onChange={(e) => updateQty(i, +e.target.value)}
          />
        </div>
      ))}

      <input
        type="number"
        placeholder="Discount (%)"
        className="input mt-5"
        onChange={(e) => setDiscount(+e.target.value)}
      />

      <textarea
        placeholder="Notes"
        className="input mt-3 h-20"
        onChange={(e) => setNotes(e.target.value)}
      />

      {/* BILL SUMMARY */}
      <div className="mt-5 bg-gray-800 p-0 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 border-b border-gray-700">
          <p className="px-4 py-2 text-right">Subtotal:</p>
          <p className="px-4 py-2 font-semibold">₹{subtotal}</p>
        </div>
        <div className="grid grid-cols-2">
          <p className="px-4 py-2 text-right">Total After Discount:</p>
          <p className="px-4 py-2 font-semibold">₹{total}</p>
        </div>
      </div>

      <button
        onClick={saveBill}
        className="mt-6 bg-green-600 px-4 py-2 rounded"
      >
        Save Bill
      </button>
    </div>
  );
};

export default AddBill;
