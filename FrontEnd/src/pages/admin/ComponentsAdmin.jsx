import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ComponentsAdmin = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const headers = { Authorization: `Bearer ${token}` };

  const [components, setComponents] = useState([]);

  /* ---------- ADD FORM ---------- */
  const [newComponent, setNewComponent] = useState({
    name: "",
    brand_name: "",
    model: "",
    base_unit_price: "",
  });

  /* ---------- EDIT STATE ---------- */
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  /* ---------- AUTH ---------- */
  useEffect(() => {
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");
    fetchComponents();
  }, []);

  /* ---------- LOAD ---------- */
  const fetchComponents = async () => {
    const res = await axios.get(`${API_URL}/admin/components`, { headers });
    setComponents(res.data);
  };

  /* ---------- CREATE ---------- */
  const addComponent = async () => {
    if (!newComponent.name || !newComponent.brand_name || !newComponent.base_unit_price) {
      alert("Name, Brand and Price are required");
      return;
    }

    await axios.post(
      `${API_URL}/admin/components`,
      {
        name: newComponent.name,
        brand_name: newComponent.brand_name,
        model: newComponent.model || null,
        base_unit_price: Number(newComponent.base_unit_price),
      },
      { headers }
    );

    setNewComponent({ name: "", brand_name: "", model: "", base_unit_price: "" });
    fetchComponents();
  };

  /* ---------- UPDATE ---------- */
  const saveEdit = async (id) => {
    await axios.put(
      `${API_URL}/admin/components/${id}`,
      {
        name: editForm.name,
        brand_name: editForm.brand_name,
        model: editForm.model || null,
        base_unit_price: Number(editForm.base_unit_price),
      },
      { headers }
    );

    setEditingId(null);
    fetchComponents();
  };

  /* ---------- DELETE ---------- */
  const deleteComponent = async (id) => {
    if (!confirm("Delete this component permanently?")) return;

    await axios.delete(`${API_URL}/admin/components/${id}`, { headers });
    fetchComponents();
  };

  return (
    <div className="flex min-h-screen bg-black/50 text-white mt-10">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 max-w-5xl mx-auto w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Components Management
          </h1>

          {/* ================= ADD COMPONENT ================= */}
          <div className="bg-white/10 p-4 rounded mb-6">
            <h3 className="font-semibold mb-3">Add New Component</h3>

            <div className="grid grid-cols-4 gap-3">
              <input
                placeholder="Component Name"
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
                  setNewComponent({ ...newComponent, brand_name: e.target.value })
                }
                className="bg-black/40 p-2 rounded"
              />

              <input
                placeholder="Model/Rating (optional)"
                value={newComponent.model}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, model: e.target.value })
                }
                className="bg-black/40 p-2 rounded"
              />

              <input
                placeholder="Base Price"
                type="number"
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
              className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-500"
            >
              Add Component
            </button>
          </div>

          {/* ================= COMPONENT LIST ================= */}
          <div className="space-y-2">
            {components.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center bg-white/10 p-3 rounded"
              >
                {editingId === c.id ? (
                  <>
                    <div className="flex gap-2 flex-wrap">
                      <input
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="bg-black/40 p-1 rounded"
                      />
                      <input
                        value={editForm.brand_name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, brand_name: e.target.value })
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
                        value={editForm.base_unit_price}
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
                      <button onClick={() => setEditingId(null)}>
                        <FiX className="text-red-400" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <strong>{c.name}</strong> | {c.brand_name}
                      {c.model && ` (${c.model})`}
                    </div>

                    <div className="flex gap-4 items-center">
                      <span>₹{c.base_unit_price}</span>

                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditForm(c);
                        }}
                      >
                        <FiEdit2 />
                      </button>

                      <button onClick={() => deleteComponent(c.id)}>
                        <FiTrash2 className="text-red-500" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {components.length === 0 && (
              <p className="text-gray-400 text-sm text-center">
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