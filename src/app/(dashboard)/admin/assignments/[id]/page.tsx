"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi, reportsApi } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  FileText,
  Truck,
  User,
  Calendar,
  MapPin,
  Phone,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AssignmentStatus } from "@/lib/types";

export default function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch assignment details
  const {
    data: assignmentResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assignment", id],
    queryFn: () => assignmentsApi.getById(id),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  const assignment = assignmentResponse;

  // Fetch report details separately
  const { data: reportResponse, isLoading: isLoadingReport } = useQuery({
    queryKey: ["report", assignment?.report_id],
    queryFn: () => reportsApi.getById(assignment!.report_id),
    enabled: !!assignment?.report_id, // Only fetch if we have report_id
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  const report = reportResponse;

  // Check if current user is the assigned driver
  const isAssignedDriver = isDriver && user?.id === assignment?.driver_id;

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: AssignmentStatus) =>
      assignmentsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignment", id] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
      toast.success("Assignment status updated successfully");
      setIsUpdatingStatus(false);
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to update status"
      );
      setIsUpdatingStatus(false);
    },
  });

  const handleStatusChange = (status: AssignmentStatus) => {
    if (confirm(`Are you sure you want to change status to "${status}"?`)) {
      setIsUpdatingStatus(true);
      updateStatusMutation.mutate(status);
    }
  };

  if (isLoading || isLoadingReport) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading assignment details...</p>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Failed to load assignment details</p>
        <Link
          href="/dashboard/assignments"
          className="text-red-600 hover:text-red-700 font-medium"
        >
          ← Back to Assignments
        </Link>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold text-gray-900">
              Assignment Details
            </h1>
            <p className="text-gray-600 mt-1">Assignment ID: {assignment.id}</p>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <Badge variant={assignment.status}>{assignment.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Information */}
          {report && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Report Information
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Requester</p>
                    <p className="font-medium text-gray-900">
                      {report.requester_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a
                      href={`tel:${report.requester_phone}`}
                      className="font-medium text-red-600 hover:text-red-700"
                    >
                      {report.requester_phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Patient</p>
                    <p className="font-medium text-gray-900">
                      {report.patient_name}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Pickup Address</p>
                    <p className="font-medium text-gray-900">
                      {report.pickup_address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Destination</p>
                    <p className="font-medium text-gray-900">
                      {report.destination_address}
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant={report.status}>{report.status}</Badge>
                  </div>
                </div>
                <Link
                  href={`/dashboard/reports/${assignment.report_id}`}
                  className="inline-block mt-2 text-red-600 hover:text-red-700 font-medium text-sm"
                >
                  View Full Report →
                </Link>
              </div>
            </div>
          )}

          {/* Vehicle Information */}
          {assignment.vehicle_id ? (
            assignment.vehicle ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-red-600" />
                  Vehicle Information
                </h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Vehicle Name</p>
                    <p className="font-medium text-gray-900 text-lg">
                      {assignment.vehicle.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plate Number</p>
                    <p className="font-medium text-gray-900">
                      {assignment.vehicle.plate_number}
                    </p>
                  </div>
                  {assignment.vehicle.vehicle_type && (
                    <div>
                      <p className="text-sm text-gray-600">Vehicle Type</p>
                      <p className="font-medium text-gray-900">
                        {assignment.vehicle.vehicle_type.name}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={assignment.vehicle.status}>
                      {assignment.vehicle.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <Truck className="w-5 h-5 text-yellow-600" />
                No Vehicle Assigned
              </h2>
              <p className="text-sm text-yellow-800">
                This assignment does not have a vehicle assigned yet.
              </p>
            </div>
          )}

          {/* Driver Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-600" />
              Driver Information
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">
                  {assignment.driver?.name || "Unknown"}
                </p>
              </div>
              {assignment.driver?.email && (
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium text-gray-900">
                    {assignment.driver.email}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-600" />
              Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Assigned</p>
                <p className="font-medium text-gray-900 text-sm">
                  {formatDateTime(assignment.assigned_at)}
                </p>
              </div>
              {assignment.completed_at && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatDateTime(assignment.completed_at)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Update */}
          {(isAdmin || isAssignedDriver) && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Update Status
              </h2>
              <div className="space-y-2">
                {(
                  [
                    "active",
                    "assigned",
                    "on_progress",
                    "completed",
                    "cancelled",
                  ] as AssignmentStatus[]
                ).map((status) => {
                  // Driver can only update to on_progress or completed
                  if (
                    isAssignedDriver &&
                    !isAdmin &&
                    !["on_progress", "completed"].includes(status)
                  ) {
                    return null;
                  }

                  return (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={
                        assignment.status === status || isUpdatingStatus
                      }
                      className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${assignment.status === status
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                    >
                      {assignment.status === status
                        ? "Current: "
                        : "Change to: "}
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              {report && (
                <>
                  <Link
                    href={`/dashboard/reports/${assignment.report_id}`}
                    className="block w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-center text-sm font-medium"
                  >
                    View Report
                  </Link>
                  {report.requester_phone && (
                    <a
                      href={`tel:${report.requester_phone}`}
                      className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center text-sm font-medium"
                    >
                      Call Requester
                    </a>
                  )}
                  {report.contact_person_phone && (
                    <a
                      href={`tel:${report.contact_person_phone}`}
                      className="block w-full px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-center text-sm font-medium"
                    >
                      Call Contact Person
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
