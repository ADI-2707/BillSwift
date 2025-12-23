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
  
  // Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

    try {
        const res = await axios.post(`${API_URL}/products/`, payload, { headers: authHeaders });
        setProducts((p) => [...p, res.data]);
        setForm({ starter_type: "", rating_kw: "" });
        setRows([{ ...emptyRow }]);
        alert("Product Bundle Created!");
    } catch (err) {
        alert("Error creating product");
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Delete this bundle?")) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`, { headers: authHeaders });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert("Failed to delete.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a] text-white">
      {/* Sidebar - Hidden on mobile unless toggled */}
      <div className={`${isSidebarOpen ? 'block' : 'hidden'} md:block fixed md:relative z-50 w-64 h-full`}>
         <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Product Management</h2>

            {/* Creation Form */}
            <div className="bg-[#1a1a1a] border border-white/10 p-4 md:p-6 rounded-xl mb-8 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-400 mb-1 ml-1">Starter Type</label>
                  <select
                    value={form.starter_type}
                    onChange={(e) => setForm({ ...form, starter_type: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:ring-1 focus:ring-green-500 outline-none transition-all"
                  >
                    <option value="" className="bg-[#1a1a1a]">Select Type</option>
                    <option className="bg-[#1a1a1a]">DOL</option>
                    <option className="bg-[#1a1a1a]">RDOL</option>
                    <option className="bg-[#1a1a1a]">S/D</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-1 ml-1">Rating (kW)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7.5"
                    value={form.rating_kw}
                    onChange={(e) => setForm({ ...form, rating_kw: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 p-3 rounded-lg focus:ring-1 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <h4 className="text-md font-semibold mb-4 text-gray-300">Components</h4>

              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="relative mb-4 p-3 md:p-4 bg-white/5 rounded-lg border border-white/5"
                  ref={(el) => (dropdownRefs.current[idx] = el)}
                >
                  <div className="mb-3">
                    <input
                      value={row.component_id ? row.component_label : row.query}
                      onChange={(e) => handleSearch(e.target.value, idx)}
                      onFocus={() => row.component_id && updateRow(idx, { component_id: null, component_label: "", query: "", results: [], open: false })}
                      placeholder="Search component..."
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-lg text-sm md:text-base outline-none focus:border-green-500"
                      autoComplete="off"
                    />
                    
                    {row.open && (
                      <div className="absolute left-0 right-0 z-[60] bg-[#222] border border-white/20 rounded-lg shadow-2xl mt-1 max-h-48 overflow-y-auto">
                        {row.loading ? <div className="p-3 text-xs animate-pulse">Searching...</div> : 
                         row.results.length === 0 ? <div className="p-3 text-xs text-gray-500">No results found</div> :
                         row.results.map((c) => (
                          <div key={c.id} className="p-3 hover:bg-white/10 cursor-pointer border-b border-white/5 last:border-none text-sm" onClick={() => selectComponent(c, idx)}>
                            {c.name} | {c.brand_name} {c.model ? `| ${c.model}` : ""}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row items-end gap-3">
                    <div className="w-20 md:w-24">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-2 rounded text-center"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase">Price Override</label>
                      <input
                        placeholder="Custom Price"
                        value={row.unit_price_override}
                        onChange={(e) => updateRow(idx, { unit_price_override: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 p-2 rounded"
                      />
                    </div>
                    <button onClick={() => removeRow(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded mb-0.5">✕</button>
                  </div>
                </div>
              ))}

              <div className="flex flex-col md:flex-row gap-3 mt-6">
                <button onClick={addRow} className="w-full md:w-auto text-green-400 border border-green-400/30 px-4 py-2 rounded-lg text-sm hover:bg-green-400/5 transition-all">
                  + Add Component
                </button>
                <button onClick={createProduct} className="w-full md:ml-auto bg-green-600 px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-all">
                  Save Bundle
                </button>
              </div>
            </div>

            {/* List Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-400 px-1">Active Bundles</h3>
              {products.map((p) => (
                <div key={p.id} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-green-900/30 text-green-400 text-[10px] font-bold rounded uppercase tracking-wider">{p.starter_type}</span>
                        <span className="text-sm font-semibold">{p.rating_kw} kW</span>
                      </div>
                      <div className="text-lg font-mono font-bold">₹{p.total_price}</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs transition-transform ${expandedId === p.id ? 'rotate-180' : ''}`}>▼</span>
                        <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} className="text-gray-600 hover:text-red-500">✕</button>
                    </div>
                  </div>

                  {expandedId === p.id && (
                    <div className="px-4 pb-4 pt-2 border-t border-white/5 bg-black/20">
                      {p.components.map((c, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-400 py-1.5 border-b border-white/5 last:border-none">
                          <span className="truncate pr-4">{c.name} (x{c.quantity})</span>
                          <span className="shrink-0 font-mono">₹{c.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProductsAdmin;