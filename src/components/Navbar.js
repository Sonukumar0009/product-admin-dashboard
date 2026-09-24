"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar({ showAddButton = false }) {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Brand / logo */}
        <div
          onClick={() => router.push("/products")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            P
          </div>
          <span className="font-semibold text-gray-900 hidden sm:block">
            Product Admin
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {showAddButton && (
            <button
              onClick={() => router.push("/products/new")}
              className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 text-sm font-medium transition-colors"
            >
              + Add Product
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-700">
              {user?.firstName?.[0] || "U"}
            </div>
            <span className="text-sm text-gray-700 font-medium">
              {user?.firstName}
            </span>
          </div>

          <button
            onClick={logout}
            className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}