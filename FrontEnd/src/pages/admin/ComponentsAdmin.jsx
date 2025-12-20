import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  brand_name: "",
  model: "",
  base_unit_price: "",
};

const ComponentsAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const [components, setComponents] = useState([]);
  const [newComponent, setNewComponent] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  // ---------------- AUTH ----------------
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }
    fetchComponents();
  }, [token, role, navigate]);

  // ---------------- FETCH ----------------
  const fetchComponents = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/components/`, { headers });
      setComponents(res.data || []);
    } catch (err) {
      console.error("Fetch components failed", err);
    }
  };

  // ---------------- CREATE ----------------
  const addComponent = async () => {
    if (
      !newComponent.name.trim() ||
      !newComponent.brand_name.trim() ||
      !newComponent.base_unit_price
    ) {
      alert("Name, Brand and Price required");
      return;
    }

    try {
      await axios.post(
        `${API_URL}/admin/components/`,
        {
          ...newComponent,
          base_unit_price: Number(newComponent.base_unit_price),
        },
        { headers }
      );

      setNewComponent(EMPTY_FORM);
      fetchComponents();
    } catch (err) {
      console.error("Add component failed", err);
    }
  };

  // ---------------- UPDATE ----------------
  const saveEdit = async (id) => {
    try {
      await axios.put(
        `${API_URL}/admin/components/${id}`,
        {
          ...editForm,
          base_unit_price: Number(editForm.base_unit_price),
        },
        { headers }
      );
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      fetchComponents();
    } catch (err) {
      console.error("Update component failed", err);
    }
  };

  // ---------------- DELETE ----------------
  const deleteComponent = async (id) => {
    if (!window.confirm("Delete this component?")) return;
    try {
      await axios.delete(`${API_URL}/admin/components/${id}`, { headers });
      fetchComponents();
    } catch (err) {
      console.error("Delete component failed", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-black/60 text-white">
      <Sidebar />
      <div className="flex-1">
        <AdminNavbar />

        <div className="p-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Components Management
          </h2>

          {/* ADD */}
          <div className="bg-white/10 p-4 rounded mb-6">
            <div className="grid grid-cols-4 gap-3">
              <input
                placeholder="Name"
                value={newComponent.name}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, name: e.target.value })
                }
                className="bg-black/40 p-2 rounded"
              />
              <input
                placeholder="Brand"
                value={newComponent.brand_name}
                onChange={(e) =>
                  setNewComponent({
                    ...newComponent,
                    brand_name: e.target.value,
                  })
                }
                className="bg-black/40 p-2 rounded"
              />
              <input
                placeholder="Model"
                value={newComponent.model}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, model: e.target.value })
                }
                className="bg-black/40 p-2 rounded"
              />
              <input
                type="number"
                placeholder="Base Price"
                value={newComponent.base_unit_price}
                onChange={(e) =>
                  setNewComponent({
                    ...newComponent,
                    base_unit_price: e.target.value,
                  })
                }
                className="bg-black/40 p-2 rounded"
              />
            </div>

            <button
              onClick={addComponent}
              className="mt-4 bg-green-600 px-4 py-2 rounded"
            >
              Add Component
            </button>
          </div>

          {/* LIST */}
          <div className="space-y-2">
            {components.map((c, index) => (
              <div
                key={c.id ?? `${c.name}-${c.brand_name}-${index}`}
                className="flex justify-between items-center bg-white/10 p-3 rounded"
              >
                {editingId === c.id ? (
                  <div className="flex justify-between w-full">
                    <div className="flex gap-2">
                      <input
                        value={editForm.name || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-black/40 p-1 rounded"
                      />
                      <input
                        value={editForm.brand_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            brand_name: e.target.value,
                          })
                        }
                        className="bg-black/40 p-1 rounded"
                      />
                      <input
                        value={editForm.model || ""}
                        onChange={(e) =>
                          setEditForm({ ...editForm, model: e.target.value })
                        }
                        className="bg-black/40 p-1 rounded"
                      />
                      <input
                        type="number"
                        value={editForm.base_unit_price || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            base_unit_price: e.target.value,
                          })
                        }
                        className="bg-black/40 p-1 rounded w-24"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => saveEdit(c.id)}>
                        <FiCheck className="text-green-400" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditForm(EMPTY_FORM);
                        }}
                      >
                        <FiX className="text-red-400" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between w-full">
                    <div>
                      <strong>{c.name}</strong> | {c.brand_name}
                      {c.model && ` (${c.model})`}
                    </div>

                    <div className="flex gap-4 items-center">
                      <span>₹{c.base_unit_price}</span>
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditForm({
                            name: c.name || "",
                            brand_name: c.brand_name || "",
                            model: c.model || "",
                            base_unit_price: c.base_unit_price || "",
                          });
                        }}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        disabled={!c.id}
                        onClick={() => c.id && deleteComponent(c.id)}
                        title={!c.id ? "Cannot delete: missing ID" : "Delete"}
                      >
                        <FiTrash2 className="text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {components.length === 0 && (
              <p className="text-gray-400 text-center">
                No components added yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentsAdmin;