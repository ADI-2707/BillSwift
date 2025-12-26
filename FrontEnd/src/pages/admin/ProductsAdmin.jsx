import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiTrash2, FiChevronDown, FiPackage } from "react-icons/fi";

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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg mt-10 mx-2 md:mx-4 overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AdminNavbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <main className="p-4 md:p-10 w-full max-w-5xl mx-auto">
          <header className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold bg-linear-to-r from-white to-gray-500 bg-clip-text">Product Management</h1>
            <p className='text-xs md:text-sm text-gray-500 mt-1'>Bundle components into functional products</p>
          </header>

          {/* Creation Form */}
          <section className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-2xl mb-10 backdrop-blur-md shadow-2xl">
            <h3 className="text-sm font-black uppercase tracking-widest text-green-500 mb-6 flex items-center gap-2">
              <FiPackage /> Create New Bundle
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">Starter Type</label>
                <select
                  value={form.starter_type}
                  onChange={(e) => setForm({ ...form, starter_type: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a0a]">Select Type</option>
                  <option className="bg-[#0a0a0a]">DOL</option>
                  <option className="bg-[#0a0a0a]">RDOL</option>
                  <option className="bg-[#0a0a0a]">S/D</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-1">Rating (kW)</label>
                <input
                  type="number"
                  placeholder="e.g. 7.5"
                  value={form.rating_kw}
                  onChange={(e) => setForm({ ...form, rating_kw: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl focus:border-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 px-1">Component Rows</h4>

            <div className="space-y-4">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="relative p-4 bg-white/[0.03] rounded-2xl border border-white/5"
                  ref={(el) => (dropdownRefs.current[idx] = el)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                    {/* Search Field */}
                    <div className="lg:col-span-6 relative">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Search Component</label>
                      <input
                        value={row.component_id ? row.component_label : row.query}
                        onChange={(e) => handleSearch(e.target.value, idx)}
                        onFocus={() => row.component_id && updateRow(idx, { component_id: null, component_label: "", query: "", results: [], open: false })}
                        placeholder="Type component name..."
                        className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm outline-none focus:border-green-500 transition-all"
                        autoComplete="off"
                      />
                      
                      {row.open && (
                        <div className="absolute left-0 right-0 z-[100] bg-[#111] border border-white/20 rounded-xl shadow-2xl mt-2 max-h-52 overflow-y-auto custom-scrollbar">
                          {row.loading ? <div className="p-4 text-xs animate-pulse text-green-500">Searching inventory...</div> : 
                           row.results.length === 0 ? <div className="p-4 text-xs text-gray-500 italic">No matches found</div> :
                           row.results.map((c) => (
                            <div key={c.id} className="p-3 hover:bg-green-500/10 cursor-pointer border-b border-white/5 last:border-none text-xs" onClick={() => selectComponent(c, idx)}>
                              <span className="font-bold">{c.name}</span>
                              <span className="text-gray-500 ml-2">({c.brand_name})</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Qty Field */}
                    <div className="lg:col-span-2">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Qty</label>
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(idx, { quantity: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-center text-sm"
                      />
                    </div>

                    {/* Price Override */}
                    <div className="lg:col-span-3">
                      <label className="text-[10px] text-gray-500 block mb-1 uppercase font-bold">Price Override (Optional)</label>
                      <input
                        placeholder="₹ Default"
                        value={row.unit_price_override}
                        onChange={(e) => updateRow(idx, { unit_price_override: e.target.value })}
                        className="w-full bg-black/40 border border-white/10 p-2.5 rounded-xl text-sm"
                      />
                    </div>

                    {/* Delete Row */}
                    <div className="lg:col-span-1 flex justify-end">
                      <button 
                        onClick={() => removeRow(idx)} 
                        className="p-2.5 text-red-500 bg-red-500/5 hover:bg-red-500/10 rounded-xl border border-red-500/10 transition-all active:scale-90"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={addRow} className="flex items-center justify-center gap-2 text-green-400 border border-green-400/20 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-400/5 transition-all active:scale-95">
                <FiPlus /> Add Row
              </button>
              <button onClick={createProduct} className="sm:ml-auto bg-green-600 px-10 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-green-500 transition-all active:scale-95 shadow-lg shadow-green-900/20">
                Save Product Bundle
              </button>
            </div>
          </section>

          {/* List Section */}
          <section className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 px-1 mb-4">Existing Product Bundles</h3>
            {products.map((p) => (
              <div key={p.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden transition-all hover:border-white/20">
                <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpandedId(expandedId === p.id ? null : p.id)}>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-black rounded uppercase tracking-tighter border border-green-500/20">{p.starter_type}</span>
                      <span className="text-sm font-bold text-gray-300">{p.rating_kw} kW Rating</span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-white">₹{p.total_price}</div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className={`p-2 bg-white/5 rounded-full transition-transform duration-300 ${expandedId === p.id ? 'rotate-180 text-green-500' : ''}`}>
                        <FiChevronDown />
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteProduct(p.id); }} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <FiTrash2 />
                      </button>
                  </div>
                </div>

                {expandedId === p.id && (
                  <div className="px-5 pb-5 pt-2 border-t border-white/5 bg-black/40">
                    <p className="text-[10px] uppercase font-black text-gray-500 mb-3 tracking-widest">Bundle Contents</p>
                    <div className="space-y-2">
                      {p.components.map((c, i) => (
                        <div key={i} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-none">
                          <span className="text-gray-300 font-medium truncate pr-4">
                            {c.name} <span className="text-gray-600 font-bold ml-1">×{c.quantity}</span>
                          </span>
                          <span className="shrink-0 font-mono font-bold text-green-500/80">₹{c.unit_price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {products.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p className="text-gray-600 text-sm italic">No active bundles found.</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProductsAdmin;