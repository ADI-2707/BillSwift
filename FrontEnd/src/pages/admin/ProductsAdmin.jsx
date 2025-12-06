import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../api/base";
import Sidebar from "../../components/admin/Sidebar";
import AdminNavbar from "../../components/admin/AdminNavbar";

const ProductsAdmin = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    device_name: "",
    brand_name: "",
    model: "",
    rating: "",
    price: ""
  });

  const token = localStorage.getItem("token");

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${API_URL}/products`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        setError("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleChange = (e) => {
    setNewProduct({ ...newProduct, [e.target.name]: e.target.value });
  };

  const addProduct = async () => {
    try {
      const res = await axios.post(`${API_URL}/products`, newProduct, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts([...products, res.data]); // show immediately
      setNewProduct({
        device_name: "",
        brand_name: "",
        model: "",
        rating: "",
        price: ""
      });
      alert("Product added successfully!");
    } catch (err) {
      alert("Adding product failed!");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      alert("Delete failed!");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <AdminNavbar />

        <div className="p-6 text-lg">

          <h2 className="text-2xl font-bold mb-4">Product Management</h2>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {loading && <p>Loading products...</p>}

          {/* Add Product Form */}
          <div className="mb-6 bg-white/10 p-4 rounded">
            <h3 className="font-bold mb-3">Add New Product</h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                name="device_name"
                placeholder="Device Name"
                value={newProduct.device_name}
                onChange={handleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
              <input
                name="brand_name"
                placeholder="Brand"
                value={newProduct.brand_name}
                onChange={handleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
              <input
                name="model"
                placeholder="Model"
                value={newProduct.model}
                onChange={handleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
              <input
                name="rating"
                placeholder="Rating (kW)"
                value={newProduct.rating}
                onChange={handleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
              <input
                name="price"
                placeholder="Price"
                type="number"
                value={newProduct.price}
                onChange={handleChange}
                className="bg-white/20 px-3 py-2 rounded outline-none"
              />
            </div>

            <button
              onClick={addProduct}
              className="mt-4 bg-green-600 px-4 py-2 rounded"
            >
              Add Product
            </button>
          </div>

          {/* Products Table */}
          <table className="w-full border border-gray-800 text-sm mt-4">
            <thead className="bg-gray-800">
              <tr>
                <th className="p-2 text-left">Device</th>
                <th className="p-2 text-left">Brand</th>
                <th className="p-2 text-left">Model</th>
                <th className="p-2 text-left">Rating</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gray-700">
                  <td className="p-2">{p.device_name}</td>
                  <td className="p-2">{p.brand_name}</td>
                  <td className="p-2">{p.model}</td>
                  <td className="p-2">{p.rating}</td>
                  <td className="p-2">₹{p.price}</td>
                  <td className="p-2">
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="px-2 py-1 bg-red-600 rounded text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </div>
  );
};

export default ProductsAdmin;