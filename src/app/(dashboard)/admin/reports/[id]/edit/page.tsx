"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import ReportForm from "@/components/forms/ReportForm";
import type { CreateReportRequest, UpdateReportRequest } from "@/lib/types";
import { toast } from "sonner";

export default function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap params using React.use()
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch report data
  const {
    data: report,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportsApi.getById(id),
    enabled: !!id,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: UpdateReportRequest) => reportsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      toast.success("Report updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update report");
    },
  });

  const handleSubmit = async (data: CreateReportRequest) => {
    try {
      // Convert CreateReportRequest to UpdateReportRequest
      // Send all fields since the form has complete data
      const updateData = {
        requester_name: data.requester_name,
        requester_phone: data.requester_phone,
        transport_type: data.transport_type,
        use_stretcher: data.use_stretcher,
        patient_name: data.patient_name,
        patient_gender: data.patient_gender,
        patient_age: data.patient_age,
        patient_history: data.patient_history,
        pickup_address: data.pickup_address,
        destination_address: data.destination_address,
        schedule_date: data.schedule_date,
        schedule_time: data.schedule_time,
        contact_person_name: data.contact_person_name,
        contact_person_phone: data.contact_person_phone,
        note: data.note,
        attachment_ktp: data.attachment_ktp,
        attachment_house_photo: data.attachment_house_photo,
        attachment_sharelok: data.attachment_sharelok,
      };

      await updateMutation.mutateAsync(updateData);

      // Refresh router cache and redirect
      router.refresh();
      router.push(`/dashboard/reports/${id}`);
    } catch (error) {
      // Error is already handled by the mutation hook
      console.error("Failed to update report:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">
          {error
            ? `Error: ${error instanceof Error
              ? error.message
              : "Failed to load report"
            }`
            : "Report not found"}
        </p>
        <button
          onClick={() => router.back()}
          className="text-red-600 hover:text-red-700 font-medium"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  // Prepare initial data for the form
  const initialData: Partial<CreateReportRequest> = {
    requester_name: report.requester_name,
    requester_phone: report.requester_phone,
    transport_type: report.transport_type,
    use_stretcher: report.use_stretcher,
    patient_name: report.patient_name,
    patient_gender: report.patient_gender,
    patient_age: report.patient_age,
    patient_history: report.patient_history || "",
    pickup_address: report.pickup_address,
    destination_address: report.destination_address,
    schedule_date: report.schedule_date,
    schedule_time: report.schedule_time,
    contact_person_name: report.contact_person_name,
    contact_person_phone: report.contact_person_phone,
    note: report.note || "",
    attachment_ktp: report.attachment_ktp || "",
    attachment_house_photo: report.attachment_house_photo || "",
    attachment_sharelok: report.attachment_sharelok || "",
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Report</h1>
          <p className="text-gray-600 mt-1">
            Update emergency incident report #{id.slice(0, 8)}
          </p>
        </div>
      </div>

      {/* Form */}
      <ReportForm
        initialData={initialData}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitButtonText="Update Report"
      />
    </div>
  );
}

