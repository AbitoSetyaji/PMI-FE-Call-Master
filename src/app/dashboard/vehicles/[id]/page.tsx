"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicles } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import VehicleForm from "@/components/forms/VehicleForm";
import type { UpdateVehicleRequest } from "@/lib/types";
import Link from "next/link";

export default function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch vehicle data
  const {
    data: vehicleResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => vehicles.getVehicleById(id),
  });

  const vehicle = vehicleResponse?.data;

  const updateMutation = useMutation({
    mutationFn: (data: UpdateVehicleRequest) =>
      vehicles.updateVehicle(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["vehicle", id] });
      toast.success("Vehicle updated successfully");
      router.push("/dashboard/vehicles");
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to update vehicle"
      );
    },
  });

  const handleSubmit = (data: UpdateVehicleRequest) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load vehicle</p>
        <Link
          href="/dashboard/vehicles"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          ← Back to Vehicles
        </Link>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Vehicle</h1>
          <p className="text-gray-600 mt-1">Update vehicle information</p>
        </div>
      </div>

      {/* Form */}
      <VehicleForm
        initialData={vehicle}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
      />
    </div>
  );
}
