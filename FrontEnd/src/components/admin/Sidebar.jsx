import { NavLink } from "react-router-dom";
import { FiUsers, FiBox, FiFileText, FiSettings, FiHome } from "react-icons/fi";

const Sidebar = () => {
  return (
    <aside className="w-64 min-h-screen bg-black border-r border-white/5 p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-8 text-green-400"><span className='text-2xl text-red-600'>B</span><span className="text-2xl text-white">ill</span><span className='text-2xl text-red-600'>Swift</span> Admin</h2>

      <nav className="flex flex-col gap-3">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition 
             ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
          }
        >
          <FiHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/pending-users"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition 
             ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
          }
        >
          <FiUsers />
          <span>Pending Approvals</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition 
             ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
          }
        >
          <FiBox />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/bills"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition 
             ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
          }
        >
          <FiFileText />
          <span>Bills</span>
        </NavLink>

        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-2 rounded-lg transition 
             ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10 hover:text-red-400"}`
          }
        >
          <FiSettings />
          <span>Settings</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;