"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";

interface FeaturedProduct {
  id: string;
  shopifyProductId: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<FeaturedProduct[]>([]); // ✅ Initialize with empty array
  const [newProductId, setNewProductId] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [adminSecret, setAdminSecret] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminSecret}`,
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products", { headers });
      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await response.json();
      
      // ✅ Ensure products is always an array
      setProducts(data.products || []);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Fetch products error:", err);
      setError("Failed to fetch products");
      setProducts([]); // ✅ Set to empty array on error
    }
  };

  const addProduct = async () => {
    if (!newProductId) {
      setError("Please enter a product ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers,
        body: JSON.stringify({
          shopifyProductId: newProductId,
          displayOrder,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add product");
        setLoading(false);
        return;
      }

      alert("✅ Product added successfully!");
      setNewProductId("");
      setDisplayOrder(0);
      fetchProducts();
    } catch (err) {
      console.error("Add product error:", err);
      setError("Failed to add product. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers,
      });
      
      if (response.ok) {
        fetchProducts();
      } else {
        setError("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      setError("Failed to delete product");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          id,
          isActive: !currentStatus,
        }),
      });
      
      if (response.ok) {
        fetchProducts();
      } else {
        setError("Failed to update product");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      setError("Failed to update product");
    }
  };

  const handleLogin = () => {
    fetchProducts();
  };

  const ProductIdHelper = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-blue-500/20 border border-blue-500 text-blue-200 p-4 rounded-lg mb-6"
    >
      <h3 className="font-bold mb-2">📝 How to find your Shopify Product ID:</h3>
      <ol className="list-decimal list-inside space-y-2 text-sm">
        <li>Go to your Shopify Admin → Products</li>
        <li>Click on a product</li>
        <li>Look at the URL: <code className="bg-black/30 px-2 py-1 rounded">admin.shopify.com/store/YOUR-STORE/products/[THIS-NUMBER]</code></li>
        <li>Copy that number (e.g., <code className="bg-black/30 px-2 py-1 rounded">1234567890</code>)</li>
      </ol>
      <p className="mt-2 text-xs">
        Example: If URL is <code className="bg-black/30 px-2 py-1 rounded">.../products/8675309</code>, use <strong>8675309</strong>
      </p>
      <p className="mt-3 text-xs text-yellow-300">
        ⚠️ Note: Products are added immediately without validation. Make sure the ID is correct!
      </p>
    </motion.div>
  );

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#2b1e1e] p-8 rounded-xl border border-[#e2c299]/30 max-w-md w-full"
        >
          <h1 className="text-[#e2c299] text-3xl font-bold mb-6 text-center">
            Admin Login
          </h1>
          <input
            type="password"
            placeholder="Enter admin secret"
            value={adminSecret}
            onChange={(e) => setAdminSecret(e.target.value)}
            className="w-full p-3 bg-[#1a0f0b] text-white border border-[#e2c299]/30 rounded-lg mb-4"
            onKeyPress={(e) => e.key === "Enter" && handleLogin()}
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogin}
            className="w-full bg-[#e2c299] text-black py-3 rounded-lg font-bold"
          >
            Login
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-[#e2c299] text-4xl font-bold mb-8">
          Manage Featured Products
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <ProductIdHelper />

        {/* Add Product Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2b1e1e] p-6 rounded-xl border border-[#e2c299]/30 mb-8"
        >
          <h2 className="text-[#e2c299] text-2xl font-bold mb-4">
            Add New Product
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Shopify Product ID (numeric)"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              className="p-3 bg-[#1a0f0b] text-white border border-[#e2c299]/30 rounded-lg"
            />
            <input
              type="number"
              placeholder="Display Order"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
              className="p-3 bg-[#1a0f0b] text-white border border-[#e2c299]/30 rounded-lg"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addProduct}
              disabled={loading}
              className="bg-[#e2c299] text-black py-3 rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaPlus /> {loading ? "Adding..." : "Add Product"}
            </motion.button>
          </div>
          <p className="text-gray-400 text-sm mt-2">
            💡 Tip: Get the numeric Product ID from your Shopify admin URL
          </p>
        </motion.div>

        {/* Products List */}
        <div className="space-y-4">
          {!products || products.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No products added yet. Add your first product above!
            </p>
          ) : (
            products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#2b1e1e] p-6 rounded-xl border border-[#e2c299]/30 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-lg font-bold">
                    Product ID: {product.shopifyProductId}
                  </p>
                  <p className="text-gray-400 text-sm">
                    Order: {product.displayOrder} | Status:{" "}
                    <span
                      className={
                        product.isActive ? "text-green-400" : "text-red-400"
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleActive(product.id, product.isActive)}
                    className="p-3 bg-[#1a0f0b] text-[#e2c299] rounded-lg"
                  >
                    {product.isActive ? <FaEyeSlash /> : <FaEye />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => deleteProduct(product.id)}
                    className="p-3 bg-red-500/20 text-red-400 rounded-lg"
                  >
                    <FaTrash />
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}