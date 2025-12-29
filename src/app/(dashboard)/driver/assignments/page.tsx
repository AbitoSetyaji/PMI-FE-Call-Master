"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  assignments,
  reportsApi,
  vehiclesApi,
  assignmentsApi,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Clock, MapPin, Truck, Filter, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import VehicleSelectionModal from "@/components/ui/VehicleSelectionModal";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import type { AssignmentStatus, Assignment } from "@/lib/types";

// Assignment Card Component with vehicle assignment flow
function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  // Fetch report data separately
  const { data: reportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", assignment.report_id],
    queryFn: () => reportsApi.getById(assignment.report_id),
    enabled: !!assignment.report_id,
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch vehicle data if vehicle_id exists
  const { data: vehicleData, isLoading: isLoadingVehicle } = useQuery({
    queryKey: ["vehicle", assignment.vehicle_id],
    queryFn: () => vehiclesApi.getById(assignment.vehicle_id!),
    enabled: !!assignment.vehicle_id,
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  const report = reportData;
  const vehicle = vehicleData?.data;

  // Mutation to update assignment with vehicle
  const assignVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) =>
      assignmentsApi.updateDriverAssignment(assignment.id, {
        vehicle_id: vehicleId,
      }),
    onSuccess: () => {
      toast.success("Vehicle assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign vehicle");
    },
  });

  // Mutation to update report status
  const updateReportStatusMutation = useMutation({
    mutationFn: (
      status: "on_way" | "arrived_pickup" | "arrived_destination" | "done"
    ) =>
      reportsApi.updateReportStatus(assignment.report_id, {
        status,
      }),
    onSuccess: (data, status) => {
      const statusMessages: Record<string, string> = {
        on_way: "Departure confirmed - On the way",
        arrived_pickup: "Arrived at pickup location",
        arrived_destination: "Arrived at destination",
        done: "Assignment completed",
      };
      toast.success(statusMessages[status] || "Status updated");
      // Invalidate all queries to ensure sync across all devices/tabs/roles
      queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["report", assignment.report_id],
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["assignment", assignment.id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleSelectVehicle = (vehicleId: string) => {
    assignVehicleMutation.mutate(vehicleId);
  };

  const handleUpdateReportStatus = (
    status: "on_way" | "arrived_pickup" | "arrived_destination" | "done"
  ) => {
    updateReportStatusMutation.mutate(status);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant={assignment.status}>
              {assignment.status === "assigned"
                ? "Assigned"
                : assignment.status === "on_progress"
                  ? "In Progress"
                  : assignment.status === "completed"
                    ? "Completed"
                    : assignment.status}
            </Badge>
            <span className="text-sm text-gray-500">
              ID: {assignment.id.slice(0, 8)}
            </span>
          </div>

          {/* Report Details */}
          {isLoadingReport ? (
            <div className="py-4 text-center text-gray-500">
              Loading report details...
            </div>
          ) : report ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Requester</p>
                <p className="font-medium text-gray-900">
                  {report.requester_name}
                </p>
                <p className="text-sm text-gray-600">
                  {report.requester_phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Patient</p>
                <p className="font-medium text-gray-900">
                  {report.patient_name} - {report.patient_age} years old
                </p>
                <p className="text-sm text-gray-600 capitalize">
                  {report.patient_gender}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Pickup Location</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {report.pickup_address}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Destination</p>
                <p className="font-medium text-gray-900">
                  {report.destination_address}
                </p>
              </div>

              {/* Vehicle Section with conditional logic */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Vehicle</p>
                {isLoadingVehicle ? (
                  <p className="text-gray-500">Loading vehicle...</p>
                ) : vehicle ? (
                  <>
                    <p className="font-medium text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      {vehicle.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {vehicle.plate_number}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Type: {vehicle.vehicle_type?.name || "N/A"}
                    </p>
                  </>
                ) : assignment.vehicle_id ? (
                  <p className="text-gray-500">Vehicle not found</p>
                ) : (
                  <button
                    onClick={() => setIsVehicleModalOpen(true)}
                    disabled={assignVehicleMutation.isPending}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {assignVehicleMutation.isPending
                      ? "Assigning..."
                      : "Select Vehicle"}
                  </button>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Report Status</p>
                <Badge variant={report.status || "pending"}>
                  {report.status}
                </Badge>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center text-red-500">
              Failed to load report details
            </div>
          )}

          {/* Timeline */}
          <div className="border-t border-gray-200 pt-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">Assigned:</span>
                <span className="text-gray-900">
                  {formatDateTime(assignment.assigned_at)}
                </span>
              </div>
              {assignment.completed_at && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-gray-600">Completed:</span>
                  <span className="text-gray-900">
                    {formatDateTime(assignment.completed_at)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() =>
                router.push(`/dashboard/assignments/${assignment.id}`)
              }
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              View Details
            </button>

            {/* Progressive status update buttons based on report status */}
            {report?.status === "assigned" && assignment.vehicle_id && (
              <button
                onClick={() => handleUpdateReportStatus("on_way")}
                disabled={updateReportStatusMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {updateReportStatusMutation.isPending
                  ? "Updating..."
                  : "🚀 Confirm Departure"}
              </button>
            )}

            {report?.status === "on_way" && (
              <button
                onClick={() => handleUpdateReportStatus("arrived_pickup")}
                disabled={updateReportStatusMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updateReportStatusMutation.isPending
                  ? "Updating..."
                  : "📍 Arrived at Pickup"}
              </button>
            )}

            {report?.status === "arrived_pickup" && (
              <button
                onClick={() => handleUpdateReportStatus("arrived_destination")}
                disabled={updateReportStatusMutation.isPending}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {updateReportStatusMutation.isPending
                  ? "Updating..."
                  : "🏥 Arrived at Destination"}
              </button>
            )}

            {report?.status === "arrived_destination" && (
              <button
                onClick={() => handleUpdateReportStatus("done")}
                disabled={updateReportStatusMutation.isPending}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {updateReportStatusMutation.isPending
                  ? "Updating..."
                  : "✅ Mark as Done"}
              </button>
            )}

            {report?.pickup_address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  report.pickup_address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🗺️ Open in Maps
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Vehicle Selection Modal */}
      <VehicleSelectionModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSelectVehicle={handleSelectVehicle}
      />
    </>
  );
}

export default function DriverAssignmentsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | "all">(
    "all"
  );

  // Fetch driver's assignments using specific endpoint

  // Removed to resolve parallel route conflict
}
