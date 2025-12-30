"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { reportsApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Search, Filter, Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import type { ReportStatus } from "@/lib/types";

export default function ReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // All hooks must be called at the top, before any conditional returns
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ReportStatus | "all">("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch reports with filters
  const { data, isLoading, error } = useQuery({
    queryKey: [
      "reports",
      {
        skip: (page - 1) * limit,
        limit,
        status: statusFilter !== "all" ? statusFilter : undefined,
      },
    ],
    queryFn: () => reportsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds for real-time updates
    refetchIntervalInBackground: true,
    enabled: !authLoading && (user?.role === "admin" || user?.role === "reporter"),
  });

  useEffect(() => {
    // Only Admin and Reporter can access reports management
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

  // Client-side filtering for search (since API doesn't support these filters)
  const reports = data || [];
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      search === "" ||
      report.requester_name.toLowerCase().includes(search.toLowerCase()) ||
      report.patient_name.toLowerCase().includes(search.toLowerCase()) ||
      report.pickup_address.toLowerCase().includes(search.toLowerCase()) ||
      report.destination_address
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      report.requester_phone.includes(search);

    return matchesSearch;
  });

  const totalPages = Math.ceil(reports.length / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Laporan Darurat
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola dan lacak semua laporan darurat
          </p>
        </div>
        <Link
          href="/dashboard/reports/create"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Laporan Baru
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cari
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Pemohon, pasien, telepon, atau alamat..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as ReportStatus | "all")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="pending">Menunggu</option>
              <option value="assigned">Ditugaskan</option>
              <option value="on_way">Dalam Perjalanan</option>
              <option value="arrived_pickup">Tiba di Lokasi Jemput</option>
              <option value="arrived_destination">Tiba di Tujuan</option>
              <option value="done">Selesai</option>
              <option value="canceled">Dibatalkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">
            Memuat laporan...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Gagal memuat laporan
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Tidak ada laporan ditemukan</div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pemohon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasien
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rute
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jadwal
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
                  {filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.requester_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.requester_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.patient_gender === "male" ? "♂" : "♀"}{" "}
                          {report.patient_age} tahun
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs">
                          <div className="truncate">
                            📍 {report.pickup_address}
                          </div>
                          <div className="truncate text-gray-500">
                            🏥 {report.destination_address}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {report.schedule_date}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.schedule_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={report.status}>{report.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <Link
                          href={`/dashboard/reports/${report.id}`}
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
              {filteredReports.map((report) => (
                <Link
                  key={report.id}
                  href={`/dashboard/reports/${report.id}`}
                  className="block p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {report.requester_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {report.requester_phone}
                      </p>
                    </div>
                    <Badge variant={report.status}>{report.status}</Badge>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-700">
                        Pasien:
                      </span>{" "}
                      <span className="text-gray-900">
                        {report.patient_name}
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({report.patient_gender === "male" ? "♂" : "♀"}{" "}
                        {report.patient_age} thn)
                      </span>
                    </div>

                    <div className="text-sm text-gray-600">
                      <div className="truncate">
                        📍 Dari: {report.pickup_address}
                      </div>
                      <div className="truncate">
                        🏥 Ke: {report.destination_address}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      📅 {report.schedule_date} pukul {report.schedule_time}
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">
                    Dibuat: {formatDateTime(report.created_at)}
                  </p>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-sm text-gray-700">
                    Halaman {page} dari {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
