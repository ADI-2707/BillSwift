import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Account = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("loggedUser"));
  const [bills, setBills] = useState([]);

  useEffect(() => {
    if (!user) navigate("/login");
    
    // Fetch bills from localStorage or DB
    const storedBills = JSON.parse(localStorage.getItem("bills")) || [];
    const userBills = storedBills.filter(b => b.userEmail === user.email);
    setBills(userBills);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold text-white">Account</h1>

      <div className="mt-6 bg-white/10 p-6 rounded-xl w-[90vw] max-w-md border border-white/20">
        <p className="text-center"><strong>Email:</strong> {user.email}</p>
      </div>

      <h2 className="text-2xl font-semibold mt-10 text-white">Your Bills</h2>

      <table className="mt-4 border border-white/20 text-white">
        <thead>
          <tr>
            <th className="px-4 py-2">Bill ID</th>
            <th className="px-4 py-2">Product</th>
            <th className="px-4 py-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          {bills.map((b, i) => (
            <tr key={i}>
              <td className="px-4 py-2">{b.id}</td>
              <td className="px-4 py-2">{b.product}</td>
              <td className="px-4 py-2 text-green-400">₹{b.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Account;