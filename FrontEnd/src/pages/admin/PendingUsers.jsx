import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api/base";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { useNavigate } from "react-router-dom";

const PendingUsers = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      navigate("/login");
      return;
    }

    if (role !== "admin") {
      navigate("/unauthorized");
      return;
    }

    const fetchPendingUsers = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${API_URL}/admin/users/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingUsers();
  }, []);

  const approveUser = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(`${API_URL}/admin/users/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers(users.filter((u) => u.id !== id)); // instantly remove approved user
    } catch (err) {
      alert("Approval failed");
    }
  };

  return (
    <div className="flex min-h-screen bg-black/50 text-white border-2 border-white/20 rounded-lg mt-10">
      <Sidebar />

      <div className="flex-1 flex flex-col p-5">
        <AdminNavbar />

        <h2 className="text-2xl font-bold mt-5 mb-4 text-center">Pending User Approvals</h2>

        {loading && <p>Loading users...</p>}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {users.length === 0 && !loading ? (
          <p className="text-gray-400 text-sm">No pending users</p>
        ) : (
          <table className="border border-gray-700 text-sm w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Team</th>
                <th className="p-2 text-left">Approve</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700">
                  <td className="p-2">
                    {user.first_name} {user.last_name}
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">{user.team || "-"}</td>
                  <td className="p-2">
                    <button
                      onClick={() => approveUser(user.id)}
                      className="px-3 py-1 bg-green-600 rounded hover:bg-green-700"
                    >
                      Approve ✔
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingUsers;