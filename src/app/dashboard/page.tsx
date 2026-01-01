"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi, assignmentsApi, vehiclesApi } from "@/lib/api";
import StatsCard from "@/components/dashboard/StatsCard";
import { FileText, ClipboardList, Truck, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Report, Assignment, Vehicle } from "@/lib/types";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    // Set initial time
    setCurrentTime(new Date());

    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.role === "driver") {
      router.replace("/driver");
    }
  }, [user, router]);
  // Fetch dashboard data
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["reports", { limit: 5 }],
    queryFn: () => reportsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Only Admin and Reporter can access assignments
  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments"],
    queryFn: () => assignmentsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
    enabled: user?.role === "admin" || user?.role === "reporter",
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => vehiclesApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000,
    refetchIntervalInBackground: true,
  });

  // Calculate statistics - handle paginated or array response
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reportsArr = (reportsData as any)?.items || reportsData || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignmentsArr = (assignmentsData as any)?.items || assignmentsData || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any  
  const vehiclesArr = (vehiclesData as any)?.items || vehiclesData || [];

  const totalReports = Array.isArray(reportsArr) ? reportsArr.length : 0;
  const pendingReports = Array.isArray(reportsArr)
    ? reportsArr.filter((r: Report) => r.status === "pending").length
    : 0;
  const activeAssignments =
    user?.role === "admin" || user?.role === "reporter"
      ? (Array.isArray(assignmentsArr)
        ? assignmentsArr.filter(
          (a: Assignment) => a.status === "assigned" || a.status === "on_progress"
        ).length
        : 0)
      : 0;
  const availableVehicles = Array.isArray(vehiclesArr)
    ? vehiclesArr.filter((v: Vehicle) => v.status === "available").length
    : 0;

  // Filter reports to show only relevant statuses (active, assigned, on_progress, completed)
  // Mapping: pending=active, assigned=assigned, on_way/arrived=on_progress, done=completed
  const validStatuses = ["pending", "assigned", "on_way", "arrived_pickup", "arrived_destination", "done"];
  const filteredReports = Array.isArray(reportsArr)
    ? reportsArr.filter((r: Report) => validStatuses.includes(r.status))
    : [];
  const recentReports = filteredReports.slice(0, 5);

  // Format date and time in Indonesian
  const formatIndonesianDate = (date: Date) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${dayName}, ${day} ${month} ${year} • ${hours}:${minutes}:${seconds} WIB`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dasbor</h1>
        <p className="text-gray-600 mt-1">
          Selamat datang di Sistem Panggilan Darurat PMI
        </p>
        <p className="text-sm text-gray-500 mt-2 font-medium">
          🕐 {currentTime ? formatIndonesianDate(currentTime) : '--:--:--'}
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Laporan"
          value={totalReports}
          icon={FileText}
          description={`${pendingReports} menunggu`}
          color="red"
        />
        <StatsCard
          title="Penugasan Aktif"
          value={activeAssignments}
          icon={ClipboardList}
          description="Sedang dalam proses"
          color="blue"
        />
        <StatsCard
          title="Kendaraan Tersedia"
          value={availableVehicles}
          icon={Truck}
          description="Siap dikirim"
          color="green"
        />
        <StatsCard
          title="Status Sistem"
          value="Aktif"
          icon={Activity}
          description="Semua sistem beroperasi"
          color="green"
        />
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Laporan Terbaru
          </h2>
          <Link
            href="/dashboard/reports"
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Lihat Semua →
          </Link>
        </div>

        {loadingReports ? (
          <div className="p-6 text-center text-gray-500">
            Memuat laporan...
          </div>
        ) : recentReports.length === 0 ? (
          <div className="p-6 text-center text-gray-500">Belum ada laporan</div>
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
                      Transport
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
                  {recentReports.map((report: Report) => (
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
                        <div className="text-sm text-gray-900">
                          {report.transport_type_name || '-'}
                        </div>
                        {report.use_stretcher && (
                          <div className="text-sm text-green-600 font-medium">
                            ✓ Keranda
                          </div>
                        )}
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
              {recentReports.map((report: Report) => (
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
                      🚗 {report.transport_type_name || '-'}
                      {report.use_stretcher && (
                        <span className="ml-2 text-green-600 font-medium">✓ Keranda</span>
                      )}
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
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/dashboard/reports/create"
          className="p-6 bg-red-50 border-2 border-red-200 rounded-lg hover:bg-red-100 transition-colors"
        >
          <h3 className="font-semibold text-red-900 mb-2">Buat Laporan Baru</h3>
          <p className="text-sm text-red-700">
            Laporkan insiden darurat baru
          </p>
        </Link>

        {(user?.role === "admin" || user?.role === "reporter") && (
          <Link
            href="/dashboard/assignments/create"
            className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <h3 className="font-semibold text-blue-900 mb-2">
              Buat Penugasan
            </h3>
            <p className="text-sm text-blue-700">
              Tugaskan kendaraan dan driver ke laporan
            </p>
          </Link>
        )}

        <Link
          href="/dashboard/tracking"
          className="p-6 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <h3 className="font-semibold text-green-900 mb-2">Lacak Driver</h3>
          <p className="text-sm text-green-700">
            Lihat lokasi driver secara real-time
          </p>
        </Link>
      </div>
    </div>
  );
}
