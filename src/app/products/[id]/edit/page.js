"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { getProductById, updateProduct } from "@/lib/api/products";
import Loader from "@/components/Loader";
import {
  editLocalProduct,
  getLocalEditsForProduct,
  getLocalAddedProductById,
  updateLocalAddedProduct,
} from "@/lib/localProductStore";

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = "Title is required.";
  if (!form.category.trim()) errors.category = "Category is required.";
  if (!form.price || Number(form.price) <= 0) errors.price = "Enter a valid price greater than 0.";
  if (form.stock === "" || Number(form.stock) < 0) errors.stock = "Enter a valid stock quantity (0 or more).";
  if (!form.description.trim()) errors.description = "Description is required.";
  return errors;
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [form, setForm] = useState(null); // null while loading
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  useEffect(() => {
    async function loadProduct() {
  setLoading(true);
  try {
    // Locally-added products only exist in localStorage — check there first.
    const localAdded = getLocalAddedProductById(id);
    if (localAdded) {
      setForm({
        title: localAdded.title || "",
        category: localAdded.category || "",
        price: localAdded.price ?? "",
        stock: localAdded.stock ?? "",
        description: localAdded.description || "",
        thumbnail: localAdded.thumbnail || "",
      });
      return;
    }

    const data = await getProductById(id);
    if (!data || data.message) {
      setNotFound(true);
      return;
    }

    const localEdits = getLocalEditsForProduct(Number(id)) || getLocalEditsForProduct(id);
    const merged = { ...data, ...localEdits };

    setForm({
      title: merged.title || "",
      category: merged.category || "",
      price: merged.price ?? "",
      stock: merged.stock ?? "",
      description: merged.description || "",
      thumbnail: merged.thumbnail || "",
    });
  } catch (err) {
    setNotFound(true);
  } finally {
    setLoading(false);
  }
}
    loadProduct();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;

    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const changes = {
        title: form.title.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description.trim(),
        thumbnail: form.thumbnail.trim(),
      };

      // Real API call (PUT /products/:id) — DummyJSON responds with a fake
      // "updated" object but doesn't persist it, so we also save the change
      // locally to make it stick in our own app.
    const localAdded = getLocalAddedProductById(id);
if (localAdded) {
  // This product only exists locally — update it directly, no real API call needed.
  updateLocalAddedProduct(id, changes);
} else {
  // Real DummyJSON product — call the real API, then save the change locally too.
  await updateProduct(id, changes);
  editLocalProduct(Number(id) || id, changes);
}

      router.push(`/products/${id}`);
    } catch (err) {
      setSubmitError(err.friendlyMessage || "Failed to update product.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader label="Loading product..." />
        </div>
      </ProtectedRoute>
    );
  }

  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Product not found</h1>
          <button
            onClick={() => router.push("/products")}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to products
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => router.push(`/products/${id}`)} className="text-blue-600 hover:underline text-sm">
            ← Back to product
          </button>
          <LogoutButton />
        </div>

        <h1 className="text-2xl font-semibold mb-6">Edit Product</h1>

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
            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
            <input
              name="thumbnail"
              value={form.thumbnail}
              onChange={handleChange}
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
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}