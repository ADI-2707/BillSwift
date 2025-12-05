import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { usersDB, deviceCatalog } from "../data/dummyData";

const AddBill = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [rows, setRows] = useState(state ?? []);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const subtotal = rows.reduce((acc, r) => acc + r.price * r.qty, 0);
  const total = subtotal - (subtotal * discount) / 100;

  const updateQty = (idx, qty) => {
    let list = [...rows];
    list[idx].qty = qty;
    setRows(list);
  };

  const save = () => {
    const logged = JSON.parse(localStorage.getItem("loggedUser"));
    if (!logged) return alert("Login first");

    let db = JSON.parse(localStorage.getItem("usersDB")) || usersDB;
    let index = db.findIndex((u) => u.id === logged.id);

    const bill = {
      billId: `B-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      items: rows,
      subtotal,
      discountPercent: discount,
      total,
      notes,
    };

    db[index].bills.push(bill);

    localStorage.setItem("usersDB", JSON.stringify(db));
    alert("Bill Saved!");
    navigate("/view-bills");
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

      {rows.map((r, i) => (
        <div key={i} className="bg-gray-900 p-4 mt-4 rounded">
          <p>{r.type}</p>
          <p>{r.model}</p>
          <p>{r.rating}</p>
          <p>${r.price}</p>
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

      <div className="mt-5 bg-gray-800 p-0 rounded-lg overflow-hidden">
        <div className="grid grid-cols-2 border-b border-gray-700">
          <p className="px-4 py-2 text-right">Subtotal:</p>
          <p className="px-4 py-2 font-semibold">${subtotal}</p>
        </div>

        <div className="grid grid-cols-2">
          <p className="px-4 py-2 text-right">Total After Discount:</p>
          <p className="px-4 py-2 font-semibold">${total}</p>
        </div>
      </div>

      <button onClick={save} className="mt-6 bg-green-600 px-4 py-2 rounded">
        Save Bill
      </button>
    </div>
  );
};

export default AddBill;