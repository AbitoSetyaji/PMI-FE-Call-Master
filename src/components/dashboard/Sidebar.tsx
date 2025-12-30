"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Truck,
  Users,
  MapPin,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    label: "Dasbor",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Laporan",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    label: "Penugasan",
    href: "/dashboard/assignments",
    icon: ClipboardList,
  },
  {
    label: "Kendaraan",
    href: "/dashboard/vehicles",
    icon: Truck,
  },
  {
    label: "Pengguna",
    href: "/dashboard/users",
    icon: Users,
    adminOnly: true,
  },
  {
    label: "Pelacakan",
    href: "/dashboard/tracking",
    icon: MapPin,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const isAdmin = user?.role === "admin";
  const isDriver = user?.role === "driver";

  // Only show relevant menu for driver
  // Default to non-admin menu until mounted to prevent hydration mismatch
  let filteredNavItems = navItems.filter((item) => !item.adminOnly);

  if (mounted && user) {
    if (isAdmin) {
      filteredNavItems = navItems;
    } else if (isDriver) {
      filteredNavItems = navItems.filter(
        (item) => ["Dasbor", "Penugasan", "Pelacakan"].includes(item.label)
      );
    } else {
      filteredNavItems = navItems.filter((item) => !item.adminOnly);
    }
  }

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6 text-gray-700" />
        ) : (
          <Menu className="w-6 h-6 text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen
          w-64 bg-white shadow-lg z-40
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo / Brand */}
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-red-600">PMI</h1>
            <p className="text-sm text-gray-600">Sistem Panggilan Darurat</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-3">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-150
                        ${active
                          ? "bg-red-50 text-red-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t p-4">
            {mounted ? (
              <>
                <div className="mb-3 px-2">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || "N/A"}
                  </p>
                  <p className="text-xs text-gray-600 capitalize mt-1 font-medium">
                    {user?.role || "N/A"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              // Placeholder during loading
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
