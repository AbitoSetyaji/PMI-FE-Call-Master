"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ReportForm from "@/components/forms/ReportForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { CreateReportRequest } from "@/lib/types";

export default function CreateReportPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (data: CreateReportRequest) => reportsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reports"] });
            toast.success("Laporan berhasil dibuat");
            router.push("/dashboard/reports");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Gagal membuat laporan");
        },
    });

    const handleSubmit = (data: CreateReportRequest) => {
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/dashboard/reports"
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Buat Laporan Baru</h1>
                    <p className="text-gray-600 mt-1">
                        Isi formulir di bawah untuk membuat laporan darurat baru
                    </p>
                </div>
            </div>

            {/* Form */}
            <ReportForm
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
            />
        </div>
    );
}
