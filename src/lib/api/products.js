import api from "@/lib/axios";

export async function getProducts({ limit = 10, skip = 0 } = {}) {
  const response = await api.get("/products", {
    params: { limit, skip },
  });
  return response.data;
}

// Separate endpoint DummyJSON provides for search.
// Kept as its own function so the calling code can decide
// whether to search or browse normally.
export async function searchProducts({ query, limit = 10, skip = 0 } = {}) {
  const response = await api.get("/products/search", {
    params: { q: query, limit, skip },
  });
  return response.data;
}