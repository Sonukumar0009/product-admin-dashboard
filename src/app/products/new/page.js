"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { addProduct } from "@/lib/api/products";
import { addLocalProduct } from "@/lib/localProductStore";

const initialForm = {
  title: "",
  category: "",
  price: "",
  stock: "",
  description: "",
  thumbnail: "",
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (!form.price || Number(form.price) <= 0) errors.price = "Enter a valid price greater than 0.";
  if (form.stock === "" || Number(form.stock) < 0) errors.stock = "Enter a valid stock quantity (0 or more).";
  if (!form.description.trim()) errors.description = "Description is required.";
  return errors;
}

export default function AddProductPage() {
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const submittingRef = useRef(false); // guards against double-submit from fast double-clicks
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear the field's error as soon as the user edits it, so
    // the error doesn't linger after they've fixed the problem.
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (submittingRef.current) return; // ignore rapid repeat clicks
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const newProduct = {
        title: form.title.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim(),
        thumbnail: form.thumbnail.trim() || "https://placehold.co/300x300?text=No+Image",
        rating: 0,
        images: form.thumbnail.trim() ? [form.thumbnail.trim()] : [],
        reviews: [],
      };

      // Call the real API endpoint (POST /products/add).
      // DummyJSON responds with a fake success object but doesn't actually
      // save it — so we also save it locally to make it show up in our app.
      await addProduct(newProduct);
      addLocalProduct(newProduct);

      router.push("/products");
    } catch (err) {
      setSubmitError(err.friendlyMessage || "Failed to add product.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push("/products")} className="text-blue-600 hover:underline text-sm">
            ← Back to products
          </button>
          <LogoutButton />
        </div>

        <h1 className="text-2xl font-semibold mb-6">Add Product</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. beauty, furniture"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.category && <p className="text-red-600 text-sm mt-1">{errors.category}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                name="price"
                type="number"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              {errors.stock && <p className="text-red-600 text-sm mt-1">{errors.stock}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL (optional)</label>
            <input
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
          </div>

          {submitError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded px-3 py-2">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white rounded py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Add Product"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}