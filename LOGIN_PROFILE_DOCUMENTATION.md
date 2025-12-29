# Fitur Login dan Profil Berdasarkan Role

## Overview
Sistem login dan profil yang telah diimplementasikan dengan support untuk 3 role berbeda:
- **Admin**: Mengelola sistem
- **Driver**: Menerima penugasan dan tracking
- **Reporter**: Membuat laporan darurat

## Fitur Utama

### 1. Login Page (`/login`)
**Lokasi**: `src/app/(auth)/login/page.tsx`

Fitur:
- ✅ Form login dengan validasi menggunakan Zod
- ✅ Demo accounts untuk testing berbagai role
- ✅ Role indicator dengan warna berbeda
- ✅ Quick login dengan klik account demo
- ✅ Responsive design

**Demo Accounts**:
```
Admin:
- Email: admin@pmi.com
- Password: admin123

Driver:
- Email: driver@pmi.com
- Password: driver123

Reporter:
- Email: reporter@pmi.com
- Password: reporter123
```

### 2. Profil Page (`/profile`)
**Lokasi**: `src/app/(dashboard)/profile/page.tsx`

Fitur:
- ✅ Tampilan profil user dengan avatar
- ✅ Informasi lengkap user (email, role, join date)
- ✅ Role-specific permissions dan akses
- ✅ Logout button
- ✅ Protected route (redirect ke login jika tidak auth)

### 3. Dashboard Berdasarkan Role

#### Admin Dashboard
**Lokasi**: `src/components/dashboard/AdminDashboard.tsx`

Fitur:
- 📊 Statistik sistem (total user, laporan, kendaraan)
- 🔧 Kelola Pengguna
- 📋 Lihat semua laporan
- 🚗 Kelola Kendaraan
- ⚙️ Pengaturan Sistem
- 📈 Analytics
- 🗂️ Activity Log

#### Driver Dashboard
**Lokasi**: `src/components/dashboard/DriverDashboard.tsx`

Fitur:
- 📊 Statistik driver (penugasan aktif, selesai hari ini)
- 🚨 Penugasan Aktif
- 📜 Riwayat Perjalanan
- 📍 Lokasi Saat Ini
- 📈 Statistik Performa
- ⚡ Quick Actions (tandai tersedia, update lokasi, report masalah)

#### Reporter Dashboard
**Lokasi**: `src/components/dashboard/ReporterDashboard.tsx`

Fitur:
- 📊 Statistik laporan (total, proses, selesai)
- 🆘 Buat Laporan Darurat (CTA utama)
- 📞 Nomor Darurat Cepat (911)
- 📋 Laporan Saya
- ⏱️ Status Penugasan
- 📍 Lacak Perjalanan
- 💬 Bantuan & Dukungan
- 📰 Laporan Terbaru

### 4. Navigation Bar Terupdate
**Lokasi**: `src/components/Navbar.tsx`

Fitur:
- ✅ Logo PMI dengan icon
- ✅ User profile dropdown dengan nama dan role
- ✅ Avatar dengan inisial user
- ✅ Quick action untuk Reporter (+ Laporan Baru)
- ✅ Responsive untuk mobile
- ✅ Auto-hide di halaman login/register
- ✅ Role-based colors untuk avatar

## Flow Autentikasi

```
1. User membuka aplikasi
   ↓
2. Jika tidak login → redirect ke /login
   ↓
3. User memilih atau input credentials
   ↓
4. Login berhasil → redirect ke /dashboard
   ↓
5. Dashboard router mengecek role
   ↓
6. Menampilkan dashboard sesuai role
```

## Tech Stack

- **Frontend**: Next.js 16 + React 19.2
- **State Management**: React Query + Context API
- **Form Validation**: React Hook Form + Zod
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Notifications**: Sonner

## Protected Routes

Semua routes di dalam `(dashboard)` adalah protected:
- `/dashboard` - Main dashboard (role-based)
- `/profile` - User profile
- `/driver/assignments` - Driver assignments
- `/admin/users` - Admin user management
- dll

Jika user belum login, akan di-redirect ke `/login`.

## Integrasi dengan API

Auth context menggunakan API endpoints:
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `POST /api/auth/logout` - Logout

Token disimpan di localStorage dengan key `pmi_auth_token`.

## Customization

### Menambah Role Baru
1. Update `UserRole` type di `src/lib/types.ts`
2. Tambah demo account di login page
3. Buat dashboard component baru
4. Update `(dashboard)/page.tsx` routing logic

### Mengubah Warna Role
Ubah di:
- `src/app/(auth)/login/page.tsx` - border/bg colors
- `src/app/(dashboard)/profile/page.tsx` - role colors object
- `src/components/Navbar.tsx` - getRoleColor function

## Testing

### Test Login:
1. Buka http://localhost:3000/login
2. Klik salah satu account demo
3. Observasi redirect dan dashboard yang ditampilkan
4. Klik profile dropdown → View Profile
5. Verifikasi informasi dan role

### Test Protected Routes:
1. Logout dari profile
2. Coba akses `/dashboard` langsung
3. Seharusnya redirect ke `/login`

## Notes

- Token di-refresh saat login dan disimpan globally
- User info tersedia di mana saja via `useAuth()` hook
- All passwords should be hashed in production
- Add password reset functionality untuk production
