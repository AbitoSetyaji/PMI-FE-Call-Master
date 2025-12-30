"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Button from "@/components/Button";
import Input from "@/components/Input";
import { Ambulance, AlertCircle } from "lucide-react";

const schema = z.object({
  email: z.string().email({ message: "Email tidak valid" }),
  password: z.string().min(6, { message: "Password minimal 6 karakter" }),
});

type LoginFormData = z.infer<typeof schema>;

function LoginForm() {
  const { login, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [sessionExpired, setSessionExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(schema) });

  // Check if redirected due to session expiry
  useEffect(() => {
    if (searchParams.get("session_expired") === "true") {
      setSessionExpired(true);
      // Clean up the URL
      window.history.replaceState({}, "", "/login");
    }
  }, [searchParams]);

  async function onSubmit(values: LoginFormData) {
    await login(values.email, values.password);

    // After successful login, check for redirect path
    const redirectPath = sessionStorage.getItem("redirect_after_login");
    if (redirectPath) {
      sessionStorage.removeItem("redirect_after_login");
      // The login function in AuthContext already handles redirect based on role
      // This is just for cleanup
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Ambulance className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800">PMI Call</h1>
          </div>
          <p className="text-gray-600">Sistem Manajemen Panggilan Darurat</p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpired && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800">Session Berakhir</h3>
              <p className="text-sm text-amber-700">
                Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.
              </p>
            </div>
          </div>
        )}

        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800">Login</h2>
          <p className="text-gray-600 mb-6">
            Masuk ke akun Anda untuk melanjutkan
          </p>

          <form onSubmit={handleSubmit(onSubmit)}>
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
              placeholder="••••••••"
              {...register("password")}
              error={errors.password?.message}
            />

            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Loading...
                </span>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-red-600 hover:text-red-700 font-semibold"
              >
                Daftar di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

