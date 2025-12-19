import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "../api/base";
import * as XLSX from "xlsx";

const AddBill = () => {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [allBundles, setAllBundles] = useState([]);
  const [billBundles, setBillBundles] = useState([]);

  const [starterFilter, setStarterFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [billDiscountPercent, setBillDiscountPercent] = useState(0);

  const [loading, setLoading] = useState(true);

  const authHeaders = { Authorization: `Bearer ${token}` };

  /* ---------------- HELPERS ---------------- */

  const recalcBundle = (bundle) => {
    const subtotal = bundle.components.reduce(
      (sum, c) =>
        sum + Math.max(1, Number(c.quantity || 1)) * Number(c.unit_price || 0),
      0
    );

    return { ...bundle, subtotal, totalAfterDiscount: subtotal };
  };

  const billSubtotal = useMemo(
    () => billBundles.reduce((s, b) => s + b.totalAfterDiscount, 0),
    [billBundles]
  );

  const billDiscountAmount =
    Math.max(0, billSubtotal * (Number(billDiscountPercent) || 0)) / 100;

  const grandTotal = Math.max(billSubtotal - billDiscountAmount, 0);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin" && role !== "user") return navigate("/unauthorized");

    axios
      .get(`${API_URL}/products`, { headers: authHeaders })
      .then((res) => setAllBundles(res.data || []))
      .finally(() => setLoading(false));
  }, []);

  /* ---------------- ADD BUNDLE ---------------- */

  const handleAddBundle = () => {
    const prod = allBundles.find(
      (p) =>
        p.starter_type === starterFilter &&
        Number(p.rating_kw) === Number(ratingFilter)
    );

    if (!prod) return alert("Bundle not found");

    const components = prod.components.map((c) => ({
      name: c.name,
      brand_name: c.brand_name,
      model: c.model || "",
      quantity: Math.max(1, Number(c.quantity)),
      unit_price: Number(c.unit_price),
    }));

    setBillBundles((prev) => [
      ...prev,
      recalcBundle({
        localId: `${prod.id}-${Date.now()}`,
        productId: prod.id,
        starterType: prod.starter_type,
        ratingKw: prod.rating_kw,
        components,
        expanded: true,
        totalAfterDiscount: 0,
      }),
    ]);
  };

  /* ---------------- GENERATE BILL ---------------- */
  const generateExcel = (billNumber) => {
    const rows = [];
    let grandTotal = 0;

    rows.push(["BILL ID:", billNumber]);
    rows.push([]);

    billBundles.forEach((bundle) => {
      rows.push([`${bundle.starterType} ${bundle.ratingKw} kW`]);
      rows.push(["PRODUCT", "MODEL", "BRAND", "QTY", "DISCOUNT", "RATE"]);

      let bundleTotal = 0;

      bundle.components.forEach((c) => {
        const lineTotal = c.quantity * c.unit_price;
        bundleTotal += lineTotal;

        rows.push([
          c.name,
          c.model || "",
          c.brand_name,
          c.quantity,
          0,
          c.unit_price,
        ]);
      });

      rows.push(["", "", "", "", "TOTAL", bundleTotal]);
      rows.push([]);

      grandTotal += bundleTotal;
    });

    rows.push([]);
    rows.push(["DISCOUNT (%)", billDiscountPercent]);
    rows.push([
      "GRAND TOTAL",
      grandTotal - (grandTotal * billDiscountPercent) / 100,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bill");

    const wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);
    window.open(url);
  };

  /* ---------------- CREATE BILL + EXCEL ---------------- */
  const handleCreateBill = async () => {
    try {
      // 1️⃣ Save bill in DB
      const items = billBundles.map((b) => ({
        product_id: b.productId,
        quantity: 1,
        override_price: b.totalAfterDiscount,
      }));

      const res = await axios.post(
        `${API_URL}/billing`,
        {
          items,
          discount_amount: billDiscountAmount,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const billNumber = res.data.bill_number;

      // 2️⃣ Generate Excel in new tab
      generateExcel(billNumber);

      // 3️⃣ Redirect to View Bills
      navigate("/view-bills");
    } catch (err) {
      console.error(err);
      alert("Failed to generate order");
    }
  };

  /* ---------------- COMPONENT EDIT ---------------- */

  const updateQuantity = (bundleId, idx, value) => {
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;

        const components = [...b.components];
        components[idx].quantity = Math.max(1, Number(value || 1));

        return recalcBundle({ ...b, components });
      })
    );
  };

  const removeComponent = (bundleId, idx) => {
    setBillBundles((prev) =>
      prev.map((b) => {
        if (b.localId !== bundleId) return b;

        const components = b.components.filter((_, i) => i !== idx);
        return recalcBundle({ ...b, components });
      })
    );
  };

  if (loading)
    return (
      <div className="flex items-center text-center justify-center p-8 text-white">
        Loading...
      </div>
    );

  /* ================= UI ================= */

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">New Bill</h1>

      {/* ADD BUNDLE */}
      <div className="bg-gray-900 p-4 rounded mb-4 grid grid-cols-3 gap-3">
        <select
          value={starterFilter}
          onChange={(e) => {
            setStarterFilter(e.target.value);
            setRatingFilter("");
          }}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="">Starter Type</option>
          <option>DOL</option>
          <option>RDOL</option>
          <option>S/D</option>
        </select>

        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="bg-gray-800 p-2 rounded"
        >
          <option value="">Rating</option>
          {allBundles
            .filter((b) => b.starter_type === starterFilter)
            .map((b) => (
              <option key={b.id} value={b.rating_kw}>
                {b.rating_kw} kW
              </option>
            ))}
        </select>

        <button
          onClick={handleAddBundle}
          className="bg-green-600 px-4 py-2 rounded"
        >
          Add Bundle
        </button>
      </div>

      {/* BUNDLE DISPLAY */}
      {billBundles.map((b) => (
        <div key={b.localId} className="bg-gray-900 p-4 rounded mb-4">
          <div className="font-semibold mb-2">
            {b.starterType} — {b.ratingKw} kW
          </div>

          {b.components.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between bg-gray-800 p-2 rounded mb-1 text-sm"
            >
              <span>
                {c.name} | {c.brand_name} | ₹{c.unit_price}
              </span>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={c.quantity}
                  onChange={(e) =>
                    updateQuantity(b.localId, idx, e.target.value)
                  }
                  className="w-16 bg-gray-900 p-1 rounded"
                />

                <button
                  onClick={() => removeComponent(b.localId, idx)}
                  className="text-red-400"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* DISCOUNT */}
      {billBundles.length > 0 && (
        <>
          <div className="bg-gray-900 p-4 rounded mt-4 flex gap-4 items-center">
            <label>Bill Discount (%)</label>
            <input
              type="number"
              min={0}
              value={billDiscountPercent}
              onChange={(e) =>
                setBillDiscountPercent(Math.max(0, Number(e.target.value)))
              }
              className="bg-gray-800 p-2 rounded w-32"
            />
          </div>

          <div className="mt-4 bg-gray-800 p-4 rounded">
            <p>Subtotal: ₹{billSubtotal.toFixed(2)}</p>
            <p>Discount: ₹{billDiscountAmount.toFixed(2)}</p>
            <p className="font-bold">Total: ₹{grandTotal.toFixed(2)}</p>
          </div>
          <button
            onClick={handleCreateBill}
            className="mt-4 bg-green-600 px-4 py-2 rounded"
          >
            Generate Order
          </button>
        </>
      )}
    </div>
  );
};

export default AddBill;