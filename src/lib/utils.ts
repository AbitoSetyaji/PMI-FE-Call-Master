import { type ClassValue, clsx } from "clsx";

// Combine classnames
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// Format date and time
export function formatDateTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Format date only
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Format time only
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Get status badge color
export function getStatusColor(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    // Report statuses
    open: "default",
    in_progress: "secondary",
    assigned: "secondary",
    completed: "default",
    cancelled: "destructive",

    // Assignment statuses
    pending: "default",
    accepted: "secondary",
    rejected: "destructive",

    // Vehicle statuses
    available: "default",
    in_use: "secondary",
    maintenance: "destructive",
    inactive: "outline",

    // User roles
    admin: "default",
    driver: "secondary",
    reporter: "outline",

    // Priority levels
    low: "outline",
    medium: "secondary",
    high: "default",
    urgent: "destructive",
  };

  return statusMap[status] || "default";
}

// Get priority badge color
export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    urgent: "bg-red-100 text-red-800",
  };
  return colors[priority] || "bg-gray-100 text-gray-800";
}

// Get status badge color class
export function getStatusBadgeColor(status: string): string {
  const colors: Record<string, string> = {
    // Report statuses
    open: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    assigned: "bg-indigo-100 text-indigo-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",

    // Assignment statuses
    pending: "bg-yellow-100 text-yellow-800",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",

    // Vehicle statuses
    available: "bg-green-100 text-green-800",
    in_use: "bg-blue-100 text-blue-800",
    maintenance: "bg-orange-100 text-orange-800",
    inactive: "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

// Capitalize first letter
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Format role name
export function formatRole(role: string): string {
  const roleMap: Record<string, string> = {
    admin: "Administrator",
    driver: "Driver",
    reporter: "Reporter",
  };
  return roleMap[role] || capitalize(role);
}

// Format status name
export function formatStatus(status: string): string {
  return status
    .split("_")
    .map((word) => capitalize(word))
    .join(" ");
}

// Convert file size to readable format
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^(\+62|0)[0-9]{9,12}$/;
  return phoneRegex.test(phone.replace(/[-\s]/g, ""));
}

// Distance between two coordinates (in km)
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Format coordinates
export function formatCoordinates(lat: number, lon: number): string {
  return `${lat.toFixed(6)}, ${lon.toFixed(6)}`;
}

// Generate formatted Report ID
// Format: SMG-[TYPE]-[DDMM]-[HHMMYY]
// Example: SMG-MJ-3012-194626 (Mobil Jenazah on 30/12/2026 at 19:46)
// Example: SMG-AAJ-0101-130026 (Ambulan on 01/01/2026 at 13:00)
export function generateReportDisplayId(
  transportTypeName: string | null | undefined,
  scheduleDate: string | null | undefined,
  scheduleTime: string | null | undefined
): string {
  // Determine transport type code
  let typeCode = "UNK"; // Unknown
  if (transportTypeName) {
    const typeLower = transportTypeName.toLowerCase();
    if (typeLower.includes("jenazah") || typeLower.includes("coffin") || typeLower.includes("hearse")) {
      typeCode = "MJ"; // Mobil Jenazah
    } else if (typeLower.includes("ambulan") || typeLower.includes("ambulance")) {
      typeCode = "AAJ"; // Ambulan
    }
  }

  // Parse date (format: YYYY-MM-DD)
  let dateCode = "0000";
  let yearCode = "00";
  if (scheduleDate) {
    const dateParts = scheduleDate.split("-");
    if (dateParts.length === 3) {
      const year = dateParts[0];
      const day = dateParts[2].padStart(2, "0");
      const month = dateParts[1].padStart(2, "0");
      dateCode = `${day}${month}`;
      yearCode = year.slice(-2); // Last 2 digits of year
    }
  }

  // Parse time (format: HH:MM or HH:MM:SS)
  let timeCode = "0000";
  if (scheduleTime) {
    const timeParts = scheduleTime.split(":");
    if (timeParts.length >= 2) {
      const hour = timeParts[0].padStart(2, "0");
      const minute = timeParts[1].padStart(2, "0");
      timeCode = `${hour}${minute}`;
    }
  }

  return `SMG-${typeCode}-${dateCode}-${timeCode}${yearCode}`;
}
