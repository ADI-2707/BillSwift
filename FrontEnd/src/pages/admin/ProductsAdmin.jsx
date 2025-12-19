import React, { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const [products, setProducts] = useState([]);
  const [componentsMaster, setComponentsMaster] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const [form, setForm] = useState({
    starter_type: "",
    rating_kw: "",
  });

  const [bundleComponents, setBundleComponents] = useState([
    { component_id: "", quantity: 1, unit_price_override: "" },
  ]);

  const authHeaders = { Authorization: `Bearer ${token}` };

  /* ---------------- AUTH + LOAD ---------------- */

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");

    Promise.all([
      axios.get(`${API_URL}/products`, { headers: authHeaders }),
      axios.get(`${API_URL}/components`, { headers: authHeaders }),
    ]).then(([p, c]) => {
      setProducts(p.data || []);
      setComponentsMaster(c.data || []);
    });
  }, []);

  /* ---------------- FORM HANDLERS ---------------- */

  const updateComponentRow = (idx, field, value) => {
    const copy = [...bundleComponents];
    copy[idx][field] = value;
    setBundleComponents(copy);
  };

  const addRow = () =>
    setBundleComponents([
      ...bundleComponents,
      { component_id: "", quantity: 1, unit_price_override: "" },
    ]);

  const removeRow = (idx) => {
    if (bundleComponents.length === 1) return;
    setBundleComponents(bundleComponents.filter((_, i) => i !== idx));
  };

  /* ---------------- CREATE PRODUCT ---------------- */

  const createProduct = async () => {
    if (!form.starter_type || !form.rating_kw)
      return alert("Starter type & rating required");

    const payload = {
      starter_type: form.starter_type,
      rating_kw: Number(form.rating_kw),
      components: bundleComponents
        .filter((c) => c.component_id)
        .map((c) => ({
          component_id: Number(c.component_id),
          quantity: Number(c.quantity || 1),
          unit_price_override: c.unit_price_override
            ? Number(c.unit_price_override)
            : null,
        })),
    };

    if (!payload.components.length)
      return alert("Add at least one component");

    const res = await axios.post(`${API_URL}/products`, payload, {
      headers: authHeaders,
    });

    setProducts((p) => [...p, res.data]);
    setForm({ starter_type: "", rating_kw: "" });
    setBundleComponents([{ component_id: "", quantity: 1, unit_price_override: "" }]);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen bg-black/60 text-white">
      <Sidebar />
      <div className="flex-1">
        <AdminNavbar />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Product Management</h2>

          {/* ADD PRODUCT */}
          <div className="bg-white/10 p-4 rounded mb-6">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <select
                value={form.starter_type}
                onChange={(e) =>
                  setForm({ ...form, starter_type: e.target.value })
                }
                className="bg-white/20 p-2 rounded"
              >
                <option value="" className='text-black bg-white'>Starter Type</option>
                <option className="text-black bg-white">DOL</option>
                <option className="text-black bg-white">RDOL</option>
                <option className="text-black bg-white">S/D</option>
              </select>

              <input
                placeholder="Rating (kW)"
                value={form.rating_kw}
                onChange={(e) =>
                  setForm({ ...form, rating_kw: e.target.value })
                }
                className="bg-white/20 p-2 rounded"
              />
            </div>

            <h4 className="text-sm font-semibold mb-2">Components</h4>

            {bundleComponents.map((row, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <select
                  value={row.component_id}
                  onChange={(e) =>
                    updateComponentRow(idx, "component_id", e.target.value)
                  }
                  className="bg-white/20 p-2 rounded flex-1"
                >
                  <option value="" className="text-black bg-white">Select Component</option>
                  {componentsMaster.map((c) => (
                    <option key={c.id} value={c.id} className="text-black bg-white">
                      {c.name} | {c.brand_name} {c.model || ""}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min={1}
                  value={row.quantity}
                  onChange={(e) =>
                    updateComponentRow(idx, "quantity", e.target.value)
                  }
                  className="bg-white/20 p-2 rounded w-20"
                />

                <input
                  placeholder="Override Price"
                  value={row.unit_price_override}
                  onChange={(e) =>
                    updateComponentRow(idx, "unit_price_override", e.target.value)
                  }
                  className="bg-white/20 p-2 rounded w-32"
                />

                <button
                  onClick={() => removeRow(idx)}
                  className="text-red-400"
                >
                  ✕
                </button>
              </div>
            ))}

            <div className="flex items-center justify-between">
            <button onClick={addRow} className="text-green-400 border border-green-400 text-sm mt-2 p-2 rounded cursor-pointer">
              + Add Component
            </button>

            <button
              onClick={createProduct}
              className="mt-4 bg-green-600 px-4 py-2 rounded cursor-pointer"
            >
              Create Bundle
            </button>
            </div>
          </div>

          {/* PRODUCT LIST */}
          {products.map((p) => (
            <div key={p.id} className="mb-3 border border-white/10 rounded">
              <div
                className="p-3 cursor-pointer hover:bg-white/5"
                onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
              >
                {p.starter_type} — {p.rating_kw} kW — ₹{p.total_price}
              </div>

              {expandedId === p.id && (
                <div className="p-3 bg-black/40 text-sm">
                  {p.components.map((c) => (
                    <div key={c.id}>
                      {c.name} | {c.brand_name} | Qty {c.quantity} | ₹
                      {c.unit_price}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
