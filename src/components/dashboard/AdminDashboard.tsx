"use client";

import Card from "@/components/Card";
import { User } from "@/lib/types";
import { Users, FileText, Truck, TrendingUp } from "lucide-react";
import Link from "next/link";

interface AdminDashboardProps {
  user: User;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const stats = [
    {
      label: "Total Pengguna",
      value: "145",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Laporan Hari Ini",
      value: "28",
      icon: FileText,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Kendaraan Aktif",
      value: "12",
      icon: Truck,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Rata-rata Respons",
      value: "4m 32s",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Administrator
          </h1>
          <p className="text-gray-600">Selamat datang, {user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Admin Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Manage Users */}
          <Link href="/admin/users">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Kelola Pengguna
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tambah, edit, atau hapus pengguna sistem
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* View All Reports */}
          <Link href="/admin/reports">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <FileText className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Semua Laporan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat dan analisis semua laporan sistem
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Manage Vehicles */}
          <Link href="/admin/vehicles">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Truck className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Kelola Kendaraan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Kelola data kendaraan dan driver
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* System Settings */}
          <Link href="/admin/settings">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Pengaturan Sistem
                  </h3>
                  <p className="text-sm text-gray-600">
                    Konfigurasi sistem dan preferensi
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Analytics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Laporan dan statistik performa
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Activity Log */}
          <Link href="/admin/logs">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Activity Log
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat log aktivitas sistem
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
