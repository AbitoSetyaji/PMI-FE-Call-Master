"use client";

import Card from "@/components/Card";
import { User } from "@/lib/types";
import { MapPin, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface DriverDashboardProps {
  user: User;
}

export default function DriverDashboard({ user }: DriverDashboardProps) {
  const stats = [
    {
      label: "Penugasan Aktif",
      value: "2",
      icon: AlertCircle,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Selesai Hari Ini",
      value: "5",
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Perjalanan",
      value: "124",
      icon: MapPin,
      color: "bg-red-100 text-red-600",
    },
    {
      label: "Waktu Respons Rata-rata",
      value: "4m 15s",
      icon: Clock,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Driver
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

        {/* Driver Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Assignments */}
          <Link href="/driver/assignments">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Penugasan Aktif
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat dan kelola penugasan yang sedang aktif
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-2">
                    2 penugasan menunggu →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Trip History */}
          <Link href="/driver/trips">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Riwayat Perjalanan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat semua riwayat perjalanan dan penugasan
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    124 perjalanan total →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Current Location */}
          <Link href="/driver/location">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Lokasi Saat Ini
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat peta dan lokasi real-time Anda
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-2">
                    GPS aktif →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Performance Stats */}
          <Link href="/driver/stats">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Statistik Performa
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat metrik kinerja dan rating Anda
                  </p>
                  <p className="text-xs text-purple-600 font-semibold mt-2">
                    Rating 4.8/5 →
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Tandai Tersedia
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition">
              Update Lokasi
            </button>
            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Report Masalah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
