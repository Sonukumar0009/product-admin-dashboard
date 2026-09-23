import api from "@/lib/axios";

export async function getProducts({ limit = 10, skip = 0, sortBy, order } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }
  const response = await api.get("/products", { params });
  return response.data;
}

export async function searchProducts({ query, limit = 10, skip = 0, sortBy, order } = {}) {
  const params = { q: query, limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }
  const response = await api.get("/products/search", { params });
  return response.data;
}

// Products filtered by category — a completely separate endpoint from search.
export async function getProductsByCategory({ category, limit = 10, skip = 0, sortBy, order } = {}) {
  const params = { limit, skip };
  if (sortBy) {
    params.sortBy = sortBy;
    params.order = order || "asc";
  }
  const response = await api.get(`/products/category/${category}`, { params });
  return response.data;
}
// Fetches one product by id, for the details page.
export async function getProductById(id) {
  const response = await api.get(`/products/${id}`);
  return response.data;
}
// List of all available categories, for the filter dropdown.
export async function getCategories() {
  const response = await api.get("/products/categories");
  return response.data; // array of { slug, name, url }
}
export async function addProduct(product) {
  const response = await api.post("/products/add", product);
  return response.data;
}
export async function updateProduct(id, changes) {
  const response = await api.put(`/products/${id}`, changes);
  return response.data;
}
export async function deleteProduct(id) {
  const response = await api.delete(`/products/${id}`);
  return response.data;
}