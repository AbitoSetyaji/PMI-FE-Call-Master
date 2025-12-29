"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, usersApi } from "@/lib/api";
import type { CreateAssignmentRequest } from "@/lib/types";
import { useEffect } from "react";

const assignmentSchema = z.object({
  report_id: z.string().min(1, "Report is required"),
  driver_id: z.string().min(1, "Driver is required"),
});

type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  initialReportId?: string;
  onSubmit: (data: CreateAssignmentRequest) => void;
  isSubmitting?: boolean;
}

export default function AssignmentForm({
  initialReportId,
  onSubmit,
  isSubmitting = false,
}: AssignmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    setValue,
  } = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      report_id: initialReportId || "",
      driver_id: "",
    },
  });

  // Set initial report ID when it changes
  useEffect(() => {
    if (initialReportId) {
      setValue("report_id", initialReportId);
    }
  }, [initialReportId, setValue]);

  // Fetch pending reports (not yet assigned)
  const { data: reportsData, isLoading: loadingReports } = useQuery({
    queryKey: ["reports", { status_filter: "pending" }],
    queryFn: () => reportsApi.getAll(),
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Fetch drivers
  const { data: driversData, isLoading: loadingDrivers } = useQuery({
    queryKey: ["users", { role: "driver" }],
    queryFn: () => usersApi.getAll({ role: "driver" }),
    staleTime: 0,
    refetchInterval: 10 * 1000, // Auto-refetch every 10 seconds
    refetchIntervalInBackground: true,
  });

  // Filter for pending reports only
  const allReports = reportsData || [];
  const pendingReports = allReports.filter(report => report.status === "pending");
  const driversList = driversData || [];

  // Watch selected report ID
  const selectedReportId = useWatch({
    control,
    name: "report_id",
  });

  const selectedReport = pendingReports.find((r) => r.id === selectedReportId);

  const onFormSubmit = (data: AssignmentFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Report Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Report
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pending Report <span className="text-red-600">*</span>
          </label>
          {loadingReports ? (
            <p className="text-gray-500 text-sm">Loading reports...</p>
          ) : pendingReports.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No pending reports available. All reports have been assigned or
                completed.
              </p>
            </div>
          ) : (
            <>
              <select
                {...register("report_id")}
                disabled={!!initialReportId}
                className={`w-full px-4 py-2 border ${errors.report_id ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">Select a report</option>
                {pendingReports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.requester_name} - {report.patient_name} (
                    {report.pickup_address})
                  </option>
                ))}
              </select>
              {errors.report_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.report_id.message}
                </p>
              )}
              {initialReportId && (
                <p className="text-sm text-gray-600 mt-2">
                  ℹ️ Report is pre-selected from previous page
                </p>
              )}

              {/* Selected Report Details */}
              {selectedReport && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Report Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                    <div>
                      <p>
                        <strong>Requester:</strong>{" "}
                        {selectedReport.requester_name}
                      </p>
                      <p>
                        <strong>Phone:</strong> {selectedReport.requester_phone}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Patient:</strong> {selectedReport.patient_name}
                      </p>
                      <p>
                        <strong>Age:</strong> {selectedReport.patient_age} years
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p>
                        <strong>Pickup:</strong> {selectedReport.pickup_address}
                      </p>
                      <p>
                        <strong>Destination:</strong>{" "}
                        {selectedReport.destination_address}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p>
                        <strong>Schedule:</strong>{" "}
                        {selectedReport.schedule_date} at{" "}
                        {selectedReport.schedule_time}
                      </p>
                    </div>
                    {selectedReport.note && (
                      <div className="md:col-span-2">
                        <p>
                          <strong>Note:</strong> {selectedReport.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Driver Selection */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Driver
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Driver <span className="text-red-600">*</span>
          </label>
          {loadingDrivers ? (
            <p className="text-gray-500 text-sm">Loading drivers...</p>
          ) : driversList.length === 0 ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                No drivers available in the system.
              </p>
            </div>
          ) : (
            <>
              <select
                {...register("driver_id")}
                className={`w-full px-4 py-2 border ${errors.driver_id ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              >
                <option value="">Select a driver</option>
                {driversList.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.email}
                  </option>
                ))}
              </select>
              {errors.driver_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.driver_id.message}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            pendingReports.length === 0 ||
            driversList.length === 0
          }
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? "Creating Assignment..." : "Create Assignment"}
        </button>
      </div>

      {/* Warning if resources unavailable */}
      {(pendingReports.length === 0 || driversList.length === 0) && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm font-medium">
            ⚠️ Cannot create assignment: Missing required resources
          </p>
          <ul className="mt-2 text-yellow-700 text-sm list-disc list-inside">
            {pendingReports.length === 0 && (
              <li>No pending reports available</li>
            )}
            {driversList.length === 0 && <li>No drivers in system</li>}
          </ul>
        </div>
      )}
    </form>
  );
}
