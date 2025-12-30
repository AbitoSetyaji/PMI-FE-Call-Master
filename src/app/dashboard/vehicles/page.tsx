"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Filter, Plus, Edit, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/LoadingSpinner";
import type { VehicleStatus, Vehicle } from "@/lib/types";

export default function VehiclesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">(
    "all"
  );

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    vehicleId: string;
    vehicleName: string;
  }>({
    isOpen: false,
    vehicleId: "",
    vehicleName: "",
  });

  // Fetch vehicles with status filter
  const {
    data: vehiclesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vehicles", statusFilter],
    queryFn: () => vehiclesApi.getAll(statusFilter !== "all" ? { status: statusFilter } : undefined),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehiclesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil dihapus");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Gagal menghapus kendaraan"
      );
    },
  });

  // Access vehicles list from API response
  const filteredVehicles: Vehicle[] = vehiclesData?.data || [];

  const handleDelete = (id: string, vehicleName: string) => {
    setConfirmDialog({
      isOpen: true,
      vehicleId: id,
      vehicleName,
    });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(confirmDialog.vehicleId, {
      onSettled: () => {
        setConfirmDialog({ isOpen: false, vehicleId: "", vehicleName: "" });
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Kendaraan</h1>
          <p className="text-gray-600 mt-1">
            Kelola kendaraan tanggap darurat
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/dashboard/vehicles/types"
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Jenis Kendaraan
          </Link>
          {isAdmin && (
            <Link
              href="/dashboard/vehicles/create"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Tambah Kendaraan
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as VehicleStatus | "all")
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="all">Semua Status</option>
              <option value="available">Tersedia</option>
              <option value="on_duty">Bertugas</option>
              <option value="maintenance">Perawatan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicles Grid/Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <SkeletonTable rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Gagal memuat kendaraan
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {statusFilter === "all"
              ? "Tidak ada kendaraan ditemukan"
              : `Tidak ada kendaraan ${statusFilter} ditemukan`}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Plat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dibuat
                    </th>
                    {isAdmin && (
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredVehicles.map((vehicle) => (
                    <tr key={vehicle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle.plate_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle.vehicle_type?.name || "Tidak diketahui"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={vehicle.status}>{vehicle.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {vehicle.created_at ? formatDateTime(vehicle.created_at) : "-"}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <Link
                            href={`/dashboard/vehicles/${vehicle.id}`}
                            className="text-blue-600 hover:text-blue-900 mr-4 inline-flex items-center"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(vehicle.id, vehicle.name)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4 inline" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {vehicle.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {vehicle.plate_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {vehicle.vehicle_type?.name || "Tidak diketahui"}
                      </p>
                    </div>
                    <Badge variant={vehicle.status}>{vehicle.status}</Badge>
                  </div>

                  <p className="text-xs text-gray-500 mb-3">
                    Dibuat: {vehicle.created_at ? formatDateTime(vehicle.created_at) : "-"}
                  </p>

                  {isAdmin && (
                    <div className="flex gap-2">
                      <Link
                        href={`/dashboard/vehicles/${vehicle.id}`}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center"
                      >
                        <Edit className="w-4 h-4 inline mr-1" />
                        Ubah
                      </Link>
                      <button
                        onClick={() => handleDelete(vehicle.id, vehicle.name)}
                        className="flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4 inline mr-1" />
                        Hapus
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() =>
          setConfirmDialog({ isOpen: false, vehicleId: "", vehicleName: "" })
        }
        onConfirm={confirmDelete}
        title="Hapus Kendaraan"
        message={`Apakah Anda yakin ingin menghapus kendaraan "${confirmDialog.vehicleName}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
