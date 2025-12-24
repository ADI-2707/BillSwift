import { NavLink } from "react-router-dom";
import { FiUsers, FiBox, FiFileText, FiSettings, FiHome, FiLayers, FiX } from "react-icons/fi";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  return (
    <>
      {/* Mobile Overlay: Darkens background when sidebar is open */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/90 z-40 md:hidden transition-all duration-300"
          onClick={toggleSidebar}
        ></div>
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 min-h-screen bg-black border-r border-white/5 p-4 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-green-400">
            <span className="text-2xl text-red-600">B</span>
            <span className="text-2xl text-white">ill</span>
            <span className="text-2xl text-red-600">Swift</span> Admin
          </h2>
          {/* Close button for mobile */}
          <button onClick={toggleSidebar} className="md:hidden text-white p-1">
            <FiX size={24} />
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {[
            { to: "/admin", icon: <FiHome />, label: "Dashboard", end: true },
            { to: "/admin/pending-users", icon: <FiUsers />, label: "Pending Approvals" },
            { to: "/admin/components", icon: <FiLayers />, label: "Components" },
            { to: "/admin/products", icon: <FiBox />, label: "Products" },
            { to: "/admin/bills", icon: <FiFileText />, label: "Orders" },
            { to: "/admin/settings", icon: <FiSettings />, label: "Settings" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => { if (window.innerWidth < 768) toggleSidebar(); }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg transition 
                 ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;