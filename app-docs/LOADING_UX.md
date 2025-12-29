# Loading States & UX Improvements Documentation

This document describes the loading states, skeleton loaders, confirmation dialogs, and optimistic updates implemented in the PMI Emergency Call System.

## Table of Contents

- [Loading Components](#loading-components)
- [Skeleton Loaders](#skeleton-loaders)
- [Button Loading States](#button-loading-states)
- [Confirmation Dialogs](#confirmation-dialogs)
- [Optimistic Updates](#optimistic-updates)
- [Best Practices](#best-practices)

---

## Loading Components

### `<LoadingSpinner>`

A versatile loading spinner with multiple sizes.

**Import:**

```tsx
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
```

**Usage:**

```tsx
// Basic usage
<LoadingSpinner />

// With custom size
<LoadingSpinner size="lg" />

// With loading text
<LoadingSpinner size="md" text="Loading data..." />
```

**Props:**

- `size?: "sm" | "md" | "lg"` - Spinner size (default: "md")
- `text?: string` - Optional loading text below spinner

### `<LoadingPage>`

Full-page loading state.

**Usage:**

```tsx
import { LoadingPage } from "@/components/ui/LoadingSpinner";

if (isLoading) {
  return <LoadingPage text="Loading dashboard..." />;
}
```

### `<ButtonSpinner>`

Small spinner for buttons.

**Usage:**

```tsx
import { ButtonSpinner } from "@/components/ui/LoadingSpinner";

<button disabled={isLoading}>
  {isLoading && <ButtonSpinner />}
  {isLoading ? "Saving..." : "Save"}
</button>;
```

---

## Skeleton Loaders

Skeleton loaders provide better UX while content is loading.

### Available Skeletons

#### `<SkeletonText>`

Animated text placeholder.

```tsx
import { SkeletonText } from "@/components/ui/LoadingSpinner";

<SkeletonText className="w-1/2" />
<SkeletonText className="w-3/4" />
```

#### `<SkeletonCard>`

Card loading state.

```tsx
import { SkeletonCard } from "@/components/ui/LoadingSpinner";

<SkeletonCard />;
```

#### `<SkeletonTable>`

Table loading state.

```tsx
import { SkeletonTable } from "@/components/ui/LoadingSpinner";

{
  isLoading ? <SkeletonTable rows={5} /> : <ActualTable data={data} />;
}
```

**Props:**

- `rows?: number` - Number of skeleton rows (default: 5)

#### `<SkeletonList>`

List of skeleton cards.

```tsx
import { SkeletonList } from "@/components/ui/LoadingSpinner";

{
  isLoading ? <SkeletonList items={3} /> : <CardsList data={data} />;
}
```

**Props:**

- `items?: number` - Number of skeleton items (default: 3)

#### `<SkeletonStats>`

Dashboard statistics skeleton.

```tsx
import { SkeletonStats } from "@/components/ui/LoadingSpinner";

{
  isLoading ? <SkeletonStats /> : <StatsCards data={stats} />;
}
```

#### `<SkeletonMap>`

Map loading placeholder.

```tsx
import { SkeletonMap } from "@/components/ui/LoadingSpinner";

{
  isLoading ? <SkeletonMap /> : <MapView locations={locations} />;
}
```

### Example: List Page with Skeleton

```tsx
export default function ReportsPage() {
  const { data, isLoading } = useReports();

  return (
    <div>
      <h1>Reports</h1>

      {isLoading ? (
        <SkeletonList items={5} />
      ) : (
        <div className="space-y-3">
          {data?.data.map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Button Loading States

### Enhanced Button Component

The `Button` component now supports loading states.

**Import:**

```tsx
import Button from "@/components/Button";
```

**Props:**

- `variant?: "primary" | "secondary" | "danger" | "success"` - Button style
- `isLoading?: boolean` - Show loading state
- `loadingText?: string` - Text to show when loading
- `disabled?: boolean` - Disable button

**Usage:**

```tsx
// Basic loading state
<Button
  isLoading={isSubmitting}
  onClick={handleSubmit}
>
  Save
</Button>

// Custom loading text
<Button
  isLoading={isDeleting}
  loadingText="Deleting..."
  variant="danger"
  onClick={handleDelete}
>
  Delete
</Button>

// Danger variant
<Button
  variant="danger"
  onClick={handleDelete}
>
  Delete
</Button>

// Success variant
<Button
  variant="success"
  onClick={handleConfirm}
>
  Confirm
</Button>
```

### Example: Form with Loading State

```tsx
function MyForm() {
  const mutation = useCreateReport();

  const onSubmit = (data: ReportFormData) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields... */}

      <Button
        type="submit"
        isLoading={mutation.isPending}
        loadingText="Creating..."
      >
        Create Report
      </Button>
    </form>
  );
}
```

---

## Confirmation Dialogs

### `<ConfirmDialog>`

Modal dialog for confirming destructive actions.

**Import:**

```tsx
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
```

**Props:**

- `isOpen: boolean` - Dialog visibility
- `onClose: () => void` - Close handler
- `onConfirm: () => void` - Confirm handler
- `title: string` - Dialog title
- `message: string` - Dialog message
- `confirmText?: string` - Confirm button text (default: "Confirm")
- `cancelText?: string` - Cancel button text (default: "Cancel")
- `type?: "danger" | "warning" | "info"` - Dialog type (default: "danger")
- `isLoading?: boolean` - Show loading in confirm button
- `icon?: ReactNode` - Custom icon

**Usage:**

```tsx
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useState } from "react";

function MyComponent() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    itemId: "",
  });

  const deleteMutation = useDeleteVehicle();

  const handleDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, itemId: id });
  };

  const confirmDelete = () => {
    deleteMutation.mutate(confirmDialog.itemId, {
      onSettled: () => {
        setConfirmDialog({ isOpen: false, itemId: "" });
      },
    });
  };

  return (
    <>
      <button onClick={() => handleDelete(vehicle.id)}>Delete</button>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, itemId: "" })}
        onConfirm={confirmDelete}
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle? This action cannot be undone."
        confirmText="Delete"
        type="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  );
}
```

### Dialog Types

#### Danger (Red)

For destructive actions like delete.

```tsx
<ConfirmDialog
  type="danger"
  title="Delete User"
  message="This will permanently delete the user."
/>
```

#### Warning (Yellow)

For potentially risky actions.

```tsx
<ConfirmDialog
  type="warning"
  title="Archive Report"
  message="This report will be archived and hidden from the main list."
/>
```

#### Info (Blue)

For informational confirmations.

```tsx
<ConfirmDialog
  type="info"
  title="Complete Assignment"
  message="Mark this assignment as completed?"
/>
```

---

## Optimistic Updates

Optimistic updates make the UI feel instant by updating the cache before the server responds.

### Basic Optimistic Update

**Import:**

```tsx
import { createOptimisticUpdate } from "@/lib/optimistic";
```

**Usage in Mutation:**

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createOptimisticUpdate } from "@/lib/optimistic";

function useUpdateStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: string) => api.updateStatus(id, status),
    ...createOptimisticUpdate(
      queryClient,
      ["items", id],
      (oldData, newStatus) => ({
        ...oldData,
        status: newStatus,
      })
    ),
  });
}
```

### Example: Update Report Status

```tsx
export function useUpdateReportStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: ReportStatus) =>
      reports.updateReportStatus(id, { status }),
    // Optimistic update
    onMutate: async (newStatus) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["reports", id] });

      // Snapshot previous value
      const previousReport = queryClient.getQueryData(["reports", id]);

      // Optimistically update
      queryClient.setQueryData(["reports", id], (old: any) => ({
        ...old,
        data: { ...old.data, status: newStatus },
      }));

      // Return context with previous value
      return { previousReport };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports", id] });
      toast.success("Status updated");
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousReport) {
        queryClient.setQueryData(["reports", id], context.previousReport);
      }
      toast.error("Failed to update status");
    },
    onSettled: () => {
      // Always refetch
      queryClient.invalidateQueries({ queryKey: ["reports", id] });
    },
  });
}
```

### Helper Functions

#### Add Item to List

```tsx
import { addItemOptimistically } from "@/lib/optimistic";

const mutation = useMutation({
  mutationFn: createItem,
  ...addItemOptimistically(queryClient, ["items"], newItem),
});
```

#### Remove Item from List

```tsx
import { removeItemOptimistically } from "@/lib/optimistic";

const mutation = useMutation({
  mutationFn: deleteItem,
  ...removeItemOptimistically(queryClient, ["items"], itemId),
});
```

#### Update Item in List

```tsx
import { updateItemOptimistically } from "@/lib/optimistic";

const mutation = useMutation({
  mutationFn: updateItem,
  ...updateItemOptimistically(queryClient, ["items"], itemId, (item) => ({
    ...item,
    status: "completed",
  })),
});
```

---

## Best Practices

### 1. Use Skeleton Loaders for Lists

✅ **Good:**

```tsx
{
  isLoading ? <SkeletonTable rows={10} /> : <DataTable data={data} />;
}
```

❌ **Bad:**

```tsx
{
  isLoading ? <p>Loading...</p> : <DataTable data={data} />;
}
```

### 2. Always Disable Buttons When Loading

✅ **Good:**

```tsx
<Button isLoading={mutation.isPending} onClick={handleSave}>
  Save
</Button>
```

❌ **Bad:**

```tsx
<button onClick={handleSave}>Save</button>
// User can click multiple times
```

### 3. Use Confirmation Dialogs for Destructive Actions

✅ **Good:**

```tsx
<ConfirmDialog
  isOpen={showConfirm}
  title="Delete Item"
  message="This action cannot be undone."
  onConfirm={handleDelete}
/>
```

❌ **Bad:**

```tsx
<button
  onClick={() => {
    if (confirm("Delete?")) {
      handleDelete();
    }
  }}
>
  Delete
</button>
// Native confirm() is ugly and not customizable
```

### 4. Show Loading Text for Long Operations

✅ **Good:**

```tsx
<Button isLoading={isUploading} loadingText="Uploading file...">
  Upload
</Button>
```

❌ **Bad:**

```tsx
<Button isLoading={isUploading}>Upload</Button>
// Just shows "Loading..." which is not specific
```

### 5. Use Optimistic Updates for Instant Feedback

✅ **Good:**

```tsx
const mutation = useMutation({
  mutationFn: updateLike,
  onMutate: async () => {
    // Update UI immediately
    setLiked(true);
  },
  onError: () => {
    // Rollback on error
    setLiked(false);
  },
});
```

❌ **Bad:**

```tsx
const mutation = useMutation({
  mutationFn: updateLike,
  onSuccess: () => {
    // Update UI after server responds (slow)
    setLiked(true);
  },
});
```

### 6. Combine Multiple Loading States

```tsx
function MyComponent() {
  const { data: reports, isLoading: reportsLoading } = useReports();
  const { data: vehicles, isLoading: vehiclesLoading } = useVehicles();

  const isLoading = reportsLoading || vehiclesLoading;

  if (isLoading) {
    return <LoadingPage text="Loading data..." />;
  }

  return (
    <>
      <ReportsSection reports={reports} />
      <VehiclesSection vehicles={vehicles} />
    </>
  );
}
```

### 7. Preserve Scroll Position with Skeletons

```tsx
{
  isLoading ? (
    // Same height as actual content
    <SkeletonList items={pageSize} />
  ) : (
    <ItemsList items={data} />
  );
}
```

---

## Animation Guidelines

### Tailwind Animations

Custom animations are defined in `tailwind.config.js`:

```javascript
extend: {
  animation: {
    'scale-in': 'scaleIn 0.2s ease-out',
    'fade-in': 'fadeIn 0.3s ease-out',
  },
  keyframes: {
    scaleIn: {
      '0%': { transform: 'scale(0.95)', opacity: '0' },
      '100%': { transform: 'scale(1)', opacity: '1' },
    },
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
  },
}
```

**Usage:**

```tsx
// Scale in animation
<div className="animate-scale-in">
  <ConfirmDialog />
</div>

// Fade in animation
<div className="animate-fade-in">
  <Content />
</div>
```

---

## Testing Loading States

### Test Skeleton Loaders

```tsx
// Simulate loading
const { result, rerender } = renderHook(() => useReports());

// Should show skeleton
expect(screen.getByTestId("skeleton-table")).toBeInTheDocument();

// After data loads
await waitFor(() => {
  expect(screen.getByText("Report #1")).toBeInTheDocument();
});
```

### Test Button Loading

```tsx
const { getByRole } = render(<MyForm />);
const button = getByRole("button", { name: /save/i });

fireEvent.click(button);

// Button should be disabled
expect(button).toBeDisabled();

// Should show loading text
expect(button).toHaveTextContent("Saving...");
```

---

**Last Updated**: November 4, 2025
