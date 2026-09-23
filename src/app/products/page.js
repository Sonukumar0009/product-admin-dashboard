"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/context/AuthContext";

export default function ProductsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Welcome, {user?.firstName}</h1>
          <LogoutButton />
        </div>
        <p className="text-gray-600">Product list will go here.</p>
      </div>
    </ProtectedRoute>
  );
}