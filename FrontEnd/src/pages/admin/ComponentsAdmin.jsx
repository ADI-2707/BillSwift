import { useEffect, useState } from "react";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import axios from "axios";
import { API_URL } from "../../api/base";
import { FiEdit2, FiCheck, FiX, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  brand_name: "",
  model: "",
  base_unit_price: "",
};

const ComponentsAdmin = () => {
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
    if (!id) return alert("ID is missing");

    const newStatus = !component.is_active;
    if (!window.confirm(`Mark this component as ${newStatus ? 'Active' : 'Inactive'}?`)) return;

    try {
      await axios.put(`${API_URL}/admin/components/${id}`, 
        { ...component, is_active: newStatus, base_unit_price: Number(component.base_unit_price) }, 
        { headers }
      );
      fetchComponents();
    } catch (err) {
      alert("Failed to update status.");
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg mt-10 mx-2 md:mx-4 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar">
        <AdminNavbar toggleSidebar={toggleSidebar} />
        
        <div className="p-4 md:p-10 max-w-5xl mx-auto w-full">
          <header className="mb-8">
             <h1 className="custom-heading-admin">
               Components Management
             </h1>
             <p className="text-xs md:text-sm text-gray-400 mt-1">Configure and price your inventory</p>
          </header>

          {/* ADD SECTION */}
          <div className="bg-white/5 p-5 rounded-2xl mb-8 border border-white/10 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-widest text-green-500 mb-4 flex items-center gap-2">
              <FiPlus /> Add New Component
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              <input placeholder="Name" value={newComponent.name} onChange={(e) => setNewComponent({...newComponent, name: e.target.value})} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all" />
              <input placeholder="Brand" value={newComponent.brand_name} onChange={(e) => setNewComponent({...newComponent, brand_name: e.target.value})} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all" />
              <input placeholder="Model (optional)" value={newComponent.model} onChange={(e) => setNewComponent({...newComponent, model: e.target.value})} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all" />
              <input type="number" placeholder="Base Price" value={newComponent.base_unit_price} onChange={(e) => setNewComponent({...newComponent, base_unit_price: e.target.value})} className="bg-black/40 border border-white/10 p-2.5 rounded-xl text-white text-sm focus:border-green-500 outline-none transition-all" />
            </div>
            <button onClick={addComponent} className="w-full md:w-auto bg-green-600 hover:bg-green-500 px-8 py-2.5 rounded-xl transition-all font-bold text-xs uppercase tracking-widest active:scale-95 shadow-lg shadow-green-900/20">
              Add Component
            </button>
          </div>

          {/* LIST SECTION */}
          <div className="space-y-4">
            {components.map((c, index) => {
              const currentId = c.id;
              const isActive = c.is_active !== false;

              return (
                <div key={currentId || index} className={`p-5 rounded-2xl border transition-all duration-300 ${isActive ? "bg-white/5 border-white/10" : "bg-white/[0.02] border-white/5 opacity-60"}`}>
                  {editingId === currentId ? (
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-black border border-green-500/50 p-2.5 rounded-xl text-white text-sm" />
                        <input value={editForm.brand_name} onChange={(e) => setEditForm({ ...editForm, brand_name: e.target.value })} className="bg-black border border-green-500/50 p-2.5 rounded-xl text-white text-sm" />
                        <input value={editForm.model} placeholder="Model" onChange={(e) => setEditForm({ ...editForm, model: e.target.value })} className="bg-black border border-green-500/50 p-2.5 rounded-xl text-white text-sm" />
                        <input type="number" value={editForm.base_unit_price} onChange={(e) => setEditForm({ ...editForm, base_unit_price: e.target.value })} className="bg-black border border-green-500/50 p-2.5 rounded-xl text-white text-sm" />
                      </div>
                      <div className="flex justify-end gap-4 mt-2 pt-3 border-t border-white/5">
                        <button onClick={saveEdit} className="flex items-center gap-1 text-green-400 text-xs font-black uppercase tracking-widest"><FiCheck /> Save</button>
                        <button onClick={() => setEditingId(null)} className="flex items-center gap-1 text-red-400 text-xs font-black uppercase tracking-widest"><FiX /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-lg leading-tight">{c.name}</span>
                          <span className="text-gray-500 text-sm">| {c.brand_name}</span>
                        </div>
                        {c.model && <span className="text-xs text-blue-400 font-mono mt-1">MODEL: {c.model}</span>}
                        <div className={`text-[10px] uppercase font-black mt-2 inline-flex items-center gap-1.5 ${isActive ? "text-green-500" : "text-red-500"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`}></span>
                          {isActive ? "Online" : "Offline"}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-10 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                        <div className="flex flex-col items-start sm:items-end">
                          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Base Price</span>
                          <span className="font-mono font-bold text-xl text-green-400">₹{c.base_unit_price}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          {/* Toggle Switch */}
                          <button 
                            onClick={() => toggleVisibility(c)} 
                            className={`relative w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${isActive ? "bg-green-600" : "bg-zinc-800"}`}
                          >
                            <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${isActive ? "translate-x-5" : "translate-x-0"}`} />
                          </button>
                          {/* Edit Button */}
                          <button onClick={() => startEdit(c)} className="p-2.5 bg-white/5 rounded-xl hover:bg-white/10 transition-all active:scale-90 border border-white/5">
                            <FiEdit2 className="text-blue-400 size-4" />
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
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 mt-10">
              <p className="text-gray-500 text-sm italic">Inventory is empty. Add your first component above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComponentsAdmin;