# Styling & Responsiveness Documentation

This document describes the styling improvements, color scheme, animations, and accessibility enhancements implemented in the PMI Emergency Call System.

## Table of Contents

- [Color Scheme](#color-scheme)
- [Responsive Design](#responsive-design)
- [Animations & Transitions](#animations--transitions)
- [Accessibility](#accessibility)
- [Component Styling](#component-styling)
- [Best Practices](#best-practices)

---

## Color Scheme

### PMI Brand Colors

The application uses PMI's official red color as the primary brand color.

**CSS Variables** (defined in `globals.css`):

```css
:root {
  --pmi-red: #dc2626;
  --pmi-red-dark: #b91c1c;
  --pmi-red-light: #fee2e2;
}
```

**Tailwind Theme** (defined in `tailwind.config.js`):

```javascript
colors: {
  pmi: {
    red: "#DC2626",
    "red-dark": "#B91C1C",
    "red-light": "#FEE2E2",
  }
}
```

**Usage:**

```tsx
// Tailwind class
<button className="bg-pmi-red text-white hover:bg-pmi-red-dark">
  Save
</button>

// CSS variable
<div style={{ backgroundColor: 'var(--pmi-red)' }}>
  Content
</div>
```

### Status Colors

Status colors follow a consistent scheme across the application.

| Status          | Color  | Hex       | Usage                       |
| --------------- | ------ | --------- | --------------------------- |
| **Pending**     | Yellow | `#EAB308` | Reports awaiting assignment |
| **Assigned**    | Blue   | `#3B82F6` | Assigned to driver/vehicle  |
| **On Progress** | Orange | `#F97316` | Currently being handled     |
| **Completed**   | Green  | `#22C55E` | Successfully completed      |
| **Cancelled**   | Gray   | `#6B7280` | Cancelled reports           |

**CSS Variables:**

```css
:root {
  --status-pending: #eab308;
  --status-pending-bg: #fef9c3;
  --status-assigned: #3b82f6;
  --status-assigned-bg: #dbeafe;
  --status-on-progress: #f97316;
  --status-on-progress-bg: #ffedd5;
  --status-completed: #22c55e;
  --status-completed-bg: #dcfce7;
  --status-cancelled: #6b7280;
  --status-cancelled-bg: #f3f4f6;
}
```

**Tailwind Theme:**

```javascript
colors: {
  status: {
    pending: "#EAB308",
    "pending-bg": "#FEF9C3",
    assigned: "#3B82F6",
    "assigned-bg": "#DBEAFE",
    "on-progress": "#F97316",
    "on-progress-bg": "#FFEDD5",
    completed: "#22C55E",
    "completed-bg": "#DCFCE7",
    cancelled: "#6B7280",
    "cancelled-bg": "#F3F4F6",
  }
}
```

**Usage with Badge Component:**

```tsx
import { Badge } from "@/components/ui/Badge";

<Badge variant="pending">Pending</Badge>
<Badge variant="assigned">Assigned</Badge>
<Badge variant="on_progress">On Progress</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="cancelled">Cancelled</Badge>
```

---

## Responsive Design

### Mobile-First Approach

The application uses a mobile-first responsive design strategy with Tailwind CSS breakpoints:

- **sm**: 640px
- **md**: 768px
- **lg**: 1024px
- **xl**: 1280px
- **2xl**: 1536px

### Responsive Utilities

**Custom CSS Classes** (defined in `globals.css`):

```css
@layer components {
  .responsive-table {
    @apply w-full overflow-x-auto scrollbar-thin;
  }

  .mobile-card {
    @apply md:hidden p-4 border-b border-gray-200 last:border-b-0;
  }

  .desktop-table {
    @apply hidden md:block;
  }
}
```

### Responsive Patterns

#### Table to Cards Pattern

Desktop: Table layout  
Mobile: Card layout

```tsx
{
  /* Desktop Table */
}
<div className="hidden md:block overflow-x-auto">
  <table className="w-full">{/* Table content */}</table>
</div>;

{
  /* Mobile Cards */
}
<div className="md:hidden divide-y divide-gray-200">
  {items.map((item) => (
    <div key={item.id} className="p-4">
      {/* Card content */}
    </div>
  ))}
</div>;
```

#### Responsive Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Grid items */}
</div>
```

#### Responsive Navigation

```tsx
{
  /* Mobile Menu Button */
}
<button className="md:hidden">
  <Menu />
</button>;

{
  /* Desktop Navigation */
}
<nav className="hidden md:flex gap-4">{/* Nav items */}</nav>;
```

### Custom Scrollbar

For better UX on scrollable areas:

```css
.scrollbar-thin {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.scrollbar-thin::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
```

**Usage:**

```tsx
<div className="overflow-x-auto scrollbar-thin">
  <table>...</table>
</div>
```

---

## Animations & Transitions

### Utility Classes

**Defined in `globals.css`:**

```css
@layer utilities {
  .transition-smooth {
    @apply transition-all duration-200 ease-in-out;
  }

  .transition-colors-smooth {
    @apply transition-colors duration-200 ease-in-out;
  }

  .hover-lift {
    @apply hover:-translate-y-0.5 transition-transform duration-200;
  }

  .focus-ring {
    @apply focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2;
  }
}
```

### Tailwind Animations

**Defined in `tailwind.config.js`:**

```javascript
animation: {
  "scale-in": "scaleIn 0.2s ease-out",
  "fade-in": "fadeIn 0.3s ease-out",
  "slide-in-right": "slideInRight 0.3s ease-out",
  "slide-in-left": "slideInLeft 0.3s ease-out",
  "bounce-subtle": "bounceSubtle 0.5s ease-out",
}
```

#### Available Animations

**Scale In**

```tsx
<div className="animate-scale-in">Modal content</div>
```

**Fade In**

```tsx
<div className="animate-fade-in">Loading content</div>
```

**Slide In Right**

```tsx
<div className="animate-slide-in-right">Sidebar</div>
```

**Slide In Left**

```tsx
<div className="animate-slide-in-left">Notification</div>
```

**Bounce Subtle**

```tsx
<div className="animate-bounce-subtle">New message indicator</div>
```

### Button Animations

Buttons include multiple animation effects:

```tsx
<Button>
  {/* Hover: shadow increases */}
  {/* Active: scales down to 95% */}
  {/* Focus: ring appears */}
  Save
</Button>
```

### Card Hover Effects

```tsx
import Card from "@/components/Card";

<Card hover onClick={() => navigate("/detail")}>
  {/* Hover: lifts up and shadow increases */}
  Card content
</Card>;
```

---

## Accessibility

### ARIA Labels

**Input Fields:**

```tsx
<Input
  label="Email"
  id="email"
  aria-invalid={errors.email ? "true" : "false"}
  aria-describedby="email-error"
/>;
{
  errors.email && (
    <p id="email-error" role="alert">
      {errors.email.message}
    </p>
  );
}
```

**Buttons:**

```tsx
<button aria-label="Close dialog" onClick={onClose}>
  <X />
</button>
```

**Navigation:**

```tsx
<nav aria-label="Main navigation">
  <Link href="/dashboard" aria-current="page">
    Dashboard
  </Link>
</nav>
```

### Keyboard Navigation

**Focus Styles:**

All interactive elements have visible focus indicators:

```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-pmi-red focus:ring-offset-2">
  Click me
</button>
```

**Card Keyboard Support:**

```tsx
<Card
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleClick();
    }
  }}
  tabIndex={0}
>
  Clickable card
</Card>
```

**Modal Focus Trap:**

Modals should trap focus within themselves:

```tsx
// First focusable element
<button ref={firstFocusRef} onClick={onConfirm}>
  Confirm
</button>

// Last focusable element
<button
  ref={lastFocusRef}
  onClick={onClose}
  onKeyDown={(e) => {
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      firstFocusRef.current?.focus();
    }
  }}
>
  Cancel
</button>
```

### Screen Reader Support

**Status Messages:**

```tsx
<div role="status" aria-live="polite">
  Loading data...
</div>
```

**Error Messages:**

```tsx
<p role="alert" className="text-red-600">
  {errorMessage}
</p>
```

**Form Validation:**

```tsx
<form aria-label="Login form" noValidate>
  <Input
    label="Email"
    required
    aria-required="true"
    aria-invalid={!!errors.email}
  />
</form>
```

### Skip Links

Add skip link for keyboard users:

```tsx
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-pmi-red focus:text-white"
>
  Skip to main content
</a>
```

---

## Component Styling

### Button Component

Enhanced with:

- ✅ PMI red primary color
- ✅ Smooth transitions (200ms)
- ✅ Hover shadow effect
- ✅ Active scale animation (95%)
- ✅ Focus ring with offset
- ✅ Disabled state styling

**Usage:**

```tsx
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="danger">Delete</Button>
<Button variant="success">Confirm</Button>
```

### Card Component

Enhanced with:

- ✅ Optional hover lift effect
- ✅ Smooth transitions
- ✅ Keyboard navigation support
- ✅ Shadow animation on hover

**Usage:**

```tsx
<Card hover onClick={() => navigate("/detail")}>
  Content
</Card>
```

### Input Component

Enhanced with:

- ✅ PMI red focus ring
- ✅ Smooth border transitions
- ✅ Hover state
- ✅ ARIA attributes
- ✅ Disabled state styling
- ✅ Error state with red border

**Usage:**

```tsx
<Input
  label="Email"
  type="email"
  error={errors.email?.message}
  {...register("email")}
/>
```

### Badge Component

Enhanced with:

- ✅ Consistent status colors
- ✅ Border styling
- ✅ Smooth color transitions
- ✅ Priority indicators

**All Variants:**

```tsx
{/* Status badges */}
<Badge variant="pending">Pending</Badge>
<Badge variant="assigned">Assigned</Badge>
<Badge variant="on_progress">On Progress</Badge>
<Badge variant="completed">Completed</Badge>
<Badge variant="cancelled">Cancelled</Badge>

{/* Priority badges */}
<Badge variant="low">Low</Badge>
<Badge variant="medium">Medium</Badge>
<Badge variant="high">High</Badge>
<Badge variant="critical">Critical</Badge>

{/* Role badges */}
<Badge variant="admin">Admin</Badge>
<Badge variant="driver">Driver</Badge>
<Badge variant="reporter">Reporter</Badge>
```

---

## Best Practices

### 1. Use Semantic HTML

✅ **Good:**

```tsx
<nav aria-label="Main navigation">
  <ul>
    <li>
      <Link href="/dashboard">Dashboard</Link>
    </li>
  </ul>
</nav>
```

❌ **Bad:**

```tsx
<div>
  <div onClick={() => navigate("/dashboard")}>Dashboard</div>
</div>
```

### 2. Always Provide Focus States

✅ **Good:**

```tsx
<button className="focus:ring-2 focus:ring-pmi-red">Click me</button>
```

❌ **Bad:**

```tsx
<button className="focus:outline-none">Click me</button>
```

### 3. Use Consistent Spacing

```tsx
// Use Tailwind spacing scale
<div className="space-y-4">
  {" "}
  {/* Consistent 1rem gap */}
  <Card />
  <Card />
</div>
```

### 4. Mobile-First Responsive

✅ **Good:**

```tsx
<div className="flex flex-col md:flex-row">
  {/* Mobile: column, Desktop: row */}
</div>
```

❌ **Bad:**

```tsx
<div className="flex-row md:flex-col">{/* Desktop-first approach */}</div>
```

### 5. Use Status Colors Consistently

✅ **Good:**

```tsx
<Badge variant="pending">Pending</Badge>
```

❌ **Bad:**

```tsx
<span className="bg-yellow-200">Pending</span>
```

### 6. Provide Loading States

```tsx
{
  isLoading ? <SkeletonTable rows={5} /> : <DataTable data={data} />;
}
```

### 7. Add Hover Effects Thoughtfully

```tsx
{
  /* Cards that are clickable */
}
<Card hover onClick={handleClick}>
  Interactive content
</Card>;

{
  /* Static cards - no hover */
}
<Card>Static content</Card>;
```

---

## Testing Checklist

### Responsive Design

- [ ] Test on mobile (320px - 768px)
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Verify all tables show mobile cards on small screens
- [ ] Check navigation works on all sizes

### Colors

- [ ] PMI red is used for primary actions
- [ ] Status badges use correct colors
- [ ] Colors meet WCAG contrast requirements

### Animations

- [ ] Animations are smooth (no janky transitions)
- [ ] Hover effects work correctly
- [ ] Loading states show appropriate animations
- [ ] No animations cause performance issues

### Accessibility

- [ ] All forms have proper labels
- [ ] Keyboard navigation works throughout
- [ ] Focus indicators are visible
- [ ] Screen reader announces changes correctly
- [ ] Error messages are properly announced

---

**Last Updated**: November 4, 2025
