import axios from "axios";

// One shared Axios instance for the whole app.
// Every API call file will import this instead of calling axios directly.
const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000, // fail fast instead of hanging forever
});

// REQUEST INTERCEPTOR
// Runs before every request leaves the app.
// We attach the saved login token here so we don't have to
// manually add it in every single API call.
api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    // Something went wrong building the request itself (rare)
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
// Runs after every response comes back (success or failure).
// This is our single place to handle errors, instead of writing
// try/catch error-handling logic in every component.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      // Token expired or invalid -> force logout and send to login
      if (status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }

      // Attach a clean, readable message every component can use
      error.friendlyMessage =
        error.response.data?.message || "Something went wrong. Please try again.";
    } else if (error.request) {
      // Request was sent but no response came back (network issue, API down)
      error.friendlyMessage = "Network error. Please check your connection.";
    } else {
      error.friendlyMessage = "Unexpected error. Please try again.";
    }

    return Promise.reject(error);
  }
);

export default api;