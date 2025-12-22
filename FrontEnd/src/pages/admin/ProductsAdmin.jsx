import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const emptyRow = {
  id: crypto.randomUUID(),
  component_id: null,
  component_label: "",
  quantity: 1,
  unit_price_override: "",
  query: "",
  results: [],
  open: false,
  loading: false,
};

const ProductsAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const authHeaders = { Authorization: `Bearer ${token}` };

  const [products, setProducts] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ starter_type: "", rating_kw: "" });
  const [rows, setRows] = useState([{ ...emptyRow }]);

  const dropdownRefs = useRef([]);
  const debounceTimers = useRef({});

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");

    axios
      .get(`${API_URL}/products/`, { headers: authHeaders })
      .then((res) => setProducts(res.data || []))
      .catch(() => navigate("/login"));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      dropdownRefs.current.forEach((ref, idx) => {
        if (!ref || !rows[idx]?.open) return;
        if (!ref.contains(e.target)) closeDropdown(idx);
      });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [rows]);

  const updateRow = (idx, patch) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const closeDropdown = (idx) => updateRow(idx, { open: false });
  const addRow = () => setRows([...rows, { ...emptyRow, id: crypto.randomUUID() }]);
  const removeRow = (idx) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  const handleSearch = (value, idx) => {
    updateRow(idx, { query: value, component_id: null });
    if (debounceTimers.current[idx]) clearTimeout(debounceTimers.current[idx]);
    if (value.trim().length < 3) {
      updateRow(idx, { results: [], open: false, loading: false });
      return;
    }
    updateRow(idx, { loading: true });
    debounceTimers.current[idx] = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_URL}/admin/components/search?q=${value.toLowerCase()}`,
          { headers: authHeaders }
        );
        updateRow(idx, { results: res.data || [], open: true, loading: false });
      } catch {
        updateRow(idx, { results: [], open: false, loading: false });
      }
    }, 400);
  };

  const selectComponent = (component, idx) => {
    updateRow(idx, {
      component_id: component.id,
      component_label: `${component.name} | ${component.brand_name} ${component.model || ""}`,
      query: "",
      open: false,
      results: [],
    });
  };

  const createProduct = async () => {
    if (!form.starter_type || !form.rating_kw) return alert("Starter type and rating required");
    const components = rows.filter((r) => r.component_id);
    if (!components.length) return alert("Add at least one component");

    const payload = {
      starter_type: form.starter_type,
      rating_kw: Number(form.rating_kw),
      components: components.map((c) => ({
        component_id: c.component_id,
        quantity: Number(c.quantity),
        unit_price_override: c.unit_price_override ? Number(c.unit_price_override) : null,
      })),
    };

    const res = await axios.post(`${API_URL}/products/`, payload, { headers: authHeaders });
    setProducts((p) => [...p, res.data]);
    setForm({ starter_type: "", rating_kw: "" });
    setRows([{ ...emptyRow }]);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("This will permanently delete the product bundle. Proceed?")) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`, { headers: authHeaders });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      if (expandedId === productId) setExpandedId(null);
    } catch (err) {
      alert("Failed to delete product. It might be used in bills.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-black text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar />

        <div className="p-4 md:p-8 w-full max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Product Management</h2>

          {/* Creation Form */}
          <div className="bg-white/5 border border-white/10 p-4 md:p-6 rounded-xl mb-8 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 ml-1">Starter Type</label>
                <select
                  value={form.starter_type}
                  onChange={(e) => setForm({ ...form, starter_type: e.target.value })}
                  className="bg-white/10 text-white p-3 rounded-lg border border-white/10 focus:border-green-500 outline-none transition-all"
                >
                  <option value="" className="bg-gray-900">Select Type</option>
                  <option className="bg-gray-900">DOL</option>
                  <option className="bg-gray-900">RDOL</option>
                  <option className="bg-gray-900">S/D</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-400 ml-1">Rating (kW)</label>
                <input
                  type="number"
                  placeholder="e.g. 7.5"
                  value={form.rating_kw}
                  onChange={(e) => setForm({ ...form, rating_kw: e.target.value })}
                  className="bg-white/10 p-3 rounded-lg border border-white/10 focus:border-green-500 outline-none"
                />
              </div>
            </div>

            <h4 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Components</h4>

            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="relative mb-6 p-4 bg-white/5 rounded-lg border border-white/5"
                ref={(el) => (dropdownRefs.current[idx] = el)}
              >
                <div className="mb-3">
                  <input
                    value={row.component_id ? row.component_label : row.query}
                    onChange={(e) => handleSearch(e.target.value, idx)}
                    onFocus={() => {
                      if (row.component_id) {
                        updateRow(idx, { component_id: null, component_label: "", query: "", results: [], open: false });
                      }
                    }}
                    placeholder="Search component (min. 3 chars)..."
                    className={`bg-white/10 text-white p-3 rounded-lg w-full border border-white/10 focus:border-green-500 outline-none ${
                      row.component_id ? "border-green-500/50 text-green-400 font-medium" : ""
                    }`}
                    autoComplete="off"
                  />
                  {row.open && (
                    <div className="absolute z-50 bg-gray-900 border border-white/20 text-white w-full max-h-60 overflow-auto rounded-lg shadow-xl mt-1">
                      {row.loading && <div className="p-3 text-sm animate-pulse">Searching...</div>}
                      {!row.loading && row.results.length === 0 && (
                        <div className="p-3 text-sm text-gray-500">No components found</div>
                      )}
                      {row.results.map((c) => (
                        <div
                          key={c.id}
                          className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none"
                          onClick={() => selectComponent(c, idx)}
                        >
                          {c.name} <span className="text-gray-400 text-xs">| {c.brand_name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[100px]">
                    <label className="text-[10px] uppercase text-gray-500 ml-1">Qty</label>
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                      className="bg-white/10 p-2 rounded w-full border border-white/10"
                    />
                  </div>

                  <div className="flex-[2] min-w-[150px]">
                    <label className="text-[10px] uppercase text-gray-500 ml-1">Price Override (Optional)</label>
                    <input
                      placeholder="Custom Price"
                      value={row.unit_price_override}
                      onChange={(e) => updateRow(idx, { unit_price_override: e.target.value })}
                      className="bg-white/10 p-2 rounded w-full border border-white/10"
                    />
                  </div>

                  <button
                    onClick={() => removeRow(idx)}
                    className="mt-4 p-2 text-red-400 hover:bg-red-400/10 rounded-full transition-colors"
                  >
                    <span className="text-xl">✕</span>
                  </button>
                </div>
              </div>
            ))}

            <div className="flex flex-col sm:flex-row gap-4 justify-between mt-8">
              <button
                onClick={addRow}
                className="order-2 sm:order-1 text-green-400 border border-green-400/50 px-6 py-2 rounded-lg hover:bg-green-400/10 transition-all"
              >
                + Add Another Component
              </button>

              <button
                onClick={createProduct}
                className="order-1 sm:order-2 bg-green-600 hover:bg-green-500 px-8 py-2 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all"
              >
                Save Bundle
              </button>
            </div>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold px-1">Existing Bundles</h3>
            {products.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between p-4 relative">
                  <div
                    className="flex-1 cursor-pointer group"
                    onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}
                  >
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-lg font-bold text-green-400">{p.starter_type}</span>
                      <span className="text-gray-400">—</span>
                      <span className="font-medium">{p.rating_kw} kW</span>
                      <span className="ml-auto text-xl font-mono text-white">₹{p.total_price}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteProduct(p.id);
                    }}
                    className="ml-4 p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                {expandedId === p.id && (
                  <div className="p-4 bg-black/40 border-t border-white/10 space-y-2">
                    {p.components.map((c) => (
                      <div key={c.id} className="flex justify-between text-sm text-gray-300 py-1 border-b border-white/5 last:border-none">
                        <span>
                          {c.name} <span className="text-xs text-gray-500">({c.brand_name})</span>
                        </span>
                        <span className="font-mono">
                          {c.quantity} x ₹{c.unit_price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;