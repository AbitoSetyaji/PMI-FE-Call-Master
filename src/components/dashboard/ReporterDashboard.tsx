"use client";

import Card from "@/components/Card";
import { User } from "@/lib/types";
import { FileText, Clock, MapPin, Phone, ClipboardList } from "lucide-react";
import Link from "next/link";
import Button from "@/components/Button";

interface ReporterDashboardProps {
  user: User;
}

export default function ReporterDashboard({ user }: ReporterDashboardProps) {
  const stats = [
    {
      label: "Laporan Saya",
      value: "12",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Sedang Diproses",
      value: "2",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Selesai Hari Ini",
      value: "3",
      icon: MapPin,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Waktu Respons Rata-rata",
      value: "4m 32s",
      icon: Phone,
      color: "bg-red-100 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Reporter
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

        {/* Main Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Create New Report */}
          <Link href="/dashboard/reports/create" className="lg:col-span-2">
            <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-red-600 rounded-lg">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-1">
                    Buat Laporan Darurat
                  </h3>
                  <p className="text-gray-600">
                    Segera laporkan kasus darurat yang membutuhkan bantuan
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Quick Emergency */}
          <Card className="p-8 border-2 border-orange-200 bg-orange-50">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">
                911
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Nomor Darurat Cepat
              </p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Hubungi Sekarang
              </Button>
            </div>
          </Card>
        </div>

        {/* Reporter Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* My Reports */}
          <Link href="/dashboard/reports">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Laporan Saya
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lihat semua laporan yang telah saya buat
                  </p>
                  <p className="text-xs text-blue-600 font-semibold mt-2">
                    12 laporan →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Assignment Status */}
          <Link href="/dashboard/assignments">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Status Penugasan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lacak status penugasan untuk laporan Anda
                  </p>
                  <p className="text-xs text-green-600 font-semibold mt-2">
                    2 aktif →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Create Assignment */}
          <Link href="/dashboard/assignments/create">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Buat Penugasan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Tugaskan driver dan kendaraan ke laporan
                  </p>
                  <p className="text-xs text-purple-600 font-semibold mt-2">
                    Assign →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Track Assignment */}
          <Link href="/dashboard/tracking">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-lg">
                  <MapPin className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Lacak Perjalanan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lacak lokasi real-time kendaraan penugasan
                  </p>
                  <p className="text-xs text-red-600 font-semibold mt-2">
                    Tracking aktif →
                  </p>
                </div>
              </div>
            </Card>
          </Link>

          {/* Help & Support */}
          <Link href="/dashboard">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Phone className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    Bantuan & Dukungan
                  </h3>
                  <p className="text-sm text-gray-600">
                    Hubungi tim support untuk bantuan
                  </p>
                  <p className="text-xs text-purple-600 font-semibold mt-2">
                    Chat dengan kami →
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Reports */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Laporan Terbaru
          </h3>
          <Card className="overflow-hidden">
            <div className="divide-y">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Laporan Darurat #{1000 + i}
                      </p>
                      <p className="text-sm text-gray-600">
                        Jalan Merdeka No. 123, Jakarta
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      Selesai
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
