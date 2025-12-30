"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/Input";
import AddressAutocomplete from "@/components/ui/AddressAutocomplete";
import { useVehicleTypes } from "@/hooks/useVehicles";
import type { CreateReportRequest } from "@/lib/types";
import { toast } from "sonner";

const reportSchema = z.object({
  // Requester Information
  requester_name: z.string().min(1, "Nama pemohon wajib diisi").max(255),
  requester_phone: z.string().min(1, "Nomor telepon wajib diisi").max(20),

  // Transport Type
  transport_type: z.string().min(1, "Jenis transportasi wajib diisi"),
  use_stretcher: z.boolean().default(false),

  // Patient Information
  patient_name: z.string().min(1, "Nama pasien wajib diisi").max(255),
  patient_gender: z.enum(["male", "female"], {
    errorMap: () => ({ message: "Silakan pilih jenis kelamin" }),
  }),
  patient_age: z
    .number()
    .int()
    .min(0, "Usia minimal 0")
    .max(150, "Usia maksimal 150"),
  patient_history: z.string().optional().nullable(),

  // Pickup & Destination
  pickup_address: z.string().min(1, "Alamat jemput wajib diisi"),
  destination_address: z.string().min(1, "Alamat tujuan wajib diisi"),
  schedule_date: z.string().min(1, "Tanggal jadwal wajib diisi"),
  schedule_time: z.string().min(1, "Waktu jadwal wajib diisi"),

  // Contact Person
  contact_person_name: z
    .string()
    .min(1, "Nama kontak wajib diisi")
    .max(255),
  contact_person_phone: z
    .string()
    .min(1, "Telepon kontak wajib diisi")
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
  submitButtonText = "Kirim Permintaan",
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
  // Check if it's mortuary transport (matches 'jenazah' or 'mortuary' in name)
  const isMortuaryTransport = selectedVehicleType?.name?.toLowerCase().includes("jenazah") ||
    selectedVehicleType?.name?.toLowerCase().includes("mortuary");

  // Reset use_stretcher when switching away from mortuary transport
  const handleTransportTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    const newVehicleType = vehicleTypes.find((type) => type.id === newValue);

    // If not mortuary transport, set use_stretcher to false
    const isNewMortuary = newVehicleType?.name?.toLowerCase().includes("jenazah") ||
      newVehicleType?.name?.toLowerCase().includes("mortuary");
    if (!isNewMortuary) {
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
          Informasi Pemohon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pemohon <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("requester_name")}
              placeholder="Masukkan nama pemohon"
              error={errors.requester_name?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nomor Telepon <span className="text-red-600">*</span>
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
          Informasi Transportasi
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis Transportasi <span className="text-red-600">*</span>
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
                {isLoadingVehicleTypes ? "Memuat..." : "Pilih jenis transportasi"}
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
                  Membutuhkan Keranda Jenazah
                </label>
              </div>
              <div className="text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm">
                ⚠️ Perhatian: Centang opsi ini jika membutuhkan layanan dengan keranda jenazah. Pastikan informasi yang diberikan sudah benar.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Informasi Pasien
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Pasien <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("patient_name")}
              placeholder="Masukkan nama pasien"
              error={errors.patient_name?.message}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Kelamin <span className="text-red-600">*</span>
              </label>
              <select
                {...register("patient_gender")}
                className={`w-full px-4 py-2 border ${errors.patient_gender ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
              >
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
              {errors.patient_gender && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.patient_gender.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usia <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("patient_age", { valueAsNumber: true })}
                type="number"
                min="0"
                max="150"
                placeholder="Masukkan usia pasien"
                error={errors.patient_age?.message}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Riwayat Medis (Opsional)
            </label>
            <textarea
              {...register("patient_history")}
              rows={3}
              placeholder="Masukkan riwayat medis..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Pickup & Destination */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Lokasi Jemput & Tujuan
        </h2>
        <div className="space-y-4">
          <AddressAutocomplete
            label="Alamat Jemput"
            value={watch("pickup_address") || ""}
            onChange={(value) => setValue("pickup_address", value)}
            placeholder="Contoh: Jl. Pandanaran No.12, Semarang Tengah, Kota Semarang"
            required
            error={errors.pickup_address?.message}
          />

          <AddressAutocomplete
            label="Alamat Tujuan"
            value={watch("destination_address") || ""}
            onChange={(value) => setValue("destination_address", value)}
            placeholder="Contoh: RSUP Dr. Kariadi, Jl. Dr. Sutomo No.16, Semarang"
            required
            error={errors.destination_address?.message}
          />

          {/* Format Alamat Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-800 mb-2">💡 Tips Format Alamat:</p>
            <ul className="text-blue-700 space-y-1 list-disc list-inside">
              <li><strong>Alamat Rumah:</strong> Jl. Pemuda No.45, Semarang Tengah, Kota Semarang, Jawa Tengah</li>
              <li><strong>Rumah Sakit:</strong> RSUD Tugurejo, Kota Semarang, Jawa Tengah</li>
              <li><strong>Landmark:</strong> Alun-Alun Simpang Lima, Semarang</li>
            </ul>
            <p className="text-blue-600 mt-2 text-xs">
              📍 Tambahkan catatan landmark (dekat pom bensin, depan masjid) di kolom Catatan jika perlu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Jadwal <span className="text-red-600">*</span>
              </label>
              <Input
                {...register("schedule_date")}
                type="date"
                error={errors.schedule_date?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Waktu Jadwal <span className="text-red-600">*</span>
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
          Kontak Person
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nama Kontak <span className="text-red-600">*</span>
            </label>
            <Input
              {...register("contact_person_name")}
              placeholder="Masukkan nama kontak"
              error={errors.contact_person_name?.message}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telepon Kontak <span className="text-red-600">*</span>
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
          Informasi Tambahan
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (Opsional)
            </label>
            <textarea
              {...register("note")}
              rows={3}
              placeholder="Masukkan catatan tambahan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lampiran KTP (Opsional)
              </label>
              <Input
                {...register("attachment_ktp")}
                type="text"
                placeholder="URL atau path file KTP"
                error={errors.attachment_ktp?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto Rumah (Opsional)
              </label>
              <Input
                {...register("attachment_house_photo")}
                type="text"
                placeholder="URL atau path file foto"
                error={errors.attachment_house_photo?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bagikan Lokasi (Opsional)
              </label>
              <Input
                {...register("attachment_sharelok")}
                type="text"
                placeholder="Link lokasi"
                error={errors.attachment_sharelok?.message}
              />
            </div>
          </div>

          <p className="text-sm text-gray-500">
            💡 Tips: Lampiran membantu kami memverifikasi dan memproses permintaan Anda lebih cepat
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
          {isSubmitting ? "Menyimpan..." : submitButtonText}
        </button>
      </div>
    </form>
  );
}
