"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Select } from "@/components/ui";
import type { UserRole } from "@/lib/types";

const schema = z
  .object({
    name: z.string().min(3, { message: "Nama minimal 3 karakter" }),
    email: z.string().email({ message: "Email tidak valid" }),
    password: z.string().min(6, { message: "Password minimal 6 karakter" }),
    confirmPassword: z.string(),
    role: z.enum(["admin", "driver", "reporter"], {
      errorMap: () => ({ message: "Pilih role yang valid" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof schema>;

const roleOptions = [
  { value: "reporter", label: "Reporter (Pelapor)" },
  { value: "driver", label: "Driver (Pengemudi)" },
  { value: "admin", label: "Admin" },
];

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(schema) });

  async function onSubmit(values: RegisterFormData) {
    const { confirmPassword, ...registerData } = values;
    await registerUser({
      ...registerData,
      role: registerData.role as UserRole,
    });
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-md shadow">
      <h1 className="text-2xl font-semibold mb-4">Registrasi</h1>
      <p className="text-gray-600 mb-6">
        Daftar akun baru untuk sistem PMI Emergency Call
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Input
          label="Nama Lengkap"
          type="text"
          placeholder="Masukkan nama lengkap"
          {...register("name")}
          error={errors.name?.message}
        />

        <Input
          label="Email"
          type="email"
          placeholder="nama@example.com"
          {...register("email")}
          error={errors.email?.message}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Minimal 6 karakter"
          {...register("password")}
          error={errors.password?.message}
        />

        <Input
          label="Konfirmasi Password"
          type="password"
          placeholder="Masukkan password lagi"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <Select
          label="Role / Peran"
          options={roleOptions}
          {...register("role")}
          error={errors.role?.message}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Mendaftar..." : "Daftar"}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Login di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
