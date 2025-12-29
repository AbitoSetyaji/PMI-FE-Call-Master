# Custom Hooks Documentation

This document describes the custom React Query hooks available in the PMI Emergency Call System.

## Overview

All hooks are built on top of React Query (TanStack Query) for efficient server state management with automatic caching, refetching, and optimistic updates.

## Import

```typescript
// Import individual hooks
import { useReports, useCreateReport } from "@/hooks/useReports";

// Or import from barrel export
import { useReports, useAssignments, useVehicles } from "@/hooks";
```

---

## Reports Hooks

### `useReports(filters?)`

Fetch paginated reports with optional filters.

**Parameters:**

- `filters?: { status?, priority?, search?, skip?, limit? }`

**Returns:** React Query result with `data`, `isLoading`, `error`, etc.

**Example:**

```typescript
const { data, isLoading } = useReports({
  status: "pending",
  priority: "high",
});
```

### `useReportById(id)`

Fetch single report by ID.

**Example:**

```typescript
const { data: report } = useReportById("report-id");
```

### `useCreateReport()`

Mutation hook to create a new report.

**Example:**

```typescript
const createReport = useCreateReport();

createReport.mutate({
  caller_name: "John Doe",
  caller_phone: "08123456789",
  location: "Jl. Sudirman",
  priority: "high",
});
```

### `useUpdateReport(id)`

Mutation hook to update a report.

### `useUpdateReportStatus(id)`

Mutation hook to update report status only.

**Example:**

```typescript
const updateStatus = useUpdateReportStatus(reportId);
updateStatus.mutate("assigned");
```

---

## Assignments Hooks

### `useAssignments(filters?)`

Fetch paginated assignments with optional filters.

**Parameters:**

- `filters?: { status?, driver_id?, skip?, limit? }`

**Example:**

```typescript
const { data } = useAssignments({
  driver_id: currentUserId,
  status: "on_progress",
});
```

### `useAssignmentById(id)`

Fetch single assignment by ID.

### `useCreateAssignment()`

Mutation hook to create a new assignment.

**Example:**

```typescript
const createAssignment = useCreateAssignment();

createAssignment.mutate({
  report_id: "report-id",
  driver_id: "driver-id",
  vehicle_id: "vehicle-id",
});
```

### `useUpdateAssignmentStatus(id)`

Mutation hook to update assignment status.

**Example:**

```typescript
const updateStatus = useUpdateAssignmentStatus(assignmentId);
updateStatus.mutate("completed");
```

---

## Vehicles Hooks

### `useVehicles(filters?)`

Fetch paginated vehicles with optional filters.

**Parameters:**

- `filters?: { status?, skip?, limit? }`

### `useVehicleById(id)`

Fetch single vehicle by ID.

### `useVehicleTypes()`

Fetch all vehicle types. Data is cached for 5 minutes.

**Example:**

```typescript
const { data: vehicleTypes } = useVehicleTypes();
```

### `useCreateVehicle()`

Mutation hook to create a new vehicle.

### `useUpdateVehicle(id)`

Mutation hook to update a vehicle.

### `useDeleteVehicle()`

Mutation hook to delete a vehicle.

**Example:**

```typescript
const deleteVehicle = useDeleteVehicle();
deleteVehicle.mutate(vehicleId);
```

### Vehicle Types Mutations

- `useCreateVehicleType()`
- `useUpdateVehicleType(id)`
- `useDeleteVehicleType()`

---

## Users Hooks

### `useUsers(filters?)`

Fetch paginated users with optional filters.

**Parameters:**

- `filters?: { role?, skip?, limit? }`

### `useUserById(id)`

Fetch single user by ID.

### `useDrivers()`

Shorthand for fetching all drivers.

**Example:**

```typescript
const { data: drivers } = useDrivers();
```

### `useAdmins()`

Shorthand for fetching all admins.

### `useReporters()`

Shorthand for fetching all reporters.

### User Mutations

- `useCreateUser()` - Admin only
- `useUpdateUser(id)` - Admin only
- `useDeleteUser()` - Admin only

---

## Driver Locations Hooks

### `useDriverLocations(options?)`

Fetch all driver locations with automatic polling for real-time updates.

**Parameters:**

- `options?: { refetchInterval?, enabled? }`

**Example:**

```typescript
const { data: locations } = useDriverLocations({
  refetchInterval: 30000, // 30 seconds
});
```

### `useDriverLocation(driverId)`

Fetch single driver location with automatic polling.

### `useUpdateDriverLocation()`

Mutation hook to update driver location.

**Example:**

```typescript
const updateLocation = useUpdateDriverLocation();

updateLocation.mutate({
  driver_id: currentUserId,
  latitude: -6.2088,
  longitude: 106.8456,
  status: "on_duty",
});
```

### `useLocationTracking(options?)`

Advanced hook for continuous location tracking with browser geolocation API.

**Parameters:**

```typescript
{
  enabled?: boolean;
  interval?: number;
  driverId?: string;
  onLocationUpdate?: (position: GeolocationPosition) => void;
}
```

**Example:**

```typescript
const { getCurrentLocation, isUpdating } = useLocationTracking({
  enabled: true,
  driverId: currentUserId,
  onLocationUpdate: (position) => {
    console.log("Location updated:", position.coords);
  },
});

// Manually trigger location update
getCurrentLocation();
```

---

## Query Keys

Each hook module exports query keys for advanced usage:

```typescript
import { reportKeys } from "@/hooks/useReports";
import { assignmentKeys } from "@/hooks/useAssignments";

// Invalidate specific queries
queryClient.invalidateQueries({ queryKey: reportKeys.lists() });
queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(id) });
```

---

## Cache Configuration

Default settings in `Providers.tsx`:

```typescript
{
  queries: {
    staleTime: 60 * 1000,        // 1 minute
    gcTime: 5 * 60 * 1000,       // 5 minutes garbage collection
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1
  },
  mutations: {
    retry: 0
  }
}
```

### Per-Hook Overrides:

- **Reports**: 30s staleTime (frequently updated)
- **Assignments**: 30s staleTime
- **Vehicles**: 60s staleTime (less frequent updates)
- **Vehicle Types**: 5 minutes staleTime (rarely changes)
- **Driver Locations**: 0s staleTime with 30s polling (real-time)

---

## Automatic Features

All mutation hooks include:

1. **Automatic Cache Invalidation**: Related queries are invalidated after mutations
2. **Toast Notifications**: Success and error messages via Sonner
3. **Error Handling**: Axios error responses are parsed and displayed
4. **Type Safety**: Full TypeScript support with proper types

---

## Best Practices

### 1. Use Query Keys for Invalidation

```typescript
const createReport = useCreateReport();

createReport.mutate(data, {
  onSuccess: () => {
    // Additional invalidations if needed
    queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
  },
});
```

### 2. Enable/Disable Queries Conditionally

```typescript
const { data } = useReportById(reportId, {
  enabled: !!reportId, // Only fetch if ID exists
});
```

### 3. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useReports();

if (isLoading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return null;

return <ReportsList reports={data.data} />;
```

### 4. Optimistic Updates (Advanced)

```typescript
const updateStatus = useUpdateReportStatus(reportId);

updateStatus.mutate("completed", {
  onMutate: async (newStatus) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: reportKeys.detail(reportId) });

    // Snapshot current value
    const previous = queryClient.getQueryData(reportKeys.detail(reportId));

    // Optimistically update
    queryClient.setQueryData(reportKeys.detail(reportId), (old) => ({
      ...old,
      status: newStatus,
    }));

    return { previous };
  },
  onError: (err, newStatus, context) => {
    // Rollback on error
    queryClient.setQueryData(reportKeys.detail(reportId), context.previous);
  },
});
```

---

## Troubleshooting

### Query Not Refetching

- Check `enabled` option
- Verify `staleTime` configuration
- Use `refetch()` manually if needed

### Mutation Not Updating UI

- Ensure cache invalidation is set up
- Check query keys match
- Verify mutation `onSuccess` is triggered

### Real-time Updates Not Working

- Check `refetchInterval` is set
- Ensure query is enabled
- Verify API is returning fresh data

---

**Last Updated**: November 3, 2025
