"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
} from "@/lib/api/products";
const VALID_PAGE_SIZES = [10, 20, 50];
const SORT_OPTIONS = [
  { value: "", label: "Default" },
  { value: "title-asc", label: "Title (A–Z)" },
  { value: "title-desc", label: "Title (Z–A)" },
  { value: "price-asc", label: "Price (Low–High)" },
  { value: "price-desc", label: "Price (High–Low)" },
  { value: "rating-asc", label: "Rating (Low–High)" },
  { value: "rating-desc", label: "Rating (High–Low)" },
];

function parsePage(value) {
  const parsed = parseInt(value, 10);
  if (!value || isNaN(parsed) || parsed < 1) return 1;
  return parsed;
}

function parsePageSize(value) {
  const parsed = parseInt(value, 10);
  if (VALID_PAGE_SIZES.includes(parsed)) return parsed;
  return 10;
}

export default function ProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = parsePage(searchParams.get("page"));
  const pageSize = parsePageSize(searchParams.get("pageSize"));
  const urlSearch = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sortBy = searchParams.get("sortBy") || "";
  const order = searchParams.get("order") || "asc";

  const [searchInput, setSearchInput] = useState(urlSearch);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const requestIdRef = useRef(0);

  function updateParams(newParams) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    router.push(`/products?${params.toString()}`);
  }

  // Load categories once, for the filter dropdown
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([])); // non-critical, fail silently
  }, []);

  // Debounced search -> URL. Typing a search term also CLEARS any active category
  // (our Option A decision: search overrides category, since the API can't do both).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== urlSearch) {
        const updates = { search: searchInput, page: 1 };
        if (searchInput) {
          updates.category = ""; // clear category the moment a real search term is typed
        }
        updateParams(updates);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function changeCategory(newCategory) {
    // Selecting a category clears any active search (mirrors the same rule both ways)
    setSearchInput("");
    updateParams({ category: newCategory, search: "", page: 1 });
  }

  function changeSort(value) {
    if (!value) {
      updateParams({ sortBy: "", order: "", page: 1 });
      return;
    }
    const [field, dir] = value.split("-");
    updateParams({ sortBy: field, order: dir, page: 1 });
  }

  async function loadProducts() {
    setLoading(true);
    setError("");
    const currentRequestId = ++requestIdRef.current;

    try {
      const skip = (page - 1) * pageSize;
      const sortParams = sortBy ? { sortBy, order } : {};

      let data;
      if (urlSearch) {
        data = await searchProducts({ query: urlSearch, limit: pageSize, skip, ...sortParams });
      } else if (category) {
        data = await getProductsByCategory({ category, limit: pageSize, skip, ...sortParams });
      } else {
        data = await getProducts({ limit: pageSize, skip, ...sortParams });
      }

      if (currentRequestId !== requestIdRef.current) return;

      const lastValidPage = Math.max(1, Math.ceil(data.total / pageSize));
      if (data.products.length === 0 && data.total > 0 && page > lastValidPage) {
        updateParams({ page: lastValidPage });
        return;
      }

      setProducts(data.products);
      setTotal(data.total);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err.friendlyMessage || "Failed to load products.");
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, urlSearch, category, sortBy, order]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const showingTo = Math.min(page * pageSize, total);

  function goToPage(newPage) {
    if (newPage < 1 || newPage > totalPages) return;
    updateParams({ page: newPage });
  }

  function changePageSize(newSize) {
    updateParams({ pageSize: newSize, page: 1 });
  }

  const currentSortValue = sortBy ? `${sortBy}-${order}` : "";

  return (
    <ProtectedRoute>
      <div className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-semibold">Welcome, {user?.firstName}</h1>
          <LogoutButton />
        </div>

        {/* SEARCH + FILTER + SORT CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products..."
            className="w-full sm:w-64 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={category}
            onChange={(e) => changeCategory(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            <option value="">All categories</option>
            {categories.map((cat) => {
              const slug = typeof cat === "string" ? cat : cat.slug;
              const name = typeof cat === "string" ? cat : cat.name;
              return (
                <option key={slug} value={slug}>
                  {name}
                </option>
              );
            })}
          </select>

          <select
            value={currentSortValue}
            onChange={(e) => changeSort(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <p className="text-gray-500">Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-3">
            <p className="text-red-600">{error}</p>
            <button onClick={loadProducts} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="flex justify-center py-16">
            <p className="text-gray-500">No products found.</p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Image</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Title</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Category</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Price</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Rating</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                   <tr key={product.id} onClick={() => router.push(`/products/${product.id}`)}
                      className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3">
                        <img src={product.thumbnail} alt={product.title} className="w-12 h-12 object-cover rounded" />
                      </td>
                      <td className="px-4 py-3 font-medium">{product.title}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{product.category}</td>
                      <td className="px-4 py-3">${product.price}</td>
                      <td className="px-4 py-3">⭐ {product.rating}</td>
                      <td className="px-4 py-3">{product.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {products.map((product) => (
                <div key={product.id} onClick={() => router.push(`/products/${product.id}`)}
                       className="bg-white border border-gray-200 rounded-lg p-4 flex gap-3 cursor-pointer hover:bg-gray-50">
                  <img src={product.thumbnail} alt={product.title} className="w-16 h-16 object-cover rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                    <div className="flex justify-between mt-1 text-sm">
                      <span className="font-medium">${product.price}</span>
                      <span>⭐ {product.rating}</span>
                      <span className="text-gray-500">Stock: {product.stock}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>Showing {showingFrom}–{showingTo} of {total}</span>
                <select
                  value={pageSize}
                  onChange={(e) => changePageSize(Number(e.target.value))}
                  className="border border-gray-300 rounded px-2 py-1"
                >
                  {VALID_PAGE_SIZES.map((size) => (
                    <option key={size} value={size}>{size} / page</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button onClick={() => goToPage(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, idx, arr) => (
                    <span key={p} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-gray-400">…</span>}
                      <button
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1 border rounded ${p === page ? "bg-blue-600 text-white border-blue-600" : "hover:bg-gray-50"}`}
                      >
                        {p}
                      </button>
                    </span>
                  ))}
                <button onClick={() => goToPage(page + 1)} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}