/**
 * useAuth Hook
 * Custom hook to access authentication state and methods
 */

import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
    return useAuthContext();
}

// Re-export types for convenience
export type { User } from "@/contexts/AuthContext";
