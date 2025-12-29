# 🚨 PMI Emergency Call System - Frontend

A comprehensive emergency management system for PMI (Palang Merah Indonesia / Indonesian Red Cross) built with Next.js 16, TypeScript, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16.0.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React Query](https://img.shields.io/badge/React%20Query-5.56.0-red)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [Key Features](#-key-features)
- [Documentation](#-documentation)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 Authentication & Authorization

- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Driver, Reporter)
- ✅ Protected routes with automatic redirects
- ✅ Token refresh handling

### 📊 Dashboard

- ✅ Real-time statistics (reports, assignments, vehicles, drivers)
- ✅ Recent reports overview
- ✅ Quick actions
- ✅ Role-based dashboard views

### 🚨 Emergency Reports

- ✅ Create emergency reports with location
- ✅ Real-time status tracking
- ✅ Priority levels (Low, Medium, High, Critical)
- ✅ Filter by status and priority
- ✅ Search functionality
- ✅ Map integration for location display

### 🚑 Assignment Management

- ✅ Assign drivers and vehicles to reports
- ✅ Track assignment status
- ✅ Timeline view of status changes
- ✅ Driver acceptance/rejection workflow

### 🚗 Vehicle Management

- ✅ Vehicle CRUD operations
- ✅ Vehicle types management
- ✅ Status tracking (Available, On Duty, Maintenance)
- ✅ Filter and search

### 👥 User Management (Admin)

- ✅ User CRUD operations
- ✅ Role assignment
- ✅ Filter by role

### 📍 Real-time Tracking

- ✅ Driver location tracking on map
- ✅ Auto-refresh every 30 seconds
- ✅ Driver markers with info
- ✅ Browser geolocation support

### 🎨 UI/UX

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ PMI red brand colors
- ✅ Smooth animations and transitions
- ✅ Loading skeletons
- ✅ Toast notifications
- ✅ Confirmation dialogs
- ✅ Error boundaries
- ✅ Accessibility (ARIA labels, keyboard navigation)

---

## 🛠 Tech Stack

### Core

- **Next.js 16** - React framework with App Router
- **TypeScript 5** - Type-safe development
- **React 19** - UI library

### State Management & Data Fetching

- **React Query 5.56** - Server state management
- **Context API** - Global auth state

### Styling

- **Tailwind CSS 3.4** - Utility-first CSS
- **CSS Variables** - Theme customization

### Forms & Validation

- **React Hook Form 7.53** - Form handling
- **Zod 3.23** - Schema validation

### API & HTTP

- **Axios 1.7** - HTTP client
- **JWT Decode** - Token decoding

### UI Components

- **Lucide React 0.454** - Icons
- **Sonner 1.7** - Toast notifications
- **React Leaflet 4.2** - Map integration

### Utilities

- **date-fns 4.1** - Date formatting
- **clsx** - Conditional classes

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18.x or higher
- **npm** 10.x or higher (or yarn/pnpm)
- **Git**

Backend API should be running on `http://localhost:8000` (or configure in `.env.local`)

---

## 🚀 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd xpmi-call-fe
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Run the development server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

---

## 🔧 Environment Variables

| Variable                   | Description          | Default                 | Required |
| -------------------------- | -------------------- | ----------------------- | -------- |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | `http://localhost:8000` | ✅ Yes   |

**Note:** All environment variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

---

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

Runs the app in development mode with hot reload at [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

Builds the app for production and starts the production server.

### Type Checking

```bash
npm run type-check
```

Runs TypeScript compiler to check for type errors.

### Linting

```bash
npm run lint
```

Runs ESLint to check for code quality issues.

---

## 📁 Project Structure

```
xpmi-call-fe/
├── app-docs/                      # Comprehensive documentation
│   ├── api_docs.md               # API endpoints documentation
│   ├── flow_docs.md              # User flows documentation
│   ├── TECH_DOCUMENTATION.md     # Technical documentation
│   ├── HOOKS_DOCUMENTATION.md    # Custom hooks guide
│   ├── VALIDATION_ERROR_HANDLING.md  # Validation & errors
│   ├── LOADING_UX.md            # Loading states & UX
│   ├── STYLING_RESPONSIVENESS.md # Styling guide
│   └── SECTION_*_SUMMARY.md      # Implementation summaries
├── public/                        # Static assets
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── dashboard/           # Dashboard pages
│   │   │   ├── reports/
│   │   │   ├── assignments/
│   │   │   ├── vehicles/
│   │   │   ├── users/
│   │   │   └── tracking/
│   │   ├── driver/              # Driver-specific pages
│   │   │   ├── assignments/
│   │   │   └── location/
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Home page
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   ├── ui/                  # UI components
│   │   ├── forms/               # Form components
│   │   ├── dashboard/           # Dashboard components
│   │   └── maps/                # Map components
│   ├── contexts/                # React contexts
│   │   └── AuthContext.tsx
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useReports.ts
│   │   ├── useAssignments.ts
│   │   ├── useVehicles.ts
│   │   ├── useUsers.ts
│   │   ├── useDriverLocations.ts
│   │   └── useGeolocation.ts
│   ├── lib/                     # Utilities & helpers
│   │   ├── api.ts               # API functions
│   │   ├── axiosInstance.ts     # Axios configuration
│   │   ├── types.ts             # TypeScript types
│   │   ├── auth.ts              # Auth utilities
│   │   ├── validations.ts       # Zod schemas
│   │   ├── errors.ts            # Error utilities
│   │   ├── optimistic.ts        # Optimistic updates
│   │   ├── storage.ts           # LocalStorage helpers
│   │   └── utils.ts             # General utilities
├── .env.local                    # Environment variables
├── next.config.ts               # Next.js configuration
├── tailwind.config.js           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── package.json                 # Dependencies & scripts
```

---

## 👥 User Roles

### 🔴 Admin

- Full access to all features
- User management
- Vehicle management
- Report assignment
- System configuration

### 🚗 Driver

- View assigned reports
- Update assignment status
- Update location
- View own statistics

### 📝 Reporter

- Create emergency reports
- View own reports
- Update report details

---

## 🎯 Key Features

### 1. Emergency Report Creation

```
Reporter logs in → Creates report with details →
System saves report → Admin receives notification →
Admin assigns driver & vehicle → Driver receives assignment
```

### 2. Real-time Driver Tracking

```
Driver opens location page → Browser requests location →
Location sent to API every 30s → Admin views on map →
Map updates automatically
```

### 3. Assignment Workflow

```
Admin creates assignment → Driver receives notification →
Driver accepts → Driver updates status (on_progress) →
Driver completes → Report marked as completed
```

### 4. Status Lifecycle

```
pending → assigned → on_progress → completed
                                 ↘ cancelled
```

---

## 📚 Documentation

Comprehensive documentation is available in the `app-docs/` directory:

- **[API Documentation](app-docs/api_docs.md)** - All API endpoints
- **[Flow Documentation](app-docs/flow_docs.md)** - User flows & workflows
- **[Technical Documentation](app-docs/TECH_DOCUMENTATION.md)** - Architecture & design
- **[Hooks Documentation](app-docs/HOOKS_DOCUMENTATION.md)** - Custom hooks usage
- **[Validation & Error Handling](app-docs/VALIDATION_ERROR_HANDLING.md)**
- **[Loading States & UX](app-docs/LOADING_UX.md)**
- **[Styling & Responsiveness](app-docs/STYLING_RESPONSIVENESS.md)**

---

## 🧪 Testing

### Manual Testing Checklist

#### Authentication

- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Logout
- [ ] Protected routes redirect to login

#### Reports

- [ ] Create new report
- [ ] View report list
- [ ] Filter reports by status
- [ ] Search reports
- [ ] View report detail
- [ ] Update report status

#### Assignments

- [ ] Create assignment
- [ ] View assignment list
- [ ] Update assignment status
- [ ] Driver accepts assignment
- [ ] Driver completes assignment

#### Vehicles

- [ ] Add new vehicle
- [ ] Edit vehicle
- [ ] Delete vehicle
- [ ] Filter vehicles by status

#### Users (Admin)

- [ ] Add new user
- [ ] Edit user
- [ ] Delete user
- [ ] Filter users by role

#### Tracking

- [ ] View driver locations on map
- [ ] Auto-refresh locations
- [ ] Driver updates location

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Authors

- **Development Team** - Initial work

---

## 🙏 Acknowledgments

- PMI (Palang Merah Indonesia)
- Next.js Team
- React Query Team
- Tailwind CSS Team

---

## 📞 Support

For support, email support@pmi-call.com or open an issue in the repository.

---

**Last Updated**: November 4, 2025  
**Version**: 1.0.0

