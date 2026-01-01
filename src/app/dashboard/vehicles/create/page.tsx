"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicles } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import VehicleForm from "@/components/forms/VehicleForm";
import type { CreateVehicleRequest, UpdateVehicleRequest } from "@/lib/types";

export default function CreateVehiclePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: CreateVehicleRequest) => vehicles.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Kendaraan berhasil dibuat");
      router.push("/dashboard/vehicles");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Gagal membuat kendaraan"
      );
    },
  });

  const handleSubmit = (data: CreateVehicleRequest | UpdateVehicleRequest) => {
    createMutation.mutate(data as CreateVehicleRequest);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buat Kendaraan</h1>
          <p className="text-gray-600 mt-1">Tambahkan kendaraan baru ke sistem</p>
        </div>
      </div>

      {/* Form */}
      <VehicleForm
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
      />
    </div>
  );
}
