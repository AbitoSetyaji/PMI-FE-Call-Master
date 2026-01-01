"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, assignmentsApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  MapPin,
  Phone,
  User,
  Calendar,
  FileText,
  Edit,
} from "lucide-react";
import { formatDateTime, generateReportDisplayId } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { ReportStatus } from "@/lib/types";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const { id } = use(params);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isReporter = user?.role === "reporter";
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch report details
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["report", id],
    queryFn: () => reportsApi.getById(id),
  });

  // Fetch assignment for this report (if any)
  const { data: assignmentsData } = useQuery({
    queryKey: ["assignments", { report_id: id }],
    queryFn: () => assignmentsApi.getAll(),
    enabled: !!report,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const assignment = assignmentsData?.find((a: any) => a.report_id === id);

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: ReportStatus) =>
      reportsApi.updateReportStatus(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report", id] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report status updated successfully");
      setIsUpdatingStatus(false);
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to update status"
      );
      setIsUpdatingStatus(false);
    },
  });

  const handleStatusChange = (status: ReportStatus) => {
    if (confirm(`Are you sure you want to change status to "${status}"?`)) {
      setIsUpdatingStatus(true);
      updateStatusMutation.mutate(status);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report details...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error
            ? `Error: ${error instanceof Error
              ? error.message
              : "Failed to load report details"
            }`
            : "Report not found"}
        </p>
        <Link
          href="/dashboard/reports"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          ← Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Detail Laporan</h1>
            <p className="text-gray-600 mt-1">ID Laporan: {generateReportDisplayId(report.transport_type_name, report.schedule_date, report.schedule_time)}</p>
          </div>
        </div>
        {(isAdmin || isReporter) && (
          <Link
            href={`/dashboard/reports/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Edit className="w-5 h-5" />
            Edit
          </Link>
        )}
      </div>

      {/* Status */}
      <div className="flex gap-3">
        <Badge variant={report.status}>{report.status}</Badge>
        {report.use_stretcher && <Badge variant="info">Butuh Keranda</Badge>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Requester Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Informasi Pemohon
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium text-gray-900">
                    {report.requester_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nomor Telepon</p>
                  <a
                    href={`tel:${report.requester_phone}`}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    {report.requester_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Transport Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Informasi Transportasi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Jenis Transportasi</p>
                <p className="font-medium text-gray-900">
                  {report.transport_type_name
                    ? report.transport_type_name
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Butuh Keranda</p>
                <p className="font-medium text-gray-900">
                  {report.use_stretcher ? "✓ Ya" : "✗ Tidak"}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Informasi Pasien
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Nama Pasien</p>
                <p className="font-medium text-gray-900">
                  {report.patient_name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Jenis Kelamin</p>
                <p className="font-medium text-gray-900">
                  {report.patient_gender === "male" ? "♂ Laki-laki" : "♀ Perempuan"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Usia</p>
                <p className="font-medium text-gray-900">
                  {report.patient_age} tahun
                </p>
              </div>
              {report.patient_history && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Riwayat Medis</p>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.patient_history}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pickup & Destination */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-600" />
              Lokasi Jemput & Tujuan
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">📍 Alamat Jemput</p>
                <p className="font-medium text-gray-900">
                  {report.pickup_address}
                </p>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600 mb-1">
                  🏥 Alamat Tujuan
                </p>
                <p className="font-medium text-gray-900">
                  {report.destination_address}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Jadwal
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tanggal</p>
                <p className="font-medium text-gray-900">
                  {report.schedule_date}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Waktu</p>
                <p className="font-medium text-gray-900">
                  {report.schedule_time}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Person */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-red-600" />
              Kontak Person
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nama</p>
                  <p className="font-medium text-gray-900">
                    {report.contact_person_name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Nomor Telepon</p>
                  <a
                    href={`tel:${report.contact_person_phone}`}
                    className="font-medium text-red-600 hover:text-red-700"
                  >
                    {report.contact_person_phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(report.note ||
            report.attachment_ktp ||
            report.attachment_house_photo ||
            report.attachment_sharelok) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-600" />
                  Informasi Tambahan
                </h2>
                <div className="space-y-4">
                  {report.note && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Catatan</p>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {report.note}
                      </p>
                    </div>
                  )}
                  {(report.attachment_ktp ||
                    report.attachment_house_photo ||
                    report.attachment_sharelok) && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Lampiran</p>
                        <div className="space-y-2">
                          {report.attachment_ktp && (
                            <a
                              href={report.attachment_ktp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              📄 Lampiran KTP
                            </a>
                          )}
                          {report.attachment_house_photo && (
                            <a
                              href={report.attachment_house_photo}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              🏠 Foto Rumah
                            </a>
                          )}
                          {report.attachment_sharelok && (
                            <a
                              href={report.attachment_sharelok}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                            >
                              📍 Bagikan Lokasi
                            </a>
                          )}    </div>
                      </div>
                    )}
                </div>
              </div>
            )}

          {/* Assignment Details */}
          {assignment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detail Penugasan
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Kendaraan</p>
                  <p className="font-medium text-gray-900">
                    {(assignment as any)?.vehicle_plate || (assignment as any)?.vehicle?.plate_number || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pengemudi</p>
                  <p className="font-medium text-gray-900">
                    {(assignment as any)?.driver_name || (assignment as any)?.driver?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status Penugasan</p>
                  <Badge variant={assignment.status}>{assignment.status}</Badge>
                </div>
                <Link
                  href={`/dashboard/assignments/${assignment.id}`}
                  className="inline-block mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  Lihat Detail Penugasan →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Dibuat</p>
                <p className="font-medium text-gray-900">
                  {formatDateTime(report.created_at)}
                </p>
              </div>
              {report.updated_at && (
                <div>
                  <p className="text-gray-600">Terakhir Diperbarui</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(report.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update (Admin and Reporter) */}
          {(isAdmin || isReporter) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Perbarui Status
              </h2>
              <div className="space-y-2">
                {(
                  [
                    "pending",
                    "assigned",
                    "on_progress",
                    "completed",
                    "cancelled",
                  ] as ReportStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={report.status === status || isUpdatingStatus}
                    className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${report.status === status
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                  >
                    {report.status === status ? "Current: " : "Change to: "}
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Aksi Cepat
            </h2>
            <div className="space-y-2">
              {!assignment && report.status === "pending" && (
                <Link
                  href={`/dashboard/assignments/create?report_id=${id}`}
                  className="block w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-medium"
                >
                  Buat Penugasan
                </Link>
              )}
              <a
                href={`tel:${report.requester_phone}`}
                className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center text-sm font-medium"
              >
                Hubungi Pemohon
              </a>
              <a
                href={`tel:${report.contact_person_phone}`}
                className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center text-sm font-medium"
              >
                Hubungi Kontak Person
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
