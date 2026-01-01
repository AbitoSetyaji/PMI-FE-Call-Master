"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { assignmentsApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Filter, Plus } from "lucide-react";
import { formatDateTime, generateReportDisplayId } from "@/lib/utils";
import Link from "next/link";
import type { AssignmentStatus } from "@/lib/types";

export default function AssignmentsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // All hooks must be called at the top, before any conditional returns
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "all">(
    "all"
  );

  // Fetch assignments
  const { data, isLoading, error } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => assignmentsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
    enabled: !authLoading && (user?.role === "admin" || user?.role === "reporter"),
  });

  useEffect(() => {
    // Only Admin and Reporter can access assignments management
    if (!authLoading && user?.role !== "admin" && user?.role !== "reporter") {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin" && user?.role !== "reporter") {
    return null;
  }

  // Get assignments data
  const assignmentsList = data || [];

  // Filter assignments by status
  const filteredAssignments = assignmentsList.filter((assignment) => {
    return statusFilter === "all" || assignment.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Penugasan</h1>
          <p className="text-gray-600 mt-1">
            Kelola penugasan kendaraan dan driver
          </p>
        </div>
        <Link
          href="/dashboard/assignments/create"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Penugasan Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AssignmentStatus | "all")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="active">Aktif</option>
              <option value="assigned">Ditugaskan</option>
              <option value="on_progress">Dalam Proses</option>
              <option value="completed">Selesai</option>
              <option value="cancelled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Memuat penugasan...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Gagal memuat penugasan
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {statusFilter === "all"
              ? "Tidak ada penugasan ditemukan"
              : `Tidak ada penugasan ${statusFilter} ditemukan`}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Laporan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemohon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jadwal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transport
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver / Kendaraan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900 font-mono text-xs">
                            {assignment.report
                              ? generateReportDisplayId(
                                assignment.report.transport_type_name,
                                assignment.report.schedule_date,
                                assignment.report.schedule_time
                              )
                              : assignment.report_id.substring(0, 8) + "..."
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.report?.requester_name || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.report?.requester_phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.report?.schedule_date || "-"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.report?.schedule_time || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {assignment.report?.transport_type_name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.driver_name || "Tidak diketahui"}
                        </div>
                        <div className="text-sm text-gray-500">
                          🚗 {assignment.vehicle_plate || "Tidak ada kendaraan"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={assignment.status}>
                          {assignment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/dashboard/assignments/${assignment.id}`}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Lihat Detail
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <Link
                  key={assignment.id}
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 font-mono text-xs">
                        Laporan: {assignment.report
                          ? generateReportDisplayId(
                            assignment.report.transport_type_name,
                            assignment.report.schedule_date,
                            assignment.report.schedule_time
                          )
                          : assignment.report_id.substring(0, 8) + "..."
                        }
                      </h3>
                    </div>
                    <Badge variant={assignment.status}>
                      {assignment.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                    <div>
                      <span className="text-gray-500">Kendaraan:</span>
                      <p className="font-medium text-gray-900">
                        {assignment.vehicle_plate || "Tidak ada kendaraan"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Driver:</span>
                      <p className="font-medium text-gray-900">
                        {assignment.driver_name || "Tidak diketahui"}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Ditugaskan: {formatDateTime(assignment.assigned_at)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Diperbarui: {assignment.updated_at ? formatDateTime(assignment.updated_at) : "-"}
                  </p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
