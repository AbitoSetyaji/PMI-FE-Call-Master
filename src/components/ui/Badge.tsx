import React from "react";
import { cn } from "@/lib/utils";
import type {
  ReportStatus,
  VehicleStatus,
  AssignmentStatus,
  UserRole,
} from "@/lib/types";

// Report priority type (not exported from types)
type ReportPriority = "low" | "medium" | "high" | "urgent" | "critical";

interface BadgeProps {
  children: React.ReactNode;
  variant?:
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | ReportStatus
  | ReportPriority
  | VehicleStatus
  | AssignmentStatus
  | UserRole;
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
    // Report status - using status colors from theme
    pending:
      "bg-status-pending-bg text-yellow-800 border border-status-pending",
    active: "bg-blue-100 text-blue-800 border border-blue-300",
    assigned:
      "bg-status-assigned-bg text-blue-800 border border-status-assigned",
    on_progress:
      "bg-status-on-progress-bg text-orange-800 border border-status-on-progress",
    completed:
      "bg-status-completed-bg text-green-800 border border-status-completed",
    cancelled:
      "bg-status-cancelled-bg text-gray-800 border border-status-cancelled",
    // Report priority
    low: "bg-gray-100 text-gray-700 border border-gray-300",
    medium: "bg-yellow-100 text-yellow-800 border border-yellow-400",
    high: "bg-orange-100 text-orange-800 border border-orange-400",
    urgent: "bg-red-100 text-red-800 border border-red-400",
    critical: "bg-red-100 text-red-800 border border-red-600 font-semibold",
    // Vehicle status
    available: "bg-green-100 text-green-800 border border-green-400",
    on_duty: "bg-blue-100 text-blue-800 border border-blue-400",
    maintenance: "bg-gray-100 text-gray-700 border border-gray-400",
    // User roles
    admin: "bg-purple-100 text-purple-800 border border-purple-400",
    driver: "bg-blue-100 text-blue-800 border border-blue-400",
    reporter: "bg-green-100 text-green-800 border border-green-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors-smooth",
        variantStyles[variant] || variantStyles.default,
        className
      )}
    >
      {children}
    </span>
  );
}
