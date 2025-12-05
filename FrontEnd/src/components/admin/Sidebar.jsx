import { NavLink } from "react-router-dom";
import { FiUsers, FiBox, FiFileText, FiSettings, FiHome } from "react-icons/fi";

const Sidebar = () => {
  const links = [
    { name: "Dashboard", icon: <FiHome />, path: "/admin" },
    { name: "Pending Approvals", icon: <FiUsers />, path: "/admin/pending-users" },
    { name: "Products", icon: <FiBox />, path: "/admin/products" },
    { name: "Bills", icon: <FiFileText />, path: "/admin/bills" },
    { name: "Settings", icon: <FiSettings />, path: "/admin/settings" }
  ];

  return (
    <aside className="w-64 h-screen bg-black/90 border-r border-white/10 p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-8 text-green-400">BillSwift Admin</h2>

      <nav className="flex flex-col gap-3">
        {links.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg 
               ${isActive ? "bg-green-600 text-white" : "text-gray-300 hover:bg-white/10"}`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
