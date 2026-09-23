"use client";

import { useAuth } from "@/context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className="text-sm text-red-600 hover:text-red-800 font-medium"
    >
      Logout
    </button>
  );
}