import { z } from "zod";

// ============== AUTH VALIDATION ==============
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["admin", "driver", "reporter"]),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// ============== VEHICLE TYPE VALIDATION ==============
export const vehicleTypeSchema = z.object({
  name: z.string().min(2, "Name is required"),
  description: z.string().optional(),
});

// ============== VEHICLE VALIDATION ==============
export const vehicleSchema = z.object({
  name: z.string().min(2, "Vehicle name is required"),
  plate_number: z.string().min(4, "Plate number must be at least 4 characters"),
  type: z.string().min(1, "Vehicle type is required"),
  status: z.enum(["available", "on_duty", "maintenance", "in_use"]).default("available"),
});

export const updateVehicleSchema = z.object({
  plate_number: z
    .string()
    .min(4, "Plate number must be at least 4 characters")
    .optional(),
  name: z.string().min(2, "Vehicle name is required").optional(),
  vehicle_type_id: z.string().uuid("Invalid vehicle type").optional(),
  status: z.enum(["available", "in_use", "maintenance", "inactive"]).optional(),
  driver_id: z.string().uuid().optional().nullable(),
});

// ============== REPORT VALIDATION ==============
export const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(5, "Location is required"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
});

export const updateReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .optional(),
  location: z.string().min(5, "Location is required").optional(),
  status: z
    .enum(["open", "in_progress", "assigned", "completed", "cancelled"])
    .optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
});

// ============== ASSIGNMENT VALIDATION ==============
export const assignmentSchema = z.object({
  report_id: z.string().uuid("Invalid report"),
  vehicle_id: z.string().uuid("Invalid vehicle"),
  driver_id: z.string().uuid("Invalid driver"),
});

export const updateAssignmentSchema = z.object({
  status: z
    .enum(["pending", "accepted", "rejected", "completed"])
    .optional(),
});

// ============== DRIVER LOCATION VALIDATION ==============
export const driverLocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number()
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
});

// ============== USER VALIDATION ==============
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "driver", "reporter"]),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  role: z.enum(["admin", "driver", "reporter"]).optional(),
});

// ============== PASSWORD VALIDATION ==============
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports for use in components
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type VehicleTypeFormData = z.infer<typeof vehicleTypeSchema>;
export type VehicleFormData = z.infer<typeof vehicleSchema>;
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>;
export type ReportFormData = z.infer<typeof reportSchema>;
export type UpdateReportFormData = z.infer<typeof updateReportSchema>;
export type AssignmentFormData = z.infer<typeof assignmentSchema>;
export type UpdateAssignmentFormData = z.infer<typeof updateAssignmentSchema>;
export type DriverLocationFormData = z.infer<typeof driverLocationSchema>;
export type UserFormData = z.infer<typeof userSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
