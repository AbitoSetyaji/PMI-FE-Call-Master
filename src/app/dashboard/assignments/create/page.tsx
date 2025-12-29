"use client";

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { assignmentsApi, reportsApi, usersApi } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import type { CreateAssignmentRequest, Report, User } from "@/lib/types";

function CreateAssignmentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const reportIdFromQuery = searchParams.get("report_id");

    const [selectedReportId, setSelectedReportId] = useState<string>(reportIdFromQuery || "");
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");

    // Fetch reports
    const { data: reports = [], isLoading: isLoadingReports } = useQuery({
        queryKey: ["reports"],
        queryFn: () => reportsApi.getAll(),
    });

    // Filter pending reports
    const pendingReports = reports.filter((r: Report) => r.status === "pending");

    // Fetch drivers
    const { data: driversData, isLoading: isLoadingDrivers } = useQuery({
        queryKey: ["users", { role: "driver" }],
        queryFn: () => usersApi.getAll({ role: "driver" }),
    });

    const drivers = driversData || [];

    // Set report_id from query params
    useEffect(() => {
        if (reportIdFromQuery) {
            setSelectedReportId(reportIdFromQuery);
        }
    }, [reportIdFromQuery]);

    const createMutation = useMutation({
        mutationFn: (data: CreateAssignmentRequest) => assignmentsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["assignments"] });
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            toast.success("Assignment created successfully");
            router.push("/dashboard/assignments");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create assignment");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedReportId) {
            toast.error("Please select a report");
            return;
        }

        if (!selectedDriverId) {
            toast.error("Please select a driver");
            return;
        }

        createMutation.mutate({
            report_id: selectedReportId,
            driver_id: selectedDriverId,
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/assignments"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create New Assignment</h1>
                    <p className="text-gray-600 mt-1">
                        Assign a driver to a pending report
                    </p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
                    {/* Report Selection */}
                    <div>
                        <label
                            htmlFor="report_id"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Report <span className="text-red-500">*</span>
                        </label>
                        {isLoadingReports ? (
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                <span className="text-sm text-gray-600">Loading reports...</span>
                            </div>
                        ) : (
                            <select
                                id="report_id"
                                value={selectedReportId}
                                onChange={(e) => setSelectedReportId(e.target.value)}
                                disabled={createMutation.isPending}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Select a report</option>
                                {pendingReports.map((report: Report) => (
                                    <option key={report.id} value={report.id}>
                                        {report.requester_name} - {report.patient_name} ({report.schedule_date})
                                    </option>
                                ))}
                            </select>
                        )}
                        {pendingReports.length === 0 && !isLoadingReports && (
                            <p className="text-sm text-yellow-600 mt-1">
                                No pending reports available for assignment.
                            </p>
                        )}
                    </div>

                    {/* Driver Selection */}
                    <div>
                        <label
                            htmlFor="driver_id"
                            className="block text-sm font-medium text-gray-700 mb-2"
                        >
                            Driver <span className="text-red-500">*</span>
                        </label>
                        {isLoadingDrivers ? (
                            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                <span className="text-sm text-gray-600">Loading drivers...</span>
                            </div>
                        ) : (
                            <select
                                id="driver_id"
                                value={selectedDriverId}
                                onChange={(e) => setSelectedDriverId(e.target.value)}
                                disabled={createMutation.isPending}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Select a driver</option>
                                {drivers.map((driver: User) => (
                                    <option key={driver.id} value={driver.id}>
                                        {driver.name} ({driver.email})
                                    </option>
                                ))}
                            </select>
                        )}
                        {drivers.length === 0 && !isLoadingDrivers && (
                            <p className="text-sm text-yellow-600 mt-1">
                                No drivers available.
                            </p>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={createMutation.isPending || !selectedReportId || !selectedDriverId}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createMutation.isPending ? (
                            <span className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Creating...
                            </span>
                        ) : (
                            "Create Assignment"
                        )}
                    </button>
                    <Link
                        href="/dashboard/assignments"
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default function CreateAssignmentPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        }>
            <CreateAssignmentContent />
        </Suspense>
    );
}
