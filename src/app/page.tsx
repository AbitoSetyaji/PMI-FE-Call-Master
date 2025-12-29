"use client";

import Link from "next/link";
import { Ambulance, Phone, MapPin, Clock, Shield, Users, ChevronRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-red-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <Ambulance className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PMI Call</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-red-600 font-medium transition-colors"
              >
                Masuk
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all hover:shadow-lg hover:shadow-red-200"
              >
                Daftar
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              Layanan Ambulans 24/7
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Sistem Panggilan Darurat
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-500">
                PMI Indonesia
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Layanan ambulans cepat dan terpercaya. Pantau lokasi driver secara real-time
              dan dapatkan bantuan medis darurat kapan saja, di mana saja.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/login"
                className="group w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-xl font-semibold text-lg hover:bg-red-700 transition-all hover:shadow-xl hover:shadow-red-200 flex items-center justify-center gap-2"
              >
                Masuk Sekarang
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg border-2 border-gray-200 hover:border-red-300 hover:text-red-600 transition-all flex items-center justify-center gap-2"
              >
                Daftar Akun Baru
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">24/7</div>
                <div className="text-sm text-gray-500">Layanan</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">&lt;15min</div>
                <div className="text-sm text-gray-500">Respons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">100+</div>
                <div className="text-sm text-gray-500">Ambulans</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Fitur Unggulan
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem terintegrasi untuk penanganan panggilan darurat yang efisien dan profesional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gradient-to-br from-red-50 to-white rounded-2xl border border-red-100 hover:shadow-xl hover:shadow-red-100/50 transition-all">
              <div className="w-14 h-14 bg-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Panggilan Darurat</h3>
              <p className="text-gray-600">
                Kirim permintaan ambulans dengan cepat. Data lokasi dan informasi pasien terkirim otomatis.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-100 hover:shadow-xl hover:shadow-blue-100/50 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tracking Real-Time</h3>
              <p className="text-gray-600">
                Pantau lokasi ambulans secara langsung. Ketahui estimasi waktu kedatangan dengan akurat.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-white rounded-2xl border border-green-100 hover:shadow-xl hover:shadow-green-100/50 transition-all">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Respons Cepat</h3>
              <p className="text-gray-600">
                Sistem dispatch otomatis menugaskan driver terdekat untuk respons tercepat.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-purple-100 hover:shadow-xl hover:shadow-purple-100/50 transition-all">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-Role Access</h3>
              <p className="text-gray-600">
                Dashboard khusus untuk Admin, Reporter, dan Driver dengan akses sesuai kebutuhan.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gradient-to-br from-orange-50 to-white rounded-2xl border border-orange-100 hover:shadow-xl hover:shadow-orange-100/50 transition-all">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Keamanan Data</h3>
              <p className="text-gray-600">
                Data pasien dan informasi medis dilindungi dengan enkripsi dan akses terbatas.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gradient-to-br from-teal-50 to-white rounded-2xl border border-teal-100 hover:shadow-xl hover:shadow-teal-100/50 transition-all">
              <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Ambulance className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Manajemen Armada</h3>
              <p className="text-gray-600">
                Kelola armada ambulans, jadwal driver, dan maintenance kendaraan dalam satu platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Memulai?
              </h2>
              <p className="text-red-100 mb-8 max-w-xl mx-auto">
                Bergabunglah dengan sistem panggilan darurat PMI untuk memberikan layanan kesehatan yang lebih baik.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg"
                >
                  Daftar Sekarang
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto px-8 py-4 bg-red-700 text-white rounded-xl font-semibold hover:bg-red-800 transition-all border border-red-400"
                >
                  Sudah Punya Akun?
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg">
                <Ambulance className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-gray-900">PMI Call</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 Palang Merah Indonesia. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
