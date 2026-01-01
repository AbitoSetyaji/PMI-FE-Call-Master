"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { vehicleTypes } from "@/lib/api";
import { vehicleSchema } from "@/lib/validations";
import Input from "@/components/Input";
import Button from "@/components/Button";
import { FormErrorsSummary } from "@/components/ui/FormErrors";
import type {
  CreateVehicleRequest,
  UpdateVehicleRequest,
  Vehicle,
} from "@/lib/types";
import { z } from "zod";

type VehicleFormData = z.infer<typeof vehicleSchema>;

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: CreateVehicleRequest | UpdateVehicleRequest) => void;
  isSubmitting: boolean;
}

export default function VehicleForm({
  initialData,
  onSubmit,
  isSubmitting,
}: VehicleFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: initialData
      ? {
        name: initialData.name,
        plate_number: initialData.plate_number,
        type: initialData.vehicle_type_id || "",
        status: (initialData.status === "on_duty" || initialData.status === "available" || initialData.status === "maintenance" || initialData.status === "in_use")
          ? initialData.status
          : "available",
      }
      : {
        status: "available",
      },
  });

  // Fetch vehicle types for dropdown
  const { data: vehicleTypesResponse, isLoading: isLoadingTypes } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: vehicleTypes.getVehicleTypes,
  });

  const types = vehicleTypesResponse?.data || [];

  const handleFormSubmit = (data: VehicleFormData) => {
    // Transform form data to match API expected format
    // Backend expects 'type' field, not 'vehicle_type_id'
    const apiData = {
      name: data.name,
      plate_number: data.plate_number,
      type: data.type, // Backend expects 'type' not 'vehicle_type_id'
      status: data.status as "available" | "in_use" | "maintenance",
    };
    onSubmit(apiData as unknown as CreateVehicleRequest);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Vehicle Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nama Kendaraan <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            type="text"
            placeholder="contoh: Ambulan 01"
            {...register("name")}
            error={errors.name?.message}
            disabled={isSubmitting}
          />
        </div>

        {/* Plate Number */}
        <div>
          <label
            htmlFor="plate_number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nomor Plat <span className="text-red-500">*</span>
          </label>
          <Input
            id="plate_number"
            type="text"
            placeholder="contoh: B 1234 XYZ"
            {...register("plate_number")}
            error={errors.plate_number?.message}
            disabled={isSubmitting}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: 1-2 huruf, spasi, 1-4 digit, spasi, 1-3 huruf
          </p>
        </div>

        {/* Vehicle Type */}
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Jenis Kendaraan <span className="text-red-500">*</span>
          </label>
          {isLoadingTypes ? (
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
              <span className="text-sm text-gray-600">Memuat jenis...</span>
            </div>
          ) : (
            <select
              id="type"
              {...register("type")}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.type ? "border-red-500" : ""
                }`}
            >
              <option value="">Pilih jenis kendaraan</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          )}
          {errors.type?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            {...register("status")}
            disabled={isSubmitting}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.status ? "border-red-500" : ""
              }`}
          >
            <option value="available">Tersedia</option>
            <option value="on_duty">Bertugas</option>
            <option value="maintenance">Perawatan</option>
          </select>
          {errors.status?.message && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Form Errors */}
        <FormErrorsSummary errors={errors} />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {initialData ? "Memperbarui..." : "Membuat..."}
            </span>
          ) : (
            <span>{initialData ? "Perbarui Kendaraan" : "Buat Kendaraan"}</span>
          )}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => window.history.back()}
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
          Batal
        </Button>
      </div>
    </form>
  );
}
