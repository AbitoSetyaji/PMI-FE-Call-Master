"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, User as UserIcon, Ambulance } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide navbar on auth pages
  if (pathname.includes("/login") || pathname.includes("/register")) {
    return null;
  }

  const getRoleColor = (role?: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-600";
      case "driver":
        return "bg-green-600";
      case "reporter":
        return "bg-purple-600";
      default:
        return "bg-gray-600";
    }
  };

  // Don't render auth-dependent content until mounted
  if (!mounted || isLoading) {
    return (
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Ambulance className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg text-gray-800">PMI Call</span>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Ambulance className="w-6 h-6 text-red-600" />
            <span className="font-bold text-lg text-gray-800">PMI Call</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {isAuthenticated && (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition ${pathname === "/dashboard"
                      ? "text-red-600 border-b-2 border-red-600"
                      : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                  Dashboard
                </Link>

                {user?.role === "reporter" && (
                  <Link
                    href="/dashboard/reports/create"
                    className="text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 px-4 py-2 rounded-lg"
                  >
                    + Laporan Baru
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Right Menu */}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <div
                    className={`w-8 h-8 rounded-full ${getRoleColor(user.role)} flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role === "admin"
                        ? "Administrator"
                        : user.role === "driver"
                          ? "Driver"
                          : "Reporter"}
                    </p>
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Lihat Profil
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            {user?.role === "reporter" && (
              <Link
                href="/dashboard/reports/create"
                className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded"
                onClick={() => setIsMenuOpen(false)}
              >
                + Laporan Baru
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
