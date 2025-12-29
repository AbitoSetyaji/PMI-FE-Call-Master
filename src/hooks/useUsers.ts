/**
 * useUsers Hook
 * Complete hook for user management with auto-refresh after mutations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import type { User } from "@/lib/types";
import { toast } from "sonner";

export function useUsers(role?: string) {
    const queryClient = useQueryClient();

    // Get all users (optionally filtered by role)
    const { data: users = [], isLoading, error, refetch } = useQuery<User[]>({
        queryKey: ["users", role],
        queryFn: () => usersApi.getAll(role ? { role } : undefined),
    });

    // Get user by ID
    const useUserById = (id: string) => {
        return useQuery<User>({
            queryKey: ["users", id],
            queryFn: () => usersApi.getById(id),
            enabled: !!id,
        });
    };

    // Create user mutation
    const createMutation = useMutation({
        mutationFn: (data: { name: string; email: string; password: string; role: string }) =>
            usersApi.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            toast.success("User berhasil dibuat");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat user");
        },
    });

    // Update user mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            usersApi.updateUser(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            queryClient.invalidateQueries({ queryKey: ["users", variables.id] });
            toast.success("User berhasil diupdate");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal mengupdate user");
        },
    });

    // Delete user mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => usersApi.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
            // Also invalidate assignments since they may reference this user
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            toast.success("User berhasil dihapus");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal menghapus user");
        },
    });

    return {
        users,
        isLoading,
        error,
        refetch,
        useUserById,
        createUser: createMutation.mutate,
        updateUser: updateMutation.mutate,
        deleteUser: deleteMutation.mutate,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}

/**
 * Hook to fetch drivers specifically
 */
export function useDrivers() {
    return useUsers("driver");
}

/**
 * Hook to fetch admins specifically
 */
export function useAdmins() {
    return useUsers("admin");
}
