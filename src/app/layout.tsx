import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "sonner";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "PMI Emergency - Dashboard",
  description: "Frontend for PMI Emergency Call System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full bg-slate-50 text-slate-900 m-0 p-0" suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="w-full">{children}</main>
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
