import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { usersDB } from "../data/dummyData";

const Signup = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    team: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = () => {
    const { firstName, lastName, team, email, password, confirmPassword } = form;

    // Basic validation
    if (!firstName || !lastName || !team || !email || !password || !confirmPassword) {
      setError("Please fill out all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    let db = JSON.parse(localStorage.getItem("usersDB")) || usersDB;

    const exists = db.find(u => u.email === email);
    if (exists) return setError("⚠️ Email already exists");

    const newUser = {
      id: Date.now(),
      firstName,
      lastName,
      team,
      email,
      password,
      bills: []
    };

    db.push(newUser);

    localStorage.setItem("usersDB", JSON.stringify(db));

    alert("Account created successfully!");
    navigate("/login");
  };

  return (
    <>
      <div className="flex flex-col items-center mt-10 text-center">
        {/* PAGE HEADING */}
        <h1 className='text-5xl font-bold mt-5'>Sign up for your <span className='text-red-600'>B</span>ill<span className='text-red-600'>Swift</span> accout</h1>

        {/* CARD */}
        <div className="flex flex-col gap-4 items-center border border-green-900/60 bg-white/2 rounded-xl px-6 py-6 w-full max-w-md mt-13">
          <h1 className="text-lg font-bold text-white">
            <span className="text-green-600 font-bold text-lg">S</span>IGN UP
          </h1>

          <p className="text-gray-300 text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-green-600 font-semibold underline hover:text-green-400"
            >
              Login
            </Link>
          </p>

          {/* ERROR BOX */}
          {error && (
            <p className="text-red-500 text-sm bg-red-500/10 border border-red-500/40 rounded px-2 py-1 w-full text-center">
              {error}
            </p>
          )}

          {/* FIRST NAME */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">First Name</label>
            <input
              name="firstName"
              type="text"
              onChange={handleChange}
              placeholder="Enter first name"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            />
          </div>

          {/* LAST NAME */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Last Name</label>
            <input
              name="lastName"
              type="text"
              onChange={handleChange}
              placeholder="Enter last name"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            />
          </div>

          {/* TEAM SELECT */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Team</label>
            <select
              name="team"
              onChange={handleChange}
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            >
              <option value="" disabled selected>Select your team</option>
              <option>Sales</option>
              <option>HR</option>
              <option>Commissioning</option>
            </select>
          </div>

          {/* EMAIL */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Email</label>
            <input
              name="email"
              type="email"
              onChange={handleChange}
              placeholder="Enter your email"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            />
          </div>

          {/* PASSWORD */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Password</label>
            <input
              name="password"
              type="password"
              onChange={handleChange}
              placeholder="Enter password"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="flex flex-col w-full gap-2">
            <label className="text-white text-sm text-start">Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              onChange={handleChange}
              placeholder="Re-enter password"
              className="bg-white/9 border border-white/20 rounded-lg px-3 py-2 text-gray-500 placeholder-gray-500 outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 focus:bg-white focus:text-black"
            />
          </div>

          {/* SIGNUP BUTTON */}
          <button
            onClick={handleSignup}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 hover:text-white active:scale-95 transition duration-150 mt-2 w-32 cursor-pointer"
          >
            <p className='active:scale-95 transition-all duration-150'>Sign Up</p>
          </button>
        </div>
      </div>
    </>
  );
};

export default Signup;