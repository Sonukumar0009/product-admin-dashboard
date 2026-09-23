import api from "@/lib/axios";

// Fetches a page of products.
// limit/skip power our pagination (see assignment: "load data page by page using limit and skip")
export async function getProducts({ limit = 10, skip = 0 } = {}) {
  const response = await api.get("/products", {
    params: { limit, skip },
  });
  return response.data; // { products, total, skip, limit }
}