"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import ReportForm from "@/components/forms/ReportForm";
import type { CreateReportRequest } from "@/lib/types";

export default function CreateReportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createReportMutation = useMutation({
    mutationFn: (data: CreateReportRequest) => reportsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report created successfully");
      router.push(`/dashboard/reports/${response.id}`);
    },
    onError: (error: Error) => {
      const axiosError = error as { response?: { data?: { detail?: string } } };
      toast.error(
        axiosError?.response?.data?.detail || "Failed to create report"
      );
    },
  });

  const handleSubmit = (data: CreateReportRequest) => {
    createReportMutation.mutate(data);
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
            Create New Report
          </h1>
          <p className="text-gray-600 mt-1">
            Submit a new emergency incident report
          </p>
        </div>
      </div>

      {/* Form */}
      <ReportForm
        onSubmit={handleSubmit}
        isSubmitting={createReportMutation.isPending}
      />
    </div>
  );
}
