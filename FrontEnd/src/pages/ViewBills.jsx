import { useState, useEffect } from "react";
import { usersDB } from "../data/dummyData";

const ViewBill = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const logged = JSON.parse(localStorage.getItem("loggedUser"));
    let db = JSON.parse(localStorage.getItem("usersDB")) || usersDB;

    const user = db.find(u => u.id === logged.id);
    setData(user?.bills || []);
  }, []);

  const deleteBill = (billId) => {
    const logged = JSON.parse(localStorage.getItem("loggedUser"));
    let db = JSON.parse(localStorage.getItem("usersDB")) || usersDB;

    let idx = db.findIndex(u => u.id === logged.id);
    db[idx].bills = db[idx].bills.filter(b => b.billId !== billId);

    localStorage.setItem("usersDB", JSON.stringify(db));
    setData(db[idx].bills);
  };

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold">Your Bills</h1>

      {data.map(bill => (
        <div key={bill.billId} className="bg-gray-900 p-4 mt-4 rounded">
          <p><b>ID:</b> {bill.billId}</p>
          <p><b>Date:</b> {bill.createdAt}</p>
          <p><b>Total:</b> ${bill.total}</p>

          <button
            onClick={() => deleteBill(bill.billId)}
            className="mt-3 bg-red-600 px-3 py-1 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

export default ViewBill;