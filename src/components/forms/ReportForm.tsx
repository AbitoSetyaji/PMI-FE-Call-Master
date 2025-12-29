"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";
import { useVehicleTypes } from "@/hooks/useVehicles";
import type { CreateReportRequest } from "@/lib/types";
import { toast } from "sonner";

const reportSchema = z.object({
  // Requester Information
  requester_name: z.string().min(1, "Requester name is required").max(255),
  requester_phone: z.string().min(1, "Phone number is required").max(20),

  // Transport Type
  transport_type: z.string().min(1, "Transport type is required"),
  use_stretcher: z.boolean().default(false),

  // Patient Information
  patient_name: z.string().min(1, "Patient name is required").max(255),
  patient_gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  patient_age: z
    .number()
    .int()
    .min(0, "Age must be at least 0")
    .max(150, "Age must be less than 150"),
  patient_history: z.string().optional().nullable(),

  // Pickup & Destination
  pickup_address: z.string().min(1, "Pickup address is required"),
  destination_address: z.string().min(1, "Destination address is required"),
  schedule_date: z.string().min(1, "Schedule date is required"),
  schedule_time: z.string().min(1, "Schedule time is required"),

  // Contact Person
  contact_person_name: z
    .string()
    .min(1, "Contact person name is required")
    .max(255),
  contact_person_phone: z
    .string()
    .min(1, "Contact person phone is required")
    .max(20),

  // Additional Info
  note: z.string().optional().nullable(),
  attachment_ktp: z.string().optional().nullable(),
  attachment_house_photo: z.string().optional().nullable(),
  attachment_sharelok: z.string().optional().nullable(),
});

type ReportFormData = z.infer<typeof reportSchema>;

interface ReportFormProps {
  initialData?: Partial<CreateReportRequest>;
  onSubmit: (data: CreateReportRequest) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
}

export default function ReportForm({
  initialData,
  onSubmit,
  isSubmitting = false,
  submitButtonText = "Submit Request",
}: ReportFormProps) {
  // Fetch vehicle types
  const { types: vehicleTypes, isLoading: isLoadingVehicleTypes } =
    useVehicleTypes();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      requester_name: initialData?.requester_name || "",
      requester_phone: initialData?.requester_phone || "",
      transport_type: initialData?.transport_type || "",
      use_stretcher: initialData?.use_stretcher || false,
      patient_name: initialData?.patient_name || "",
      patient_gender:
        (initialData?.patient_gender as "male" | "female") || "male",
      patient_age: initialData?.patient_age || 0,
      patient_history: initialData?.patient_history || "",
      pickup_address: initialData?.pickup_address || "",
      destination_address: initialData?.destination_address || "",
      schedule_date: initialData?.schedule_date || "",
      schedule_time: initialData?.schedule_time || "",
      contact_person_name: initialData?.contact_person_name || "",
      contact_person_phone: initialData?.contact_person_phone || "",
      note: initialData?.note || "",
      attachment_ktp: initialData?.attachment_ktp || "",
      attachment_house_photo: initialData?.attachment_house_photo || "",
      attachment_sharelok: initialData?.attachment_sharelok || "",
    },
  });

  // Watch transport_type to show/hide stretcher checkbox
  const selectedTransportType = watch("transport_type");

  // Find the selected vehicle type to check if it's mortuary transport
  const selectedVehicleType = vehicleTypes.find(
    (type) => type.id === selectedTransportType
  );
  const isMortuaryTransport = selectedVehicleType?.name === "mortuary_transport";

  // Reset use_stretcher when switching away from mortuary transport
  const handleTransportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const newVehicleType = vehicleTypes.find((type) => type.id === newValue);

    // If not mortuary transport, set use_stretcher to false
    if (newVehicleType?.name !== "mortuary_transport") {
      setValue("use_stretcher", false);
    }
  };

  const onFormSubmit = (data: ReportFormData) => {
    const submitData: CreateReportRequest = {
      requester_name: data.requester_name,
      requester_phone: data.requester_phone,
      transport_type: data.transport_type,
      use_stretcher: data.use_stretcher,
      patient_name: data.patient_name,
      patient_gender: data.patient_gender,
      patient_age: data.patient_age,
      patient_history: data.patient_history || undefined,
      pickup_address: data.pickup_address,
      destination_address: data.destination_address,
      schedule_date: data.schedule_date,
      schedule_time: data.schedule_time,
      contact_person_name: data.contact_person_name,
      contact_person_phone: data.contact_person_phone,
      note: data.note || undefined,
      attachment_ktp: data.attachment_ktp || undefined,
      attachment_house_photo: data.attachment_house_photo || undefined,
      attachment_sharelok: data.attachment_sharelok || undefined,
    };
    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Requester Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Requester Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requester Name <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("requester_name")}
              placeholder="Enter requester name"
              error={errors.requester_name?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("requester_phone")}
              type="tel"
              placeholder="+62xxxxxxxxxx"
              error={errors.requester_phone?.message}
            />
          </div>
        </div>
      </div>

      {/* Transport Type */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Transport Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transport Type <span className="text-red-600">*</span>
            </label>
            <select
              {...register("transport_type", {
                onChange: handleTransportTypeChange,
              })}
              disabled={isLoadingVehicleTypes}
              className={`w-full px-4 py-2 border ${errors.transport_type ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
            >
              <option value="">
                {isLoadingVehicleTypes ? "Loading..." : "Select transport type"}
              </option>
              {vehicleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
            {errors.transport_type && (
              <p className="text-red-500 text-sm mt-1">
                {errors.transport_type.message}
              </p>
            )}
          </div>

          {/* Only show checkbox for mortuary transport */}
          {isMortuaryTransport && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center">
                <input
                  {...register("use_stretcher")}
                  type="checkbox"
                  id="use_stretcher"
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label
                  htmlFor="use_stretcher"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Requires Coffin/Keranda
                </label>
              </div>
              <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm">
                ⚠️ Perhatian: Centang opsi ini jika membutuhkan layanan dengan keranda/peti jenazah. Pastikan informasi yang diberikan sudah benar.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Patient Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Patient Name <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("patient_name")}
              placeholder="Enter patient name"
              error={errors.patient_name?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender <span className="text-red-600">*</span>
              </label>
              <select
                {...register("patient_gender")}
                className={`w-full px-4 py-2 border ${errors.patient_gender ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {errors.patient_gender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.patient_gender.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("patient_age", { valueAsNumber: true })}
                type="number"
                min="0"
                max="150"
                placeholder="Enter patient age"
                error={errors.patient_age?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medical History (Optional)
            </label>
            <textarea
              {...register("patient_history")}
              rows={3}
              placeholder="Enter relevant medical history..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Pickup & Destination */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Pickup & Destination
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pickup Address <span className="text-red-600">*</span>
            </label>
            <textarea
              {...register("pickup_address")}
              rows={2}
              placeholder="Enter pickup address"
              className={`w-full px-4 py-2 border ${errors.pickup_address ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            />
            {errors.pickup_address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.pickup_address.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Destination Address <span className="text-red-600">*</span>
            </label>
            <textarea
              {...register("destination_address")}
              rows={2}
              placeholder="Enter destination address"
              className={`w-full px-4 py-2 border ${errors.destination_address
                  ? "border-red-500"
                  : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            />
            {errors.destination_address && (
              <p className="text-red-500 text-sm mt-1">
                {errors.destination_address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Date <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("schedule_date")}
                type="date"
                error={errors.schedule_date?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule Time <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("schedule_time")}
                type="time"
                error={errors.schedule_time?.message}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contact Person */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Contact Person
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Name <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("contact_person_name")}
              placeholder="Enter contact person name"
              error={errors.contact_person_name?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Person Phone <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("contact_person_phone")}
              type="tel"
              placeholder="+62xxxxxxxxxx"
              error={errors.contact_person_phone?.message}
            />
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Additional Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (Optional)
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Enter any additional notes..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KTP Attachment (Optional)
              </label>
              <Input
                {...register("attachment_ktp")}
                type="text"
                placeholder="KTP URL or file path"
                error={errors.attachment_ktp?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                House Photo (Optional)
              </label>
              <Input
                {...register("attachment_house_photo")}
                type="text"
                placeholder="Photo URL or file path"
                error={errors.attachment_house_photo?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Location (Optional)
              </label>
              <Input
                {...register("attachment_sharelok")}
                type="text"
                placeholder="Location link"
                error={errors.attachment_sharelok?.message}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            💡 Tip: Attachments help us verify and process your request faster
          </p>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? "Saving..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}
