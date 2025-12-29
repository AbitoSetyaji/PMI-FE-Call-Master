// User and Authentication Types
export type UserRole = "admin" | "driver" | "reporter";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user?: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

// Vehicle Types
export interface VehicleType {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateVehicleTypeRequest {
  name: string;
  description?: string;
}

// Vehicle
export interface Vehicle {
  id: string;
  plate_number: string;
  name: string;
  vehicle_type_id: string;
  vehicle_type?: VehicleType;
  status: VehicleStatus;
  driver_id?: string;
  driver?: User;
  created_at?: string;
  updated_at?: string;
}

export type VehicleStatus = "available" | "in_use" | "maintenance" | "inactive" | "on_duty";

export interface CreateVehicleRequest {
  plate_number: string;
  name: string;
  vehicle_type_id: string;
}

export interface UpdateVehicleRequest {
  plate_number?: string;
  name?: string;
  vehicle_type_id?: string;
  status?: VehicleStatus;
  driver_id?: string;
}

// Report
export interface Report {
  id: string;
  reporter_id?: string;
  reporter?: User;

  // Requester Information
  requester_name: string;
  requester_phone: string;

  // Transport Type
  transport_type: string;
  transport_type_name?: string;
  use_stretcher: boolean;

  // Patient Information
  patient_name: string;
  patient_gender: "male" | "female";
  patient_age: number;
  patient_history?: string;

  // Pickup & Destination
  pickup_address: string;
  destination_address: string;
  schedule_date: string;
  schedule_time: string;

  // Contact Person
  contact_person_name: string;
  contact_person_phone: string;

  // Additional Info
  note?: string;
  attachment_ktp?: string;
  attachment_house_photo?: string;
  attachment_sharelok?: string;

  // Status
  status: ReportStatus;

  created_at: string;
  updated_at?: string;
}

export type ReportStatus =
  | "pending"
  | "assigned"
  | "on_way"
  | "arrived_pickup"
  | "arrived_destination"
  | "done"
  | "canceled";

export interface CreateReportRequest {
  // Requester Information
  requester_name: string;
  requester_phone: string;

  // Transport Type
  transport_type: string; // Vehicle type ID (UUID)
  use_stretcher: boolean;

  // Patient Information
  patient_name: string;
  patient_gender: "male" | "female";
  patient_age: number;
  patient_history?: string;

  // Pickup & Destination
  pickup_address: string;
  destination_address: string;
  schedule_date: string; // ISO date string or date
  schedule_time: string; // Time string

  // Contact Person
  contact_person_name: string;
  contact_person_phone: string;

  // Additional Info
  note?: string;
  attachment_ktp?: string;
  attachment_house_photo?: string;
  attachment_sharelok?: string;
}

export interface UpdateReportRequest {
  requester_name?: string;
  requester_phone?: string;
  transport_type?: string;
  use_stretcher?: boolean;
  patient_name?: string;
  patient_gender?: "male" | "female";
  patient_age?: number;
  patient_history?: string;
  pickup_address?: string;
  destination_address?: string;
  schedule_date?: string;
  schedule_time?: string;
  contact_person_name?: string;
  contact_person_phone?: string;
  note?: string;
  attachment_ktp?: string;
  attachment_house_photo?: string;
  attachment_sharelok?: string;
  status?: ReportStatus;
}

// Assignment
export interface Assignment {
  id: string;
  report_id: string;
  report?: Report;
  vehicle_id?: string;  // Optional since driver can select later
  vehicle?: Vehicle;
  driver_id: string;
  driver?: User;
  driver_name?: string; // Added: Backend returns this directly
  vehicle_plate?: string; // Added: Backend returns this directly
  assigned_by_id?: string;
  assigned_by?: User;
  status: AssignmentStatus;
  assigned_at: string;  // When the assignment was created
  completed_at?: string;  // When the assignment was completed
  created_at?: string;
  updated_at?: string;
}

// Assignment Status Lifecycle:
// active → assigned → on_progress → completed
//                                ↘ cancelled
export type AssignmentStatus = "active" | "assigned" | "on_progress" | "completed" | "cancelled";

export interface CreateAssignmentRequest {
  report_id: string;
  vehicle_id?: string; // Optional - driver can select later
  driver_id: string;
}

export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
}

// Driver Location with full assignment details for tracking
export interface DriverLocationReport {
  id: string;
  requester_name?: string;
  requester_phone?: string;
  transport_type?: string;
  use_stretcher?: boolean;
  pickup_address?: string;
  destination_address?: string;
  notes?: string;
  status?: string;
}

export interface DriverLocation {
  id: string;
  driver_id: string;
  driver?: User;
  assignment_id?: string;
  driver_name?: string;
  driver_phone?: string;
  vehicle_license_plate?: string;
  vehicle_name?: string;
  latitude: number;
  longitude: number;
  timestamp?: string;
  created_at?: string;
  updated_at?: string;
  report?: DriverLocationReport;
}

export interface CreateDriverLocationRequest {
  driver_id: string;
  latitude: number;
  longitude: number;
  assignment_id?: string;
}

// API Response Wrapper
export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T = any> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}
