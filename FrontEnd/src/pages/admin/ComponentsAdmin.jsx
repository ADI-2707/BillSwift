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

  const fetchComponents = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/components/`, { headers });
      setComponents(res.data || []);
    } catch (err) {
      console.error("Fetch components failed", err);
    }
  };

  const addComponent = async () => {
    if (
      !newComponent.name.trim() ||
      !newComponent.brand_name.trim() ||
      !newComponent.base_unit_price
    ) {
      alert("Name, Brand and Price are required");
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
      alert("Failed to add component");
    }
  };

  const startEdit = (component) => {
    setEditingId(component.id);
    setEditForm({
      name: component.name || "",
      brand_name: component.brand_name || "",
      model: component.model || "",
      base_unit_price: component.base_unit_price?.toString() || "",
    });
  };

  const saveEdit = async () => {
    if (
      !editForm.name.trim() ||
      !editForm.brand_name.trim() ||
      !editForm.base_unit_price
    ) {
      alert("Name, Brand and Price are required");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/admin/components/${editingId}`,
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
      console.error("Update failed", err);
      alert("Failed to update component");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
  };

  const deleteComponent = async (id) => {
    if (!window.confirm("Delete this component permanently?")) return;

    try {
      await axios.delete(`${API_URL}/admin/components/${id}`, { headers });
      fetchComponents();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Cannot delete: component is used in products");
    }
  };

  return (
    <div className="flex min-h-screen bg-black/60 text-white border-2 border-white/20 rounded-lg mt-10">
      <Sidebar />
      <div className="flex-1">
        <AdminNavbar />

        <div className="p-6 max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Components Management
          </h2>

          {/* ADD NEW COMPONENT */}
          <div className="bg-white/10 p-4 rounded mb-6">
            <div className="grid grid-cols-4 gap-3 mb-4">
              <input
                placeholder="Name"
                value={newComponent.name}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, name: e.target.value })
                }
                className="bg-black/40 p-2 rounded text-white placeholder-gray-400"
              />
              <input
                placeholder="Brand"
                value={newComponent.brand_name}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, brand_name: e.target.value })
                }
                className="bg-black/40 p-2 rounded text-white placeholder-gray-400"
              />
              <input
                placeholder="Model (optional)"
                value={newComponent.model}
                onChange={(e) =>
                  setNewComponent({ ...newComponent, model: e.target.value })
                }
                className="bg-black/40 p-2 rounded text-white placeholder-gray-400"
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
                className="bg-black/40 p-2 rounded text-white placeholder-gray-400"
              />
            </div>
            <button
              onClick={addComponent}
              className="bg-green-600 hover:bg-green-500 px-6 py-2 rounded transition"
            >
              Add Component
            </button>
          </div>

          {/* COMPONENTS LIST */}
          <div className="space-y-2">
            {components.map((c, index) => (
              <div
                key={`${c.id}-${index}`} // Yeh key abhi bhi sahi hai
                className="bg-white/10 p-4 rounded flex items-center justify-between gap-4"
              >
                {editingId === c.id ? (
                  <div className="flex w-full items-center gap-3">
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      className="bg-black/40 p-2 rounded flex-1 text-white"
                      autoFocus
                    />
                    <input
                      value={editForm.brand_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, brand_name: e.target.value })
                      }
                      className="bg-black/40 p-2 rounded flex-1 text-white"
                    />
                    <input
                      value={editForm.model}
                      onChange={(e) =>
                        setEditForm({ ...editForm, model: e.target.value })
                      }
                      className="bg-black/40 p-2 rounded flex-1 text-white"
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
                      className="bg-black/40 p-2 rounded w-32 text-white"
                    />
                    <div className="flex gap-3">
                      <button onClick={saveEdit}>
                        <FiCheck className="text-green-400 text-xl" />
                      </button>
                      <button onClick={cancelEdit}>
                        <FiX className="text-red-400 text-xl" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex w-full justify-between items-center">
                    <div>
                      <strong>{c.name}</strong> | {c.brand_name}
                      {c.model && ` | ${c.model}`}
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-medium">₹{c.base_unit_price}</span>
                      <button onClick={() => startEdit(c)}>
                        <FiEdit2 className="text-blue-400" />
                      </button>
                      <button onClick={() => deleteComponent(c.id)}>
                        <FiTrash2 className="text-red-400" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {components.length === 0 && (
              <p className="text-center text-gray-400 py-8">
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