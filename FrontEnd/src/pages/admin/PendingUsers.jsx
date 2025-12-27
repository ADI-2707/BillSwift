import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { API_URL } from "../../api/base";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiFilter,
  FiChevronRight,
  FiChevronLeft,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";

const PendingUsers = () => {

  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState("All Teams");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 25;

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/users/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!token) return navigate("/login");
    if (role !== "admin") return navigate("/unauthorized");
    fetchData();
  }, [token, navigate]);

  const approveUser = async (id) => {
    try {
      await axios.put(`${API_URL}/admin/users/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchData();
      setAllUsers(
        allUsers.map((u) => (u.id === id ? { ...u, is_active: !currentStatus } : u))
      );
    } catch (err) {
      alert("Approval failed");
    }
  };

// Pending = Not active AND doesn't have an employee code yet (new signup)
  const pendingUsers = allUsers.filter((u) => !u.is_active && !u.employee_code);

  // Registered = Has an employee code (was once approved), regardless of current toggle status
  const registeredEmployeesList = allUsers.filter((u) => u.employee_code);

  const uniqueTeams = useMemo(() => {
    const teams = allUsers.map((u) => u.team).filter(Boolean);
    return ["All Teams", ...new Set(teams)];
  }, [allUsers]);

  const filteredEmployees = useMemo(() => {
    return registeredEmployeesList.filter((u) => {
      const matchesSearch =
        `${u.first_name} ${u.last_name}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        u.employee_code?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = teamFilter === "All Teams" || u.team === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [registeredEmployeesList, searchQuery, teamFilter]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredEmployees.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredEmployees.length / recordsPerPage);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      // We will create this endpoint in user_admin.py
      await axios.patch(
        `${API_URL}/admin/users/${id}/status`,
        { is_active: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, is_active: !currentStatus } : u))
    } catch (err) {
      alert("Status update failed");
    }
  };

  return (
    // Added flex-col for mobile, flex-row for desktop
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]/80 text-white border-2 border-white/20 rounded-lg mt-10 mx-2 md:mx-4 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col h-screen overflow-y-auto custom-scrollbar">
        <AdminNavbar toggleSidebar={toggleSidebar} />

        <div className="p-4 md:p-10 max-w-7xl mx-auto w-full">
          {/* SECTION 1: PENDING REQUESTS */}
          <div className="mb-12">
            <h1 className="custom-heading-admin">User Management</h1>
            <p className="text-sm text-gray-400 mt-1 mb-6">
              Track and authorize users.
            </p>

            <h2 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2 text-red-500 uppercase tracking-wider">
              <FiUserPlus /> Pending Requests
            </h2>

            {pendingUsers.length === 0 ? (
              <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-center text-gray-500 italic">
                No pending approvals.
              </div>
            ) : (
              // wrapper for horizontal scroll on mobile
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto backdrop-blur-md">
                <table className="w-full text-sm min-w-[600px]">
                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Name</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Code</th>
                      <th className="px-6 py-4 text-left">Team</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {pendingUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold whitespace-nowrap">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-gray-400 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 font-mono text-green-500">
                          {user.employee_code}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-white/10 px-3 py-1 rounded-full text-[10px] uppercase font-bold">
                            {user.team || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => approveUser(user.id)}
                            className="bg-green-600 hover:bg-green-500 px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all active:scale-95 whitespace-nowrap"
                          >
                            APPROVE ✔
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <hr className="border-white/5 mb-12" />

          {/* SECTION 2: ACTIVE EMPLOYEES LIST */}
          <div className="mb-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg md:text-xl font-bold flex items-center gap-2 uppercase tracking-wider text-green-400">
                <FiUsers /> Registered Employees
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative group w-full sm:min-w-[250px]">
                  <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search Name or Code..."
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm focus:border-green-500 outline-none transition-all w-full"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <div className="relative group w-full sm:min-w-[160px]">
                  <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                  <select
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm focus:border-green-500 outline-none transition-all appearance-none cursor-pointer w-full"
                    value={teamFilter}
                    onChange={(e) => {
                      setTeamFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    {uniqueTeams.map((team) => (
                      <option key={team} value={team} className="bg-[#0a0a0a]">
                        {team}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="text-center py-10 text-gray-500 animate-pulse">
                Fetching records...
              </p>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto backdrop-blur-md">
                <table className="w-full text-sm min-w-[700px]">
                  <thead className="bg-white/5 text-gray-400 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="px-6 py-4 text-left">Emp Code</th>
                      <th className="px-6 py-4 text-left">Full Name</th>
                      <th className="px-6 py-4 text-left">Email Address</th>
                      <th className="px-6 py-4 text-left">Department</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {currentRecords.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-xs text-green-500">
                          {user.employee_code}
                        </td>
                        <td className="px-6 py-4 font-semibold whitespace-nowrap">
                          {user.first_name} {user.last_name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                          {user.email}
                        </td>
                        <td className="px-6 py-4 text-gray-400 font-medium italic whitespace-nowrap">
                          {user.team}
                        </td>
                        <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${user.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                          {user.is_active ? "ACTIVE" : "RESTRICTED"}
                        </span>
                      </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              toggleUserStatus(user.id, user.is_active)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              user.is_active ? "bg-green-600" : "bg-gray-700"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                user.is_active
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {totalPages > 1 && (
                  <div className="p-4 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">
                      Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((p) => p - 1)}
                        className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all active:scale-90"
                      >
                        <FiChevronLeft />
                      </button>
                      <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((p) => p + 1)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400 text-xs font-bold hover:bg-green-600 hover:text-white transition-all active:scale-95"
                      >
                        NEXT <FiChevronRight />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!loading && filteredEmployees.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10 mt-4">
                <p className="text-gray-500 text-sm">No employees found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingUsers;
