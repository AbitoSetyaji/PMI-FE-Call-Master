# Role-Based Access Control (RBAC) Implementation

## Overview
PMI Call System mengimplementasikan role-based access control dengan 3 role utama: Admin, Reporter, dan Driver.

## User Roles & Permissions

### 🔴 **ADMIN** - Full System Access
**Credentials:** `admin@pmi.com` / `password`

#### Permissions:
- ✅ View all reports and assignments
- ✅ Manage reports (Create, Read, Update, Delete)
- ✅ Manage assignments (Create, Read, Update, Delete)
- ✅ User management (CRUD operations)
- ✅ Vehicle management (CRUD operations)
- ✅ View all analytics and statistics
- ✅ View real-time driver tracking

#### Access Routes:
- `/dashboard` - Admin Dashboard
- `/dashboard/admin` - Admin Panel (protected - only admin)
- `/dashboard/reports` - All reports management
- `/dashboard/assignments` - All assignments management
- `/dashboard/users` - User management
- `/dashboard/vehicles` - Vehicle management
- `/dashboard/tracking` - Real-time driver tracking

---

### 📝 **REPORTER** - Emergency Report & Assignment Management
**Credentials:** `reporter@pmi.com` / `password`

#### Permissions:
- ✅ Create & manage emergency reports
- ✅ View all assignments (for monitoring)
- ✅ Create assignments (assign drivers to reports)
- ✅ Monitor driver progress on assignments
- ✅ View assignment details and status updates
- ❌ Cannot manage users
- ❌ Cannot manage vehicles
- ❌ Cannot access admin-only features

#### Access Routes:
- `/dashboard` - Reporter Dashboard
- `/dashboard/reports` - Create and view all reports
- `/dashboard/assignments` - View and manage all assignments
- `/dashboard/tracking` - View driver locations (for monitoring)
- ❌ Cannot access: `/dashboard/admin`, `/dashboard/users`, `/dashboard/vehicles`

---

### 🚗 **DRIVER** - Assignment Execution Only
**Credentials:** `driver@pmi.com` / `password`

#### Permissions:
- ✅ View own assignments only
- ✅ Select vehicle for assignment
- ✅ Update assignment status (5 steps: assigned → on_progress → arrived → completed)
- ✅ Share real-time location
- ✅ View own report details
- ❌ Cannot view admin/reporter features
- ❌ Cannot create reports
- ❌ Cannot create assignments
- ❌ Cannot access user/vehicle management

#### Access Routes:
- `/driver` - Driver Dashboard
- `/driver/assignments` - Own assignments only
- `/driver/location` - Real-time location sharing
- ❌ Cannot access: `/dashboard`, `/dashboard/admin`, `/dashboard/reports`, `/dashboard/assignments`

---

## Implementation Details

### 1. Authentication Flow
```typescript
// AuthContext provides:
interface AuthContextType {
  user: User | null;              // Current logged-in user
  isLoading: boolean;             // Auth state loading
  isAuthenticated: boolean;       // User is authenticated
  login: (email, password) => Promise<void>;
  logout: () => void;
  register: (data) => Promise<void>;
}

// User interface includes role
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "reporter" | "driver";  // Role-based access
  created_at: string;
}
```

### 2. Protected Routes Implementation

#### Admin Dashboard Protection
**File:** `src/app/(dashboard)/admin/page.tsx`
```typescript
useEffect(() => {
  // Only admin can access this page
  if (!isLoading && user?.role !== "admin") {
    router.replace("/dashboard");
  }
}, [user, isLoading, router]);
```

#### Reporter/Admin Reports Management
**File:** `src/app/dashboard/reports/page.tsx`
```typescript
useEffect(() => {
  // Only Admin and Reporter can access reports management
  if (!authLoading && user?.role !== "admin" && user?.role !== "reporter") {
    router.replace("/dashboard");
  }
}, [user, authLoading, router]);
```

#### Reporter/Admin Assignments Management
**File:** `src/app/dashboard/assignments/page.tsx`
```typescript
useEffect(() => {
  // Only Admin and Reporter can access assignments management
  if (!authLoading && user?.role !== "admin" && user?.role !== "reporter") {
    router.replace("/dashboard");
  }
}, [user, authLoading, router]);
```

### 3. Role-Based Data Fetching

**Dashboard Data Access:**
```typescript
// Only fetch assignments for Admin/Reporter
const { data: assignmentsData } = useQuery({
  queryKey: ["assignments"],
  queryFn: () => assignments.getAssignments(),
  enabled: user?.role === "admin" || user?.role === "reporter",  // Conditional fetch
});

// Driver uses different endpoint to fetch only own assignments
const { data: assignmentsData } = useQuery({
  queryKey: ["driver-assignments", user?.id],
  queryFn: () => assignmentsApi.getAssignmentsByDriver(user!.id),
  enabled: !!user?.id,
});
```

### 4. Conditional UI Rendering

**Create Assignment Button (Only for Admin/Reporter):**
```typescript
{(user?.role === "admin" || user?.role === "reporter") && (
  <Link href="/dashboard/assignments/create">
    Create Assignment
  </Link>
)}
```

---

## Demo Accounts for Testing

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@pmi.com` | `password` |
| Reporter | `reporter@pmi.com` | `password` |
| Driver | `driver@pmi.com` | `password` |

### Quick Login
Click on any role card in the login page to auto-fill credentials and submit.

---

## Testing Checklist

### Admin Account
- [ ] Login as admin@pmi.com
- [ ] Can see all reports
- [ ] Can see all assignments
- [ ] Can create new reports
- [ ] Can create new assignments
- [ ] Can manage users (if implemented)
- [ ] Can manage vehicles (if implemented)
- [ ] Can view driver tracking

### Reporter Account
- [ ] Login as reporter@pmi.com
- [ ] Can see all reports
- [ ] Can see all assignments
- [ ] Can create new reports
- [ ] Can create new assignments (assign drivers)
- [ ] Cannot access admin-only features
- [ ] Can monitor driver progress

### Driver Account
- [ ] Login as driver@pmi.com
- [ ] Can only see own assignments
- [ ] Cannot see all assignments
- [ ] Can select vehicle for assignment
- [ ] Can update assignment status
- [ ] Can share real-time location
- [ ] Cannot access admin/reporter features
- [ ] Cannot create reports or assignments

---

## API Endpoints

### Assignments
```
GET  /api/assignments/                    # Get all assignments (Admin/Reporter)
GET  /api/assignments/driver/{driver_id}  # Get driver's assignments (Driver)
GET  /api/assignments/{assignment_id}     # Get assignment details
POST /api/assignments/                    # Create assignment (Admin/Reporter)
PUT  /api/assignments/{assignment_id}/status  # Update status
```

### Reports
```
GET  /api/reports/                # Get all reports
GET  /api/reports/{report_id}     # Get report details
POST /api/reports/                # Create report
PUT  /api/reports/{report_id}     # Update report
```

### Driver Locations
```
GET  /api/driver-locations/       # Get all driver locations
POST /api/driver-locations/       # Send current location
```

---

## Files Modified/Created

### Core RBAC Implementation
1. `src/contexts/AuthContext.tsx` - Authentication context with user role
2. `src/hooks/useAuth.ts` - Custom hook for auth state
3. `src/lib/types.ts` - User interface with role field

### Protected Pages
1. `src/app/(dashboard)/admin/page.tsx` - Admin dashboard (admin only)
2. `src/app/(dashboard)/page.tsx` - Main dashboard (role-based routing)
3. `src/app/dashboard/assignments/page.tsx` - Assignments list (admin/reporter only)
4. `src/app/dashboard/reports/page.tsx` - Reports list (admin/reporter only)

### Role-Specific Dashboards
1. `src/components/dashboard/AdminDashboard.tsx` - Admin interface
2. `src/components/dashboard/ReporterDashboard.tsx` - Reporter interface
3. `src/components/dashboard/DriverDashboard.tsx` - Driver interface

### Navigation
1. `src/components/Navbar.tsx` - Updated with user profile dropdown and role indicator

---

## Security Notes

1. ✅ Routes are protected both client-side and should be protected server-side (backend validation)
2. ✅ Sensitive operations require role verification
3. ✅ JWT tokens should be invalidated on logout
4. ✅ API endpoints should validate user role before returning/modifying data
5. ⚠️ Backend API should enforce role-based access control (server-side validation)

---

## Future Enhancements

1. Add finer-grained permissions (e.g., specific report types, vehicle categories)
2. Implement audit logging for all admin actions
3. Add role-based field visibility in forms
4. Implement data filtering at API level based on role
5. Add permission matrix for custom roles
