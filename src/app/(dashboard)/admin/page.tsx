"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { reportsApi, assignmentsApi, vehiclesApi } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";
import { FileText, ClipboardList, Truck, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Report, Assignment, Vehicle } from "@/lib/types";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only admin can access this page
    if (!isLoading && user?.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return null;
  }
  // Fetch dashboard data
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["reports", { limit: 5 }],
    queryFn: () => reportsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => assignmentsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  });

  // Calculate statistics
  const reportsArr = (reportsData as Report[]) || [];
  const assignmentsArr = (assignmentsData as Assignment[]) || [];
  const vehiclesArr = vehiclesData?.data || [];

  const totalReports = reportsArr.length;
  const pendingReports = reportsArr.filter((r: Report) => r.status === "pending").length;
  const activeAssignments = assignmentsArr.filter(
    (a: Assignment) => a.status === "assigned" || a.status === "on_progress"
  ).length;
  const availableVehicles = vehiclesArr.filter((v: Vehicle) => v.status === "available").length;

  const recentReports = reportsArr.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Welcome to PMI Emergency Call System
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Reports"
          value={totalReports}
          icon={FileText}
          description={`${pendingReports} pending`}
          color="red"
        />
        <StatsCard
          title="Active Assignments"
          value={activeAssignments}
          icon={ClipboardList}
          description="Currently in progress"
          color="blue"
        />
        <StatsCard
          title="Available Vehicles"
          value={availableVehicles}
          icon={Truck}
          description="Ready for dispatch"
          color="green"
        />
        <StatsCard
          title="System Status"
          value="Active"
          icon={Activity}
          description="All systems operational"
          color="green"
        />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Reports
          </h2>
          <Link
            href="/dashboard/reports"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            View All →
          </Link>
        </div>

        <div className="divide-y divide-gray-200">
          {loadingReports ? (
            <div className="p-6 text-center text-gray-500">
              Loading reports...
            </div>
          ) : recentReports.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No reports yet</div>
          ) : (
            recentReports.map((report: Report) => (
              <Link
                key={report.id}
                href={`/dashboard/reports/${report.id}`}
                className="block p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {report.requester_name}
                      </h3>
                      <Badge variant={report.status}>{report.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      📞 {report.requester_phone}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {report.pickup_address}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {formatDateTime(report.created_at)}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/reports/create"
          className="p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <h3 className="font-semibold text-red-900 mb-2">Create New Report</h3>
          <p className="text-sm text-red-700">
            Report a new emergency incident
          </p>
        </Link>

        <Link
          href="/dashboard/assignments/create"
          className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <h3 className="font-semibold text-blue-900 mb-2">
            Create Assignment
          </h3>
          <p className="text-sm text-blue-700">
            Assign vehicle and driver to report
          </p>
        </Link>

        <Link
          href="/dashboard/tracking"
          className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="font-semibold text-green-900 mb-2">Track Drivers</h3>
          <p className="text-sm text-green-700">
            View real-time driver locations
          </p>
        </Link>
      </div>
    </div>
  );
}
