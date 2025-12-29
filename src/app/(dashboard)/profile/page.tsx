"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Card from "@/components/Card";
import { Mail, MapPin, Calendar, LogOut, Settings, Lock } from "lucide-react";
import Button from "@/components/Button";

export default function ProfilePage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const roleColors = {
    admin: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", badge: "bg-blue-100" },
    driver: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", badge: "bg-green-100" },
    reporter: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", badge: "bg-purple-100" },
  };

  const colors = roleColors[user.role];

  const roleDescriptions = {
    admin: "Mengelola sistem, pengguna, dan konfigurasi aplikasi",
    driver: "Menerima penugasan dan mengelola perjalanan",
    reporter: "Membuat laporan darurat panggilan",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profil Pengguna</h1>
          <p className="text-gray-600">Kelola informasi akun Anda</p>
        </div>

        {/* Profile Card */}
        <Card className={`border-2 ${colors.border} ${colors.bg} mb-6`}>
          <div className="p-8">
            {/* Profile Header */}
            <div className="flex items-start justify-between mb-8">
              <div className="flex items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </div>

                {/* User Info */}
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {user.name}
                  </h2>
                  <p className={`${colors.text} font-semibold mb-2`}>
                    <span className={`${colors.badge} px-3 py-1 rounded-full text-sm`}>
                      {user.role.toUpperCase()}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {roleDescriptions[user.role as keyof typeof roleDescriptions]}
                  </p>
                </div>
              </div>

              {/* Logout Button */}
              <Button
                onClick={logout}
                className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <hr className={`border-${colors.border} mb-8`} />

            {/* Details */}
            <div className="space-y-4">
              {/* Email */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                <Mail className={`w-5 h-5 ${colors.text}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold text-gray-800">{user.email}</p>
                </div>
              </div>

              {/* Role */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                <Settings className={`w-5 h-5 ${colors.text}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tipe Pengguna</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {user.role === "admin"
                      ? "Administrator"
                      : user.role === "driver"
                        ? "Driver / Sopir"
                        : "Reporter"}
                  </p>
                </div>
              </div>

              {/* User ID */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                <Lock className={`w-5 h-5 ${colors.text}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">ID Pengguna</p>
                  <p className="font-semibold text-gray-800 font-mono text-sm">
                    {user.id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Role-specific Info */}
        {user.role === "admin" && (
          <Card className="border-2 border-blue-200 bg-blue-50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">
              Akses Administrator
            </h3>
            <ul className="space-y-2 text-blue-800">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Kelola pengguna sistem
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Lihat laporan lengkap
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Kelola konfigurasi sistem
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full" />
                Monitoring dan analytics
              </li>
            </ul>
          </Card>
        )}

        {user.role === "driver" && (
          <Card className="border-2 border-green-200 bg-green-50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-green-900 mb-4">
              Akses Driver
            </h3>
            <ul className="space-y-2 text-green-800">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                Lihat penugasan terbaru
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                Update status penugasan
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                Tracking lokasi real-time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
                Riwayat penugasan
              </li>
            </ul>
          </Card>
        )}

        {user.role === "reporter" && (
          <Card className="border-2 border-purple-200 bg-purple-50 p-6 mb-6">
            <h3 className="text-lg font-semibold text-purple-900 mb-4">
              Akses Reporter
            </h3>
            <ul className="space-y-2 text-purple-800">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
                Buat laporan darurat
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
                Lihat status penugasan
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
                Riwayat laporan saya
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-600 rounded-full" />
                Estimasi waktu tiba
              </li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
