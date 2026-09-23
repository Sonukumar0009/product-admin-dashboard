"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check localStorage on first load
  const router = useRouter();

  // On first app load, check if a token is already saved
  // so a page refresh doesn't log the user out.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  async function login(username, password) {
    const data = await loginUser(username, password);
    // DummyJSON returns the token as "accessToken"
    localStorage.setItem("token", data.accessToken);
    localStorage.setItem("user", JSON.stringify(data));
    setUser(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Small hook so components can just do: const { user, login, logout } = useAuth();
export function useAuth() {
  return useContext(AuthContext);
}