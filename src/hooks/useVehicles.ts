/**
 * useVehicles Hook
 * Complete hook for vehicle management with auto-refresh after mutations
 */

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehiclesApi, vehicleTypes, vehicleTypesApi } from "@/lib/api";
import type { Vehicle, VehicleType, CreateVehicleRequest, UpdateVehicleRequest, CreateVehicleTypeRequest, ApiResponse } from "@/lib/types";
import { toast } from "sonner";

/**
 * Hook for managing vehicles with auto-refresh
 */
export function useVehicles(params?: { status?: string }) {
    const queryClient = useQueryClient();

    // Get all vehicles
    const { data: vehiclesData, isLoading, error, refetch } = useQuery<ApiResponse<Vehicle[]>>({
        queryKey: ["vehicles", params?.status],
        queryFn: () => vehiclesApi.getAll(params),
    });

    const vehicles = vehiclesData?.data || [];

    // Get vehicle by ID
    const useVehicleById = (id: string) => {
        return useQuery<ApiResponse<Vehicle>>({
            queryKey: ["vehicle", id],
            queryFn: () => vehiclesApi.getById(id),
            enabled: !!id,
        });
    };

    // Create vehicle mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateVehicleRequest) => vehiclesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Kendaraan berhasil dibuat");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat kendaraan");
        },
    });

    // Update vehicle mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateVehicleRequest }) =>
            vehiclesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            queryClient.invalidateQueries({ queryKey: ["vehicle", variables.id] });
            toast.success("Kendaraan berhasil diupdate");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal mengupdate kendaraan");
        },
    });

    // Delete vehicle mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => vehiclesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Kendaraan berhasil dihapus");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus kendaraan");
        },
    });

    return {
        vehicles,
        isLoading,
        error,
        refetch,
        useVehicleById,
        createVehicle: createMutation.mutate,
        updateVehicle: updateMutation.mutate,
        deleteVehicle: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

/**
 * Hook to fetch all vehicle types
 */
export function useVehicleTypes() {
    const queryClient = useQueryClient();

    const { data: typesData, isLoading, error, refetch } = useQuery<ApiResponse<VehicleType[]>>({
        queryKey: ["vehicle-types"],
        queryFn: async () => {
            return await vehicleTypes.getVehicleTypes();
        },
    });

    const types = typesData?.data || [];

    // Create vehicle type mutation
    const createMutation = useMutation({
        mutationFn: (data: CreateVehicleTypeRequest) => vehicleTypesApi.createVehicleType(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Tipe kendaraan berhasil dibuat");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat tipe kendaraan");
        },
    });

    // Update vehicle type mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CreateVehicleTypeRequest> }) =>
            vehicleTypesApi.updateVehicleType(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
            queryClient.invalidateQueries({ queryKey: ["vehicleType", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Tipe kendaraan berhasil diupdate");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal mengupdate tipe kendaraan");
        },
    });

    // Delete vehicle type mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => vehicleTypesApi.deleteVehicleType(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vehicle-types"] });
            queryClient.invalidateQueries({ queryKey: ["vehicles"] });
            toast.success("Tipe kendaraan berhasil dihapus");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus tipe kendaraan");
        },
    });

    return {
        types,
        isLoading,
        error,
        refetch,
        createVehicleType: createMutation.mutate,
        updateVehicleType: updateMutation.mutate,
        deleteVehicleType: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

/**
 * Hook to fetch a single vehicle type by ID
 */
export function useVehicleType(id: string) {
    return useQuery<VehicleType>({
        queryKey: ["vehicleType", id],
        queryFn: async () => {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/vehicle-types/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("pmi_auth_token")}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch vehicle type");
            const result = await response.json();
            return result.data;
        },
        enabled: !!id,
    });
}
