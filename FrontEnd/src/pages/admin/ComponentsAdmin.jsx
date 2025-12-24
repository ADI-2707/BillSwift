import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { FiEdit2, FiCheck, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  brand_name: "",
  model: "",
  base_unit_price: "",
};

const ComponentsAdmin = () => {
  // Mobile Sidebar State
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const headers = { Authorization: `Bearer ${token}` };

  const [components, setComponents] = useState([]);
  const [newComponent, setNewComponent] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (role !== "admin") { navigate("/unauthorized"); return; }
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

  const toggleVisibility = async (component) => {
    const id = component.id;
    if (!id) return alert("ID is missing - Check Backend Router");

    const newStatus = !component.is_active;
    if (!window.confirm(`This component will become ${newStatus ? 'visible' : 'invisible'} for user. Want to continue?`)) return;

    try {
      await axios.put(`${API_URL}/admin/components/${id}`, 
        { ...component, is_active: newStatus, base_unit_price: Number(component.base_unit_price) }, 
        { headers }
      );
      fetchComponents();
    } catch (err) {
      alert("Failed to update visibility status.");
    }
  };

  const addComponent = async () => {
    if (!newComponent.name.trim() || !newComponent.brand_name.trim() || !newComponent.base_unit_price) {
      alert("Name, Brand and Price are required"); return;
    }
    try {
      await axios.post(`${API_URL}/admin/components/`, 
        { ...newComponent, base_unit_price: Number(newComponent.base_unit_price), is_active: true }, 
        { headers }
      );
      setNewComponent(EMPTY_FORM);
      fetchComponents();
    } catch (err) {
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
      is_active: component.is_active
    });
  };

  const saveEdit = async () => {
    try {
      await axios.put(`${API_URL}/admin/components/${editingId}`, 
        { ...editForm, base_unit_price: Number(editForm.base_unit_price) }, 
        { headers }
      );
      setEditingId(null);
      setEditForm(EMPTY_FORM);
      fetchComponents();
    } catch (err) {
      alert("Failed to update component");
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]/80 text-white border-white/20 border-2 rounded-lg mt-10 overflow-y-auto">
      {/* Sidebar - Handles its own mobile visibility via props */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        
        <div className="p-4 md:p-6 max-w-5xl mx-auto w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">Components Management</h2>

          {/* ADD SECTION - Responsive Grid */}
          <div className="bg-white/10 p-4 rounded-xl mb-6 border border-white/10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <input placeholder="Name" value={newComponent.name} onChange={(e) => setNewComponent({...newComponent, name: e.target.value})} className="bg-black/40 p-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
              <input placeholder="Brand" value={newComponent.brand_name} onChange={(e) => setNewComponent({...newComponent, brand_name: e.target.value})} className="bg-black/40 p-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
              <input placeholder="Model (optional)" value={newComponent.model} onChange={(e) => setNewComponent({...newComponent, model: e.target.value})} className="bg-black/40 p-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
              <input type="number" placeholder="Base Price" value={newComponent.base_unit_price} onChange={(e) => setNewComponent({...newComponent, base_unit_price: e.target.value})} className="bg-black/40 p-2 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-green-500" />
            </div>
            <button onClick={addComponent} className="w-full md:w-auto bg-green-600 hover:bg-green-500 px-6 py-2 rounded-lg transition text-sm font-semibold">Add Component</button>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-3">
            {components.map((c, index) => {
              const currentId = c.id;
              const isActive = c.is_active !== false;

              return (
                <div key={currentId || index} className={`p-4 rounded-xl border border-white/5 transition-all duration-300 ${isActive ? "bg-white/10" : "bg-white/5 opacity-60"}`}>
                  {editingId === currentId ? (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-black/40 p-2 rounded text-white text-sm" />
                        <input value={editForm.brand_name} onChange={(e) => setEditForm({ ...editForm, brand_name: e.target.value })} className="bg-black/40 p-2 rounded text-white text-sm" />
                        <input value={editForm.model} placeholder="Model" onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} className="bg-black/40 p-2 rounded text-white text-sm" />
                        <input type="number" value={editForm.base_unit_price} onChange={(e) => setEditForm({ ...editForm, base_unit_price: e.target.value })} className="bg-black/40 p-2 rounded text-white text-sm" />
                      </div>
                      <div className="flex justify-end gap-4 mt-2 border-t border-white/10 pt-2">
                        <button onClick={saveEdit} className="flex items-center gap-1 text-green-400 text-sm font-bold"><FiCheck /> Save</button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-red-400 text-sm font-bold"><FiX /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-base md:text-lg leading-tight truncate">
                          {c.name} <span className="font-normal text-gray-400 text-sm">| {c.brand_name}</span>
                        </span>
                        {c.model && <span className="text-sm text-blue-400 font-medium truncate">Model: {c.model}</span>}
                        <span className={`text-[10px] uppercase font-bold mt-1 ${isActive ? "text-green-400" : "text-red-400"}`}>
                          {isActive ? "● Active" : "○ Inactive"}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between w-full sm:w-auto gap-4 md:gap-6 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                        <span className="font-bold text-lg">₹{c.base_unit_price}</span>
                        <div className="flex items-center gap-4">
                          {/* Toggle Switch */}
                          <div onClick={() => toggleVisibility(c)} className={`relative w-10 h-5 md:w-12 md:h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${isActive ? "bg-green-500" : "bg-gray-600"}`}>
                            <div className={`bg-white w-3 h-3 md:w-4 md:h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? "translate-x-5 md:translate-x-6" : "translate-x-0"}`} />
                          </div>
                          {/* Edit Button */}
                          <button onClick={() => startEdit(c)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition active:scale-95">
                            <FiEdit2 className="text-blue-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {components.length === 0 && (
            <div className="text-center text-gray-500 mt-10">No components found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsAdmin;