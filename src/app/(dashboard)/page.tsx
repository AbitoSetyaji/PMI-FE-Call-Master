"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import DriverDashboard from "@/components/dashboard/DriverDashboard";
import ReporterDashboard from "@/components/dashboard/ReporterDashboard";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Role-based dashboard rendering
  if (user.role === "admin") {
    return <AdminDashboard user={user} />;
  }

  if (user.role === "driver") {
    return <DriverDashboard user={user} />;
  }

  if (user.role === "reporter") {
    return <ReporterDashboard user={user} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Role tidak dikenali</p>
    </div>
  );
}
