"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { getProductById } from "@/lib/api/products";
import { deleteProduct } from "@/lib/api/products";
import { deleteLocalProduct, getLocalEditsForProduct, isLocallyDeleted } from "@/lib/localProductStore";
import ConfirmDialog from "@/components/ConfirmDialog";
export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setNotFound(false);
      try {
        // If this product was deleted locally earlier in the session, treat it
// as not found — it's "gone" from the user's point of view.
if (isLocallyDeleted(Number(id)) || isLocallyDeleted(id)) {
  setNotFound(true);
  return;
}

       const data = await getProductById(id);
       if (!data || data.message) {
        setNotFound(true);
       } else {
  // Merge any local edits on top of the real API data, so the details
  // page reflects the latest change made in this session.
        const localEdits = getLocalEditsForProduct(Number(id)) || getLocalEditsForProduct(id);
        setProduct(localEdits ? { ...data, ...localEdits } : data);
         }
      } catch (err) {
        // A genuine HTTP error (network issue, real 404, etc.)
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p className="text-gray-500">Loading product...</p>
        </div>
      </ProtectedRoute>
    );
  }
async function handleDelete() {
  if (deleting) return;
  setDeleting(true);
  try {
    // Real API call (DELETE /products/:id) — again, DummyJSON fakes success
    // without actually removing it server-side, so we also mark it deleted locally.
    await deleteProduct(id);
    deleteLocalProduct(Number(id) || id);
    router.push("/products");
  } catch (err) {
    setDeleting(false);
    setShowDeleteConfirm(false);
    // Could show a toast here; keeping it simple with an alert for now
    alert(err.friendlyMessage || "Failed to delete product.");
  }
}
  if (notFound) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
          <h1 className="text-3xl font-semibold text-gray-800">Product not found</h1>
          <p className="text-gray-500">
            We couldn&apos;t find a product with id &quot;{id}&quot;.
          </p>
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
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.push("/products")}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to products
          </button>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* IMAGES */}
          <div>
            <img
              src={product.images?.[activeImage] || product.thumbnail}
              alt={product.title}
              className="w-full h-80 object-contain bg-gray-50 rounded-lg border border-gray-200"
            />
            {product.images && product.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-16 h-16 flex-shrink-0 border-2 rounded ${
                      idx === activeImage ? "border-blue-600" : "border-gray-200"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover rounded" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* DETAILS */}
          <div>
            <h1 className="text-2xl font-semibold mb-1">{product.title}</h1>
            <p className="text-gray-500 capitalize mb-3">{product.category} · {product.brand}</p>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-bold">${product.price}</span>
              <span className="text-yellow-500">⭐ {product.rating}</span>
              <span className={`text-sm px-2 py-1 rounded ${product.stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </span>
            </div>

            <p className="text-gray-700 mb-6">{product.description}</p>

            <div className="flex gap-3">
           <button onClick={() => router.push(`/products/${id}/edit`)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
           Edit
           </button>
           <button onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
             Delete
           </button>
            </div>
          </div>
        </div>

        {/* REVIEWS */}
        {product.reviews && product.reviews.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Reviews</h2>
            <div className="space-y-4">
              {product.reviews.map((review, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{review.reviewerName}</span>
                    <span className="text-yellow-500">⭐ {review.rating}</span>
                  </div>
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ConfirmDialog
  open={showDeleteConfirm}
  title="Delete product?"
  message={`Are you sure you want to delete "${product.title}"? This can't be undone.`}
  onConfirm={handleDelete}
  onCancel={() => setShowDeleteConfirm(false)}
  confirming={deleting}
/>
    </ProtectedRoute>
  );
}