import Navbar from "./components/Navbar";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import AddBill from "./pages/AddBill";
import ViewBills from "./pages/ViewBills";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Footer from "./components/Footer";
import Account from "./pages/Account";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PendingUsers from "./pages/admin/PendingUsers";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import BillsAdmin from "./pages/admin/BillsAdmin";
import AdminSettings from "./pages/admin/AdminSettings";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import ComponentsAdmin from "./pages/admin/ComponentsAdmin";

const App = () => {
  return (
    <div className="mx-auto px-5 top-5">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add-bill" element={<ProtectedRoute><AddBill /></ProtectedRoute>} />
        <Route path="/view-bills" element={<ProtectedRoute><ViewBills /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute >} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/pending-users"
          element={
            <ProtectedRoute requiredRole="admin">
              <PendingUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute requiredRole="admin">
              <ProductsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/bills"
          element={
            <ProtectedRoute requiredRole="admin">
              <BillsAdmin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminSettings />
            </ProtectedRoute>
          }
        />
        <Route path='/unauthorized' element={<Unauthorized />} />
        <Route path="/admin/components" element={<ProtectedRoute requiredRole="admin"><ComponentsAdmin /></ProtectedRoute>} />

      </Routes>
      <Footer />
    </div>
  );
};

export default App;
