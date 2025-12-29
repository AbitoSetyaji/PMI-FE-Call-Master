import type {
  User,
  Vehicle,
  VehicleType,
  Report,
  Assignment,
  DriverLocation,
  CreateVehicleTypeRequest,
  CreateVehicleRequest,
  UpdateVehicleRequest,
  CreateReportRequest,
  UpdateReportRequest,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  CreateDriverLocationRequest,
  ApiResponse,
  PaginatedResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("pmi_auth_token") : null;

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// ============== USERS (helper functions) ==============

export async function getUserById(id: string): Promise<User> {
  const response = await apiCall<ApiResponse<User>>(`/users/${id}`);
  return response.data!;
}

export async function updateUser(
  id: string,
  data: Partial<User>
): Promise<User> {
  const response = await apiCall<ApiResponse<User>>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data!;
}

// ============== VEHICLE TYPES ==============
export const vehicleTypes = {
  getVehicleTypes: async (): Promise<ApiResponse<VehicleType[]>> => {
    return await apiCall<ApiResponse<VehicleType[]>>("/vehicle-types");
  },
  getById: async (id: string): Promise<ApiResponse<VehicleType>> => {
    return await apiCall<ApiResponse<VehicleType>>(`/vehicle-types/${id}`);
  },
  createVehicleType: async (data: CreateVehicleTypeRequest): Promise<ApiResponse<VehicleType>> => {
    return await apiCall<ApiResponse<VehicleType>>("/vehicle-types", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateVehicleType: async (id: string, data: Partial<CreateVehicleTypeRequest>): Promise<ApiResponse<VehicleType>> => {
    return await apiCall<ApiResponse<VehicleType>>(`/vehicle-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteVehicleType: async (id: string): Promise<ApiResponse<void>> => {
    return await apiCall<ApiResponse<void>>(`/vehicle-types/${id}`, {
      method: "DELETE",
    });
  },
};

export const vehicleTypesApi = vehicleTypes;

// Helper functions for backward compatibility
export async function getVehicleTypeById(id: string): Promise<VehicleType> {
  const response = await apiCall<ApiResponse<VehicleType>>(`/vehicle-types/${id}`);
  return response.data!;
}

export async function createVehicleType(data: CreateVehicleTypeRequest): Promise<VehicleType> {
  const response = await apiCall<ApiResponse<VehicleType>>("/vehicle-types", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function updateVehicleType(id: string, data: Partial<CreateVehicleTypeRequest>): Promise<VehicleType> {
  const response = await apiCall<ApiResponse<VehicleType>>(`/vehicle-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function deleteVehicleType(id: string): Promise<void> {
  await apiCall(`/vehicle-types/${id}`, {
    method: "DELETE",
  });
}

// ============== VEHICLES ==============
export const vehicles = {
  getAll: async (params?: { status?: string }): Promise<ApiResponse<Vehicle[]>> => {
    const queryParams = params?.status ? `?status=${params.status}` : '';
    return await apiCall<ApiResponse<Vehicle[]>>(`/vehicles${queryParams}`);
  },
  getById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    return await apiCall<ApiResponse<Vehicle>>(`/vehicles/${id}`);
  },
  // Alias for getById for backward compatibility
  getVehicleById: async (id: string): Promise<ApiResponse<Vehicle>> => {
    return await apiCall<ApiResponse<Vehicle>>(`/vehicles/${id}`);
  },
  createVehicle: async (data: CreateVehicleRequest): Promise<ApiResponse<Vehicle>> => {
    return await apiCall<ApiResponse<Vehicle>>("/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  updateVehicle: async (id: string, data: UpdateVehicleRequest): Promise<ApiResponse<Vehicle>> => {
    return await apiCall<ApiResponse<Vehicle>>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
  deleteVehicle: async (id: string): Promise<ApiResponse<void>> => {
    return await apiCall<ApiResponse<void>>(`/vehicles/${id}`, {
      method: "DELETE",
    });
  },
};

// Helper functions for backward compatibility
export async function getVehicleById(id: string): Promise<Vehicle> {
  const response = await apiCall<ApiResponse<Vehicle>>(`/vehicles/${id}`);
  return response.data!;
}

export async function createVehicle(data: CreateVehicleRequest): Promise<Vehicle> {
  const response = await apiCall<ApiResponse<Vehicle>>("/vehicles", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function updateVehicle(id: string, data: UpdateVehicleRequest): Promise<Vehicle> {
  const response = await apiCall<ApiResponse<Vehicle>>(`/vehicles/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function deleteVehicle(id: string): Promise<void> {
  await apiCall(`/vehicles/${id}`, {
    method: "DELETE",
  });
}

// ============== REPORTS ==============
export async function reports(): Promise<Report[]> {
  const response = await apiCall<ApiResponse<Report[]>>("/reports");
  return response.data || [];
}

export async function getReportById(id: string): Promise<Report> {
  const response = await apiCall<ApiResponse<Report>>(`/reports/${id}`);
  return response.data!;
}

export async function createReport(
  data: CreateReportRequest
): Promise<Report> {
  const response = await apiCall<ApiResponse<Report>>("/reports", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function updateReport(
  id: string,
  data: UpdateReportRequest
): Promise<Report> {
  const response = await apiCall<ApiResponse<Report>>(`/reports/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function deleteReport(id: string): Promise<void> {
  await apiCall(`/reports/${id}`, {
    method: "DELETE",
  });
}

// ============== ASSIGNMENTS ==============
export async function assignments(): Promise<Assignment[]> {
  const response = await apiCall<ApiResponse<Assignment[]>>("/assignments");
  return response.data || [];
}

export async function getAssignmentById(id: string): Promise<Assignment> {
  const response = await apiCall<ApiResponse<Assignment>>(
    `/assignments/${id}`
  );
  return response.data!;
}

export async function createAssignment(
  data: CreateAssignmentRequest
): Promise<Assignment> {
  const response = await apiCall<ApiResponse<Assignment>>("/assignments", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return response.data!;
}

export async function updateAssignment(
  id: string,
  data: UpdateAssignmentRequest
): Promise<Assignment> {
  const response = await apiCall<ApiResponse<Assignment>>(
    `/assignments/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
  return response.data!;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiCall(`/assignments/${id}`, {
    method: "DELETE",
  });
}

// ============== DRIVER LOCATIONS ==============
export async function getDriverLocationsList(): Promise<DriverLocation[]> {
  const response = await apiCall<ApiResponse<DriverLocation[]>>(
    "/driver-locations"
  );
  return response.data || [];
}

export async function getDriverLocationById(id: string): Promise<DriverLocation> {
  const response = await apiCall<ApiResponse<DriverLocation>>(
    `/driver-locations/${id}`
  );
  return response.data!;
}

export async function createDriverLocation(
  data: CreateDriverLocationRequest
): Promise<DriverLocation> {
  const response = await apiCall<ApiResponse<DriverLocation>>(
    "/driver-locations",
    {
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  return response.data!;
}

// ============== ORGANIZED API OBJECTS ==============

// Assignments API
export const assignmentsApi = {
  getAll: assignments,
  getById: getAssignmentById,
  create: createAssignment,
  update: updateAssignment,
  delete: deleteAssignment,

  // Driver-specific endpoints
  getAssignmentsByDriver: async (driverId: string): Promise<ApiResponse<Assignment[]>> => {
    return await apiCall<ApiResponse<Assignment[]>>(`/assignments/driver/${driverId}`);
  },

  updateDriverAssignment: async (
    assignmentId: string,
    data: { vehicle_id?: string; status?: string }
  ): Promise<ApiResponse<Assignment>> => {
    return await apiCall<ApiResponse<Assignment>>(`/assignments/${assignmentId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Reports API
export const reportsApi = {
  getAll: reports,
  getById: getReportById,
  create: createReport,
  update: updateReport,
  delete: deleteReport,

  // Update report status
  updateReportStatus: async (
    reportId: string,
    data: { status: string }
  ): Promise<ApiResponse<Report>> => {
    return await apiCall<ApiResponse<Report>>(`/reports/${reportId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// Vehicles API
export const vehiclesApi = {
  getAll: vehicles.getAll,
  getById: vehicles.getById,
  create: vehicles.createVehicle,
  update: vehicles.updateVehicle,
  delete: vehicles.deleteVehicle,
};

// Users API
export const users = {
  getAll: async (params?: { role?: string }): Promise<User[]> => {
    const queryParams = params?.role ? `?role=${params.role}` : '';
    const response = await apiCall<ApiResponse<User[]>>(`/users${queryParams}`);
    return response.data || [];
  },
  getUsers: async (params?: { role?: string }): Promise<ApiResponse<User[]>> => {
    const queryParams = params?.role ? `?role=${params.role}` : '';
    return await apiCall<ApiResponse<User[]>>(`/users${queryParams}`);
  },
  getById: getUserById,
  update: updateUser,
  createUser: async (data: { name: string; email: string; password: string; role: string }): Promise<ApiResponse<User>> => {
    return await apiCall<ApiResponse<User>>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
  updateUser: async (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return await apiCall<ApiResponse<User>>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
  deleteUser: async (id: string): Promise<ApiResponse<void>> => {
    return await apiCall<ApiResponse<void>>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

export const usersApi = users;

// Driver Locations API
export const driverLocations = {
  getDriverLocations: async (): Promise<ApiResponse<DriverLocation[]>> => {
    return await apiCall<ApiResponse<DriverLocation[]>>("/driver-locations/all/active");
  },
  getAll: getDriverLocationsList,
  getById: getDriverLocationById,
  create: createDriverLocation,
};

export const driverLocationsApi = driverLocations;
