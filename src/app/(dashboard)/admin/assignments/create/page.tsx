"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import AssignmentForm from "@/components/forms/AssignmentForm";
import type { CreateAssignmentRequest } from "@/lib/types";
import { Suspense } from "react";

function CreateAssignmentContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const reportId = searchParams.get("report_id");

  const createAssignmentMutation = useMutation({
    mutationFn: (data: CreateAssignmentRequest) =>
      assignmentsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Assignment created successfully");
      router.push(`/dashboard/assignments/${response.id}`);
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to create assignment"
      );
    },
  });

  const handleSubmit = (data: CreateAssignmentRequest) => {
    createAssignmentMutation.mutate(data);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Assignment
          </h1>
          <p className="text-gray-600 mt-1">
            Assign a vehicle and driver to an emergency report
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
          <li>Select a pending report that needs attention</li>
          <li>Choose an available vehicle from the fleet</li>
          <li>Assign a driver to handle the emergency</li>
          <li>The assignment will be created and the driver notified</li>
        </ol>
      </div>

      {/* Form */}
      <AssignmentForm
        initialReportId={reportId || undefined}
        onSubmit={handleSubmit}
        isSubmitting={createAssignmentMutation.isPending}
      />
    </div>
  );
}

export default function CreateAssignmentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreateAssignmentContent />
    </Suspense>
  );
}
