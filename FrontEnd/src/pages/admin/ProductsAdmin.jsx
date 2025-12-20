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

  const [form, setForm] = useState({
    starter_type: "",
    rating_kw: "",
  });

  const [rows, setRows] = useState([{ ...emptyRow }]);

  const dropdownRefs = useRef([]);
  const debounceTimers = useRef({});

  /* ---------------- AUTH + LOAD PRODUCTS ---------------- */

  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");

    axios
      .get(`${API_URL}/products/`, { headers: authHeaders })
      .then((res) => setProducts(res.data || []))
      .catch(() => navigate("/login"));
  }, []);

  /* ---------------- CLICK OUTSIDE HANDLER ---------------- */

  useEffect(() => {
    const handler = (e) => {
      dropdownRefs.current.forEach((ref, idx) => {
        if (!ref) return;
        if (!rows[idx]?.open) return;
        if (!ref.contains(e.target)) {
          closeDropdown(idx);
        }
      });
    };

    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [rows]);

  /* ---------------- HELPERS ---------------- */

  const updateRow = (idx, patch) => {
    setRows((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], ...patch };
      return copy;
    });
  };

  const closeDropdown = (idx) => updateRow(idx, { open: false });

  const addRow = () =>
    setRows([...rows, { ...emptyRow, id: crypto.randomUUID() }]);

  const removeRow = (idx) => {
    if (rows.length === 1) return;
    setRows(rows.filter((_, i) => i !== idx));
  };

  /* ---------------- AUTOCOMPLETE SEARCH ---------------- */

  const handleSearch = (value, idx) => {
    // Always update the query value immediately so the input reflects typing
    updateRow(idx, {
      query: value,
      component_id: null, // reset selection when typing
    });

    // Clear any existing debounce timer
    if (debounceTimers.current[idx]) {
      clearTimeout(debounceTimers.current[idx]);
    }

    // If less than 3 characters, just clear results and close dropdown
    if (value.trim().length < 3) {
      updateRow(idx, {
        results: [],
        open: false,
        loading: false,
      });
      return;
    }

    // Otherwise, show loading and start debounce search
    updateRow(idx, { loading: true });

    debounceTimers.current[idx] = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_URL}/admin/components/search?q=${value.toLowerCase()}`,
          { headers: authHeaders }
        );

        updateRow(idx, {
          results: res.data || [],
          open: true,
          loading: false,
        });
      } catch {
        updateRow(idx, {
          results: [],
          open: false,
          loading: false,
        });
      }
    }, 400);
  };

  const selectComponent = (component, idx) => {
    updateRow(idx, {
      component_id: component.id,
      component_label: `${component.name} | ${component.brand_name} ${
        component.model || ""
      }`,
      query: "",
      open: false,
      results: [],
    });
  };

  /* ---------------- CREATE PRODUCT ---------------- */

  const createProduct = async () => {
    if (!form.starter_type || !form.rating_kw)
      return alert("Starter type and rating required");

    const components = rows.filter((r) => r.component_id);
    if (!components.length) return alert("Add at least one component");

    const payload = {
      starter_type: form.starter_type,
      rating_kw: Number(form.rating_kw),
      components: components.map((c) => ({
        component_id: c.component_id,
        quantity: Number(c.quantity),
        unit_price_override: c.unit_price_override
          ? Number(c.unit_price_override)
          : null,
      })),
    };

    const res = await axios.post(`${API_URL}/products/`, payload, {
      headers: authHeaders,
    });

    setProducts((p) => [...p, res.data]);
    setForm({ starter_type: "", rating_kw: "" });
    setRows([{ ...emptyRow }]);
  };

  /* ---------------- DELETE PRODUCT ---------------- */
  const deleteProduct = async (productId) => {
    const confirmed = window.confirm(
      "This will permanently delete the product. Do you want to delete it?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: authHeaders,
      });

      // Remove from local state
      setProducts((prev) => prev.filter((p) => p.id !== productId));

      // If it was expanded, close it
      if (expandedId === productId) {
        setExpandedId(null);
      }
    } catch (err) {
      alert("Failed to delete product. It might be used in bills.");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="flex min-h-screen bg-black/60 text-white">
      <Sidebar />
      <div className="flex-1">
        <AdminNavbar />

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Product Management</h2>

          <div className="bg-white/10 p-4 rounded mb-6">
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                value={form.starter_type}
                onChange={(e) =>
                  setForm({ ...form, starter_type: e.target.value })
                }
                className="bg-white/20 text-white p-2 rounded"
              >
                <option value="" className="bg-white text-black">
                  Starter Type
                </option>
                <option className="bg-white text-black">DOL</option>
                <option className="bg-white text-black">RDOL</option>
                <option className="bg-white text-black">S/D</option>
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

            {rows.map((row, idx) => (
              <div
                key={row.id}
                className="relative mb-4"
                ref={(el) => (dropdownRefs.current[idx] = el)}
              >
                <input
                  value={row.component_id ? row.component_label : row.query}
                  onChange={(e) => handleSearch(e.target.value, idx)}
                  onFocus={() => {
                    if (row.component_id) {
                      updateRow(idx, {
                        component_id: null,
                        component_label: "",
                        query: "",
                        results: [],
                        open: false,
                      });
                    }
                  }}
                  placeholder="Type at least 3 characters..."
                  className={`bg-white/20 text-white p-2 rounded w-full ${
                    row.component_id ? "bg-green-900/40 italic" : ""
                  }`}
                  autoComplete="off"
                />

                {row.open && (
                  <div className="absolute z-50 bg-white text-black w-full max-h-60 overflow-auto rounded shadow mt-1">
                    {row.loading && (
                      <div className="p-2 text-sm">Searching...</div>
                    )}
                    {!row.loading && row.results.length === 0 && (
                      <div className="p-2 text-sm text-gray-500">
                        No results
                      </div>
                    )}
                    {row.results.map((c) => (
                      <div
                        key={c.id}
                        className="p-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => selectComponent(c, idx)}
                      >
                        {c.name} | {c.brand_name} {c.model || ""}
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    min={1}
                    value={row.quantity}
                    onChange={(e) =>
                      updateRow(idx, { quantity: e.target.value })
                    }
                    className="bg-white/20 p-2 rounded w-20"
                  />

                  <input
                    placeholder="Override Price"
                    value={row.unit_price_override}
                    onChange={(e) =>
                      updateRow(idx, {
                        unit_price_override: e.target.value,
                      })
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
              </div>
            ))}

            <div className="flex justify-between">
              <button
                onClick={addRow}
                className="text-green-400 border border-green-400 p-2 rounded"
              >
                + Add Component
              </button>

              <button
                onClick={createProduct}
                className="bg-green-600 px-4 py-2 rounded"
              >
                Create Bundle
              </button>
            </div>
          </div>

          {products.map((p) => (
            <div
              key={p.id}
              className="mb-3 border border-white/10 rounded relative"
            >
              <div className="flex items-center justify-between">
                <div
                  className="p-3 cursor-pointer hover:bg-white/5 flex-1 pr-10"
                  onClick={() =>
                    setExpandedId(expandedId === p.id ? null : p.id)
                  }
                >
                  {p.starter_type} — {p.rating_kw} kW — ₹{p.total_price}
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent expanding the card when clicking delete
                    deleteProduct(p.id);
                  }}
                  className="absolute top-3 right-3 text-red-400 hover:text-red-300 text-lg font-bold"
                  title="Delete this product bundle"
                >
                  ✕
                </button>
              </div>

              {expandedId === p.id && (
                <div className="p-3 bg-black/40 text-sm border-t border-white/10">
                  {p.components.map((c) => (
                    <div key={c.id}>
                      {c.name} | {c.brand_name} {c.model ? `| ${c.model}` : ""}{" "}
                      | Qty {c.quantity} | ₹{c.unit_price}
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
