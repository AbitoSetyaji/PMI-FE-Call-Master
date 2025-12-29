/**
 * useDriverLocations Hook
 * Custom hook for managing driver location tracking
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getDriverLocationsList, createDriverLocation } from "@/lib/api";
import type { DriverLocation, CreateDriverLocationRequest } from "@/lib/types";
import { toast } from "sonner";

export function useDriverLocations(autoRefresh = true) {
    const queryClient = useQueryClient();

    // Get all driver locations with auto-refresh
    const { data: locations = [], isLoading, error, refetch } = useQuery<DriverLocation[]>({
        queryKey: ["driverLocations"],
        queryFn: getDriverLocationsList,
        refetchInterval: autoRefresh ? 30000 : false, // Refresh every 30 seconds
    });

    // Create/Update driver location mutation
    const updateLocationMutation = useMutation({
        mutationFn: (data: CreateDriverLocationRequest) => createDriverLocation(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["driverLocations"] });
        },
        onError: (error: any) => {
            console.error("Failed to update location:", error);
            toast.error("Gagal mengupdate lokasi");
        },
    });

    return {
        locations,
        isLoading,
        error,
        refetch,
        updateLocation: updateLocationMutation.mutate,
        isUpdating: updateLocationMutation.isPending,
    };
}
