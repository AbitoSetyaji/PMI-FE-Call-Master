# Validation & Error Handling Documentation

This document describes the validation schemas and error handling mechanisms in the PMI Emergency Call System.

## Table of Contents

- [Validation Schemas](#validation-schemas)
- [Error Handling](#error-handling)
- [Error Components](#error-components)
- [Error Utilities](#error-utilities)
- [Best Practices](#best-practices)

---

## Validation Schemas

All validation schemas are centralized in `src/lib/validations.ts` using Zod.

### Import

```typescript
import {
  loginSchema,
  registerSchema,
  reportSchema,
  LoginFormData,
  RegisterFormData,
} from "@/lib/validations";
```

### Available Schemas

#### Authentication

**`loginSchema`**

```typescript
{
  email: string (email format)
  password: string (min 6 chars)
}
```

**`registerSchema`**

```typescript
{
  name: string (3-100 chars)
  email: string (email format)
  password: string (6-100 chars)
  role: "admin" | "driver" | "reporter"
}
```

**`changePasswordSchema`**

```typescript
{
  currentPassword: string
  newPassword: string (min 6 chars)
  confirmPassword: string (must match newPassword)
}
```

#### Reports

**`reportSchema`**

```typescript
{
  caller_name: string (3-100 chars)
  caller_phone: string (10-20 digits, valid phone format)
  location: string (5-500 chars)
  latitude?: number (-90 to 90)
  longitude?: number (-180 to 180)
  description?: string (max 2000 chars)
  priority: "low" | "medium" | "high" | "critical"
}
```

**`updateReportStatusSchema`**

```typescript
{
  status: "pending" | "assigned" | "on_progress" | "completed" | "cancelled";
}
```

#### Assignments

**`assignmentSchema`**

```typescript
{
  report_id: string;
  driver_id: string;
  vehicle_id: string;
}
```

**`updateAssignmentStatusSchema`**

```typescript
{
  status: "assigned" | "on_progress" | "completed";
}
```

#### Vehicles

**`vehicleSchema`**

```typescript
{
  license_plate: string (3-20 chars, alphanumeric)
  type_id: string
  status: "available" | "on_duty" | "maintenance"
}
```

**`vehicleTypeSchema`**

```typescript
{
  name: string (3-100 chars)
  description?: string (max 500 chars)
}
```

#### Users

**`userSchema`**

```typescript
{
  name: string (3-100 chars)
  email: string (email format)
  password?: string (min 6 chars, optional for updates)
  role: "admin" | "driver" | "reporter"
}
```

**`createUserSchema`**

```typescript
{
  name: string (3-100 chars)
  email: string (email format)
  password: string (min 6 chars, required)
  role: "admin" | "driver" | "reporter"
}
```

#### Driver Locations

**`driverLocationSchema`**

```typescript
{
  driver_id: string
  latitude: number (-90 to 90)
  longitude: number (-180 to 180)
  status?: "on_duty" | "idle"
}
```

### Usage with React Hook Form

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/lib/validations";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    // Form is valid
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <span>{errors.email.message}</span>}

      <input type="password" {...register("password")} />
      {errors.password && <span>{errors.password.message}</span>}

      <button type="submit">Login</button>
    </form>
  );
}
```

---

## Error Handling

### Global Error Handler (Axios Interceptor)

The axios interceptor in `src/lib/axiosInstance.ts` automatically handles:

- **Network errors**: Display toast notification
- **Timeout errors**: Display toast notification
- **401 Unauthorized**: Clear token, show toast, redirect to login
- **403 Forbidden**: Display toast with permission error
- **404 Not Found**: Display toast
- **422 Validation Error**: Display specific validation message
- **500+ Server Errors**: Display generic server error toast

All errors are logged to console in development mode.

### Error Messages

Predefined error messages:

```typescript
{
  NETWORK_ERROR: "Network error. Please check your internet connection.";
  TIMEOUT_ERROR: "Request timeout. Please try again.";
  UNAUTHORIZED: "Your session has expired. Please log in again.";
  FORBIDDEN: "You don't have permission to perform this action.";
  NOT_FOUND: "The requested resource was not found.";
  SERVER_ERROR: "Server error. Please try again later.";
  VALIDATION_ERROR: "Please check your input and try again.";
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.";
}
```

---

## Error Components

### `<ErrorBoundary>`

Catches React errors and displays fallback UI.

**Usage:**

```typescript
import ErrorBoundary from "@/components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <YourComponents />
    </ErrorBoundary>
  );
}

// With custom fallback
<ErrorBoundary fallback={<CustomErrorPage />}>
  <YourComponents />
</ErrorBoundary>;
```

**Features:**

- Catches all React component errors
- Displays error details in development
- Shows user-friendly message in production
- "Try Again" and "Go Home" buttons
- Logs errors for debugging

### `<FieldError>`

Displays inline field validation errors.

**Usage:**

```typescript
import { FieldError } from "@/components/ui/FormErrors";

<input {...register("email")} />
<FieldError message={errors.email?.message} />
```

### `<FormErrorsSummary>`

Displays all form errors in a summary block.

**Usage:**

```typescript
import { FormErrorsSummary } from "@/components/ui/FormErrors";

const {
  formState: { errors },
} = useForm();

<FormErrorsSummary errors={errors} />;
```

### `<ApiError>`

Displays API error messages.

**Usage:**

```typescript
import { ApiError } from "@/components/ui/FormErrors";

const { error } = useQuery(/* ... */);

<ApiError error={error} />;
```

### `<ValidationError>`

Generic validation error display.

**Usage:**

```typescript
import { ValidationError } from "@/components/ui/FormErrors";

<ValidationError
  title="Invalid Input"
  message="Please check your entries and try again"
/>;
```

---

## Error Utilities

### `getErrorMessage(error)`

Extracts error message from various error types.

```typescript
import { getErrorMessage } from "@/lib/errors";

try {
  await api.call();
} catch (error) {
  const message = getErrorMessage(error);
  console.log(message);
}
```

### Toast Helpers

```typescript
import {
  showErrorToast,
  showSuccessToast,
  showInfoToast,
  showWarningToast,
} from "@/lib/errors";

// Show error
showErrorToast(error, "Failed to save");

// Show success
showSuccessToast("Data saved successfully!");

// Show info
showInfoToast("Processing your request...");

// Show warning
showWarningToast("Your session will expire soon");
```

### Error Type Checkers

```typescript
import {
  isNetworkError,
  isValidationError,
  isAuthenticationError,
  isAuthorizationError,
  isNotFoundError,
  isServerError,
} from "@/lib/errors";

try {
  await api.call();
} catch (error) {
  if (isNetworkError(error)) {
    // Handle network error
  } else if (isValidationError(error)) {
    // Handle validation error
  }
}
```

### `formatValidationErrors(error)`

Formats FastAPI/Pydantic validation errors.

```typescript
import { formatValidationErrors } from "@/lib/errors";

try {
  await api.call();
} catch (error) {
  const fieldErrors = formatValidationErrors(error);
  if (fieldErrors) {
    // { email: "Invalid email", password: "Too short" }
    Object.entries(fieldErrors).forEach(([field, message]) => {
      setError(field, { message });
    });
  }
}
```

### `retryWithBackoff(fn, maxRetries, baseDelay)`

Retry failed requests with exponential backoff.

```typescript
import { retryWithBackoff } from "@/lib/errors";

const data = await retryWithBackoff(
  () => api.getData(),
  3, // max 3 retries
  1000 // start with 1s delay
);
```

### `tryCatch(fn, errorCallback)`

Safe async wrapper with error handling.

```typescript
import { tryCatch } from "@/lib/errors";

const [result, error] = await tryCatch(
  () => api.getData(),
  (err) => console.error("Error:", err)
);

if (error) {
  // Handle error
} else {
  // Use result
}
```

### `logErrorToService(error, context)`

Log errors to external service (Sentry, etc.).

```typescript
import { logErrorToService } from "@/lib/errors";

try {
  await api.call();
} catch (error) {
  logErrorToService(error, {
    userId: user.id,
    action: "create_report",
  });
}
```

---

## Best Practices

### 1. Always Validate Forms

```typescript
const form = useForm({
  resolver: zodResolver(reportSchema), // ✅ Use schema
});
```

### 2. Display Field Errors

```typescript
<input {...register("email")} />
<FieldError message={errors.email?.message} />  // ✅ Show error
```

### 3. Handle API Errors in Mutations

```typescript
const mutation = useMutation({
  mutationFn: createReport,
  onError: (error) => {
    showErrorToast(error); // ✅ Show toast
  },
});
```

### 4. Wrap Components with ErrorBoundary

```typescript
<ErrorBoundary>
  <Dashboard /> // ✅ Protected
</ErrorBoundary>
```

### 5. Use Type-Safe Form Data

```typescript
const onSubmit = (data: LoginFormData) => {
  // ✅ Type-safe
  // data is validated and typed
};
```

### 6. Check Error Types

```typescript
catch (error) {
  if (isAuthenticationError(error)) {
    // Redirect to login
  } else if (isValidationError(error)) {
    // Show validation errors
  }
}
```

### 7. Retry on Network Errors

```typescript
const data = await retryWithBackoff(
  () => api.unstableEndpoint(),
  3 // Retry 3 times
);
```

### 8. Log Critical Errors

```typescript
catch (error) {
  logErrorToService(error, { critical: true });
  showErrorToast(error);
}
```

---

## Testing Error Scenarios

### Network Error

```typescript
// Disconnect network
// Try to submit form
// Should see: "Network error. Please check your internet connection."
```

### Validation Error

```typescript
// Submit form with invalid email
// Should see: Field error under email input
```

### Unauthorized

```typescript
// Make request with expired token
// Should see: Toast + redirect to login
```

### Server Error

```typescript
// Trigger 500 error from API
// Should see: "Server error. Please try again later."
```

---

## Error Flow Diagram

```
User Action
    ↓
Form Validation (Zod)
    ↓ [Invalid]
Display Field Errors
    ↓ [Valid]
API Request (Axios)
    ↓ [Error]
Axios Interceptor
    ↓
Parse Error Type
    ↓
Display Toast
    ↓
Log to Console/Service
    ↓
[401] → Redirect to Login
[Other] → Stay on Page
```

---

**Last Updated**: November 3, 2025
