import Sidebar from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 w-full">
      <div className="flex w-full">
        <Sidebar />
        <main className="flex-1 min-h-screen lg:ml-0 p-6 lg:p-8 w-full">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
