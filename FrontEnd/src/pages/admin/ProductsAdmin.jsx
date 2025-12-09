// FrontEnd/src/pages/admin/ProductsAdmin.jsx
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { useNavigate } from "react-router-dom";

const ProductsAdmin = () => {
  const [bundles, setBundles] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // NEW BUNDLE (starter) form – GST removed
  const [newBundle, setNewBundle] = useState({
    starter_type: "",
    rating_kw: "",
  });

  // Nested components in the bundle
  const [components, setComponents] = useState([
    { name: "", brand_name: "", model: "", quantity: "", unit_price: "" },
  ]);

  const [expandedId, setExpandedId] = useState(null);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const navigate = useNavigate();

  useEffect(() => {
    // auth guards
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    const fetchBundles = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBundles(res.data || []);
      } catch (err) {
        setError("Failed to fetch products/bundles");
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, []);

  // -------- FORM HANDLERS --------

  const handleBundleChange = (e) => {
    setNewBundle({ ...newBundle, [e.target.name]: e.target.value });
  };

  const handleComponentChange = (index, field, value) => {
    const copy = [...components];
    copy[index][field] = value;
    setComponents(copy);
  };

  const addComponentRow = () => {
    setComponents([
      ...components,
      { name: "", brand_name: "", model: "", quantity: "", unit_price: "" },
    ]);
  };

  const removeComponentRow = (index) => {
    if (components.length === 1) return; // keep at least one row
    setComponents(components.filter((_, i) => i !== index));
  };

  const addBundle = async () => {
    // basic validation – GST removed
    if (!newBundle.starter_type || !newBundle.rating_kw) {
      alert("Please fill Starter type and Rating (kW)");
      return;
    }

    const cleanedComponents = components
      .filter((c) => c.name && c.brand_name && c.unit_price)
      .map((c) => ({
        name: c.name,
        brand_name: c.brand_name,
        model: c.model || null,
        quantity: c.quantity ? parseInt(c.quantity, 10) : 1,
        unit_price: parseFloat(c.unit_price),
      }));

    if (cleanedComponents.length === 0) {
      alert("Please add at least one valid component!");
      return;
    }

    try {
      const payload = {
        starter_type: newBundle.starter_type,
        rating_kw: parseFloat(newBundle.rating_kw),
        components: cleanedComponents,
      };

      const res = await axios.post(`${API_URL}/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setBundles((prev) => [...prev, res.data]);

      // reset form
      setNewBundle({ starter_type: "", rating_kw: "" });
      setComponents([
        { name: "", brand_name: "", model: "", quantity: "", unit_price: "" },
      ]);

      alert("Bundle added successfully!");
    } catch (err) {
      alert(err.response?.data?.detail || "Adding bundle failed!");
    }
  };

  const deleteBundle = async (id) => {
    if (!window.confirm("Delete this bundle?")) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBundles((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed!");
    }
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex min-h-screen bg-black/50 border-2 border-white/20 rounded-lg text-white overflow-y-auto mt-10">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 text-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Product Management</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loading && <p>Loading...</p>}

          {/* Add Bundle Form */}
          <div className="mb-6 bg-white/10 p-4 rounded">
            <h3 className="font-bold mb-3">Add New Starter Bundle</h3>

            {/* Starter / Rating fields (GST removed) */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <select
                name="starter_type"
                value={newBundle.starter_type}
                onChange={handleBundleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              >
                <option value="">Starter Type (DOL/RDOL/S/D)</option>
                <option value="DOL">DOL</option>
                <option value="RDOL">RDOL</option>
                <option value="S/D">S/D</option>
              </select>

              <input
                name="rating_kw"
                placeholder="Rating (kW)"
                value={newBundle.rating_kw}
                onChange={handleBundleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
            </div>

            {/* Components input */}
            <h4 className="font-semibold mb-2 text-sm">
              Components in this bundle
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {components.map((c, index) => (
                <div
                  key={index}
                  className="bg-white/10 p-2 rounded flex flex-col gap-1"
                >
                  <input
                    placeholder="Component Name"
                    value={c.name}
                    onChange={(e) =>
                      handleComponentChange(index, "name", e.target.value)
                    }
                    className="bg-white/20 px-2 py-1 rounded outline-none text-sm"
                  />
                  <input
                    placeholder="Brand"
                    value={c.brand_name}
                    onChange={(e) =>
                      handleComponentChange(index, "brand_name", e.target.value)
                    }
                    className="bg-white/20 px-2 py-1 rounded outline-none text-sm"
                  />
                  <input
                    placeholder="Model (optional)"
                    value={c.model}
                    onChange={(e) =>
                      handleComponentChange(index, "model", e.target.value)
                    }
                    className="bg-white/20 px-2 py-1 rounded outline-none text-sm"
                  />

                  <div className="flex gap-2">
                    <input
                      placeholder="Qty"
                      value={c.quantity}
                      onChange={(e) =>
                        handleComponentChange(index, "quantity", e.target.value)
                      }
                      className="bg-white/20 px-2 py-1 rounded outline-none text-sm w-1/3"
                    />
                    <input
                      placeholder="Unit Price"
                      value={c.unit_price}
                      onChange={(e) =>
                        handleComponentChange(index, "unit_price", e.target.value)
                      }
                      className="bg-white/20 px-2 py-1 rounded outline-none text-sm w-2/3"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeComponentRow(index)}
                    className="mt-1 text-xs text-red-300 hover:text-red-400 self-end"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addComponentRow}
              className="mt-3 text-sm text-green-400 hover:text-green-300 cursor-pointer transition-all hover:border hover:border-green-400 hover:rounded inline-block px-4 py-2 mr-5"
            >
              + Add Component Row
            </button>

            <button
              onClick={addBundle}
              className="mt-4 text-sm bg-green-600 px-4 py-2 rounded cursor-pointer hover:bg-green-500 transition-all"
            >
              Add Bundle
            </button>
          </div>

          {/* Bundles table */}
          <table className="w-full border border-gray-800 text-sm mt-4">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Starter Type</th>
                <th className="p-2 text-left">Rating</th>
                <th className="p-2 text-left">Total Price</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {bundles.map((b) => (
                <React.Fragment key={b.id}>
                  <tr
                    className="border-b border-gray-700 cursor-pointer hover:bg-white/5"
                    onClick={() => toggleExpand(b.id)}
                  >
                    <td className="p-2">{b.starter_type}</td>
                    <td className="p-2">{b.rating_kw} kW</td>
                    <td className="p-2">₹{b.total_price}</td>
                    <td className="p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteBundle(b.id);
                        }}
                        className="px-2 py-1 bg-red-600 rounded text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>

                  {expandedId === b.id && (
                    <tr className="border-b border-gray-700">
                      <td colSpan={4} className="p-3 bg-black/60">
                        <p className="font-semibold mb-2 text-sm">
                          Components
                        </p>

                        {b.components?.length > 0 ? (
                          <div className="space-y-2">
                            {b.components.map((c) => (
                              <div
                                key={c.id}
                                className="flex justify-between items-center bg-white/5 px-3 py-2 rounded"
                              >
                                <div className="text-xs">
                                  <strong>{c.name}</strong> — {c.brand_name}
                                  {c.model && ` (${c.model})`}
                                  <div className="text-gray-300">
                                    Qty: {c.quantity} | Unit: ₹{c.unit_price} |
                                    Line: ₹{c.line_total}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-xs">
                            No components found.
                          </p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;
