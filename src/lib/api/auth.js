import api from "@/lib/axios";

// Talks to DummyJSON's login endpoint.
// Kept in its own file so components never call axios directly —
// this satisfies the "put API calls in separate files" rule.
export async function loginUser(username, password) {
  const response = await api.post("/auth/login", {
    username,
    password,
  });
  return response.data; // contains accessToken, id, username, etc.
}