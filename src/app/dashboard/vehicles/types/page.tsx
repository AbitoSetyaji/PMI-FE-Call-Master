"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleTypes } from "@/lib/api";
import { ArrowLeft, Plus, Edit, Trash2 } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SkeletonTable } from "@/components/ui/LoadingSpinner";
import type { VehicleType, CreateVehicleTypeRequest } from "@/lib/types";

export default function VehicleTypesPage() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = user?.role === "admin";
    const queryClient = useQueryClient();

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<VehicleType | null>(null);

    // Confirm dialog state
    const [confirmDialog, setConfirmDialog] = useState<{
        isOpen: boolean;
        typeId: string;
        typeName: string;
    }>({
        isOpen: false,
        typeId: "",
        typeName: "",
    });

    // Fetch vehicle types
    const {
        data: typesData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["vehicle-types"],
        queryFn: () => vehicleTypes.getVehicleTypes(),
    });

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => vehicleTypes.deleteVehicleType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Jenis kendaraan berhasil dihapus");
        },
        onError: (error: Error) => {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            toast.error(
                axiosError?.response?.data?.detail || "Gagal menghapus jenis kendaraan"
            );
        },
    });

    const handleDelete = (id: string, name: string) => {
        setConfirmDialog({
            isOpen: true,
            typeId: id,
            typeName: name,
        });
    };

    const confirmDelete = () => {
        deleteMutation.mutate(confirmDialog.typeId, {
            onSettled: () => {
                setConfirmDialog({ isOpen: false, typeId: "", typeName: "" });
            },
        });
    };

    const handleEdit = (type: VehicleType) => {
        setSelectedType(type);
        setIsEditModalOpen(true);
    };

    const types = typesData?.data || [];

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
                        <h1 className="text-3xl font-bold text-gray-900">Jenis Kendaraan</h1>
                        <p className="text-gray-600 mt-1">Kelola kategori kendaraan</p>
                    </div>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Tambah Jenis
                    </button>
                )}
            </div>

            {/* Vehicle Types List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {isLoading ? (
                    <SkeletonTable rows={5} />
                ) : error ? (
                    <div className="p-8 text-center text-red-600">
                        Gagal memuat jenis kendaraan
                    </div>
                ) : types.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        Jenis kendaraan tidak ditemukan.{" "}
                        {isAdmin && "Klik 'Tambah Jenis' untuk membuat."}
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
                                            Deskripsi
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
                                    {types.map((type) => (
                                        <tr key={type.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {type.name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-600">
                                                    {type.description || "-"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {type.created_at ? formatDateTime(type.created_at) : "-"}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <button
                                                        onClick={() => handleEdit(type)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        <Edit className="w-4 h-4 inline" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(type.id, type.name)}
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
                            {types.map((type) => (
                                <div key={type.id} className="p-4">
                                    <div className="mb-3">
                                        <h3 className="font-semibold text-gray-900 mb-1">
                                            {type.name}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {type.description || "Tidak ada deskripsi"}
                                        </p>
                                    </div>

                                    <p className="text-xs text-gray-500 mb-3">
                                        Dibuat: {type.created_at ? formatDateTime(type.created_at) : "-"}
                                    </p>

                                    {isAdmin && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleEdit(type)}
                                                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <Edit className="w-4 h-4 inline mr-1" />
                                                Ubah
                                            </button>
                                            <button
                                                onClick={() => handleDelete(type.id, type.name)}
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

            {/* Add/Edit Modal */}
            {(isAddModalOpen || isEditModalOpen) && (
                <VehicleTypeModal
                    isOpen={isAddModalOpen || isEditModalOpen}
                    onClose={() => {
                        setIsAddModalOpen(false);
                        setIsEditModalOpen(false);
                        setSelectedType(null);
                    }}
                    vehicleType={selectedType}
                />
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                isOpen={confirmDialog.isOpen}
                onClose={() =>
                    setConfirmDialog({ isOpen: false, typeId: "", typeName: "" })
                }
                onConfirm={confirmDelete}
                title="Hapus Jenis Kendaraan"
                message={`Apakah Anda yakin ingin menghapus jenis kendaraan "${confirmDialog.typeName}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus"
                cancelText="Batal"
                type="danger"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}

// Vehicle Type Modal Component
function VehicleTypeModal({
    isOpen,
    onClose,
    vehicleType,
}: {
    isOpen: boolean;
    onClose: () => void;
    vehicleType: VehicleType | null;
}) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        name: vehicleType?.name || "",
        description: vehicleType?.description || "",
    });

    const mutation = useMutation({
        mutationFn: (data: CreateVehicleTypeRequest) =>
            vehicleType
                ? vehicleTypes.updateVehicleType(vehicleType.id, data)
                : vehicleTypes.createVehicleType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success(
                vehicleType
                    ? "Jenis kendaraan berhasil diperbarui"
                    : "Jenis kendaraan berhasil dibuat"
            );
            onClose();
        },
        onError: (error: Error) => {
            const axiosError = error as { response?: { data?: { detail?: string } } };
            toast.error(
                axiosError?.response?.data?.detail || "Gagal menyimpan jenis kendaraan"
            );
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                    {vehicleType ? "Ubah Jenis Kendaraan" : "Tambah Jenis Kendaraan Baru"}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            placeholder="contoh: Ambulan, Mobil Jenazah"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            rows={3}
                            placeholder="Deskripsi singkat jenis kendaraan ini"
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={mutation.isPending}
                            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            {mutation.isPending
                                ? "Menyimpan..."
                                : vehicleType
                                    ? "Perbarui"
                                    : "Buat"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
