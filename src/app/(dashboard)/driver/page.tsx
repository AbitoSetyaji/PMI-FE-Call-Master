"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentsApi, reportsApi, vehiclesApi, createDriverLocation, refreshAuthToken } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  PlayCircle,
  Truck,
  Calendar,
  Square,
  CheckSquare,
  Navigation,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import VehicleSelectionModal from "@/components/ui/VehicleSelectionModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";

export default function DriverDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [coffinChecklistConfirmed, setCoffinChecklistConfirmed] = useState(false);

  // Location sharing state
  const [isLocationSharingActive, setIsLocationSharingActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastLocationUpdate, setLastLocationUpdate] = useState<Date | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Token refresh interval ref
  const tokenRefreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    status: "on_way" | "arrived_pickup" | "arrived_destination" | "done" | null;
    title: string;
    message: string;
  }>({
    isOpen: false,
    status: null,
    title: "",
    message: "",
  });

  // Fetch driver's assignments using driver-specific endpoint
  const { data: assignmentsData, isLoading } = useQuery({
    queryKey: ["driver-assignments", user?.id],
    queryFn: () => assignmentsApi.getAssignmentsByDriver(user!.id),
    enabled: !!user?.id && user?.role === "driver",
    staleTime: 0,
    refetchInterval: 5 * 1000, // Auto-refetch every 5 seconds
    refetchIntervalInBackground: true,
  });

  // Mutation to update report status
  const updateReportStatusMutation = useMutation({
    mutationFn: (
      status: "on_way" | "arrived_pickup" | "arrived_destination" | "done"
    ) =>
      reportsApi.updateReportStatus(activeAssignment!.report_id, {
        status,
      }),
    onSuccess: (data, status) => {
      const statusMessages: Record<string, string> = {
        on_way: "Keberangkatan dikonfirmasi - Dalam perjalanan",
        arrived_pickup: "Tiba di lokasi penjemputan",
        arrived_destination: "Tiba di tujuan",
        done: "Penugasan selesai",
      };
      toast.success(statusMessages[status] || "Status diperbarui");
      // Invalidate all queries to ensure sync across all devices/tabs
      queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({
        queryKey: ["report", activeAssignment!.report_id],
      });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal memperbarui status");
    },
  });

  // Mutation to assign vehicle
  const assignVehicleMutation = useMutation({
    mutationFn: (vehicleId: string) =>
      assignmentsApi.updateDriverAssignment(activeAssignment!.id, {
        vehicle_id: vehicleId,
      }),
    onSuccess: () => {
      toast.success("Vehicle assigned successfully");
      queryClient.invalidateQueries({ queryKey: ["driver-assignments"] });
      setIsVehicleModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign vehicle");
    },
  });

  const allAssignments = assignmentsData?.data || [];

  // Get most recent assignment that is not completed
  // Sort by assigned_at descending (most recent first) and filter out completed
  const activeAssignment = allAssignments
    .filter((assignment) => assignment.status !== "completed")
    .sort((a, b) => {
      const dateA = new Date(a.assigned_at).getTime();
      const dateB = new Date(b.assigned_at).getTime();
      return dateB - dateA; // Most recent first
    })[0];

  // Fetch report for active assignment
  const { data: reportData } = useQuery({
    queryKey: ["report", activeAssignment?.report_id],
    queryFn: () => reportsApi.getById(activeAssignment!.report_id),
    enabled: !!activeAssignment?.report_id,
  });

  // Fetch vehicle for active assignment
  const { data: vehicleData } = useQuery({
    queryKey: ["vehicle", activeAssignment?.vehicle_id],
    queryFn: () => vehiclesApi.getById(activeAssignment!.vehicle_id!),
    enabled: !!activeAssignment?.vehicle_id,
  });

  const report = reportData;
  const vehicle = vehicleData?.data;

  // Load coffin checklist state from localStorage when assignment changes
  useEffect(() => {
    if (activeAssignment?.id) {
      const storageKey = `coffin_checklist_${activeAssignment.id}`;
      const savedState = localStorage.getItem(storageKey);
      if (savedState === 'true') {
        setCoffinChecklistConfirmed(true);
      } else {
        setCoffinChecklistConfirmed(false);
      }
    }
  }, [activeAssignment?.id]);

  // Save coffin checklist state to localStorage when it changes
  const handleCoffinChecklistChange = (checked: boolean) => {
    setCoffinChecklistConfirmed(checked);
    if (activeAssignment?.id) {
      const storageKey = `coffin_checklist_${activeAssignment.id}`;
      localStorage.setItem(storageKey, String(checked));
    }
  };

  // Function to send location to server
  const sendLocationToServer = useCallback(async (lat: number, lng: number) => {
    if (!user?.id) {
      console.error("No user ID available");
      return;
    }
    try {
      await createDriverLocation({
        driver_id: user.id,
        latitude: lat,
        longitude: lng,
        assignment_id: activeAssignment?.id
      });
      setLastLocationUpdate(new Date());
      setLocationError(null);
    } catch (error) {
      console.error("Failed to send location:", error);
      setLocationError("Gagal mengirim lokasi ke server");
    }
  }, [user?.id, activeAssignment?.id]);

  // Function to start location sharing
  const startLocationSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation tidak didukung oleh browser");
      return;
    }

    setIsLocationSharingActive(true);
    setLocationError(null);

    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
      },
      (error) => {
        console.error("Geolocation watch error:", error.code, error.message);
        // Handle specific error codes with Indonesian messages
        const errorMessages: Record<number, string> = {
          1: "Akses lokasi ditolak. Silakan izinkan akses lokasi di browser settings.",
          2: "Lokasi tidak tersedia. Pastikan GPS aktif.",
          3: "Timeout saat melacak lokasi."
        };
        // Only set error if not a timeout (timeouts are transient)
        if (error.code !== 3) {
          const errorMsg = errorMessages[error.code] || "Gagal mendapatkan lokasi: " + error.message;
          setLocationError(errorMsg);
          toast.error(errorMsg);
        }
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 5000 }
    );

    // Send location to server every 30 seconds
    locationIntervalRef.current = setInterval(() => {
      // Try high accuracy first, fallback to low accuracy on timeout
      const getLocationWithFallback = (highAccuracy: boolean) => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ lat: latitude, lng: longitude });
            await sendLocationToServer(latitude, longitude);
          },
          (error) => {
            console.error("Failed to get position for update:", error);
            // If high accuracy timed out, try with low accuracy
            if (highAccuracy && error.code === 3) {
              console.log("Retrying with low accuracy...");
              getLocationWithFallback(false);
            }
          },
          { enableHighAccuracy: highAccuracy, timeout: highAccuracy ? 15000 : 30000, maximumAge: 10000 }
        );
      };
      getLocationWithFallback(true);
    }, 30000); // Every 30 seconds

    // Send initial location immediately
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        await sendLocationToServer(latitude, longitude);
        toast.success("Location sharing aktif");
      },
      (error) => {
        console.error("Failed to get initial position:", error.code, error.message);

        // Handle specific error codes
        const errorMessages: Record<number, string> = {
          1: "Akses lokasi ditolak. Silakan izinkan akses lokasi di browser settings.",
          2: "Lokasi tidak tersedia. Pastikan GPS aktif.",
          3: "Timeout saat mendapatkan lokasi."
        };

        // Retry with low accuracy if high accuracy times out
        if (error.code === 3) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setCurrentLocation({ lat: latitude, lng: longitude });
              await sendLocationToServer(latitude, longitude);
              toast.success("Location sharing aktif (low accuracy)");
            },
            (retryError) => {
              console.error("Failed to get position even with low accuracy:", retryError);
              setLocationError("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izinkan akses lokasi.");
            },
            { enableHighAccuracy: false, timeout: 30000, maximumAge: 30000 }
          );
        } else {
          const errorMsg = errorMessages[error.code] || "Gagal mendapatkan lokasi awal: " + error.message;
          setLocationError(errorMsg);
          toast.error(errorMsg);
        }
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [sendLocationToServer]);

  // Function to stop location sharing
  const stopLocationSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    setIsLocationSharingActive(false);
    setCurrentLocation(null);
    setLastLocationUpdate(null);
    toast.info("Location sharing dimatikan");
  }, []);

  // Auto-start location sharing when vehicle is assigned
  useEffect(() => {
    if (activeAssignment?.vehicle_id && report && report.status !== "done" && report.status !== "canceled" && !isLocationSharingActive) {
      startLocationSharing();
    }
  }, [activeAssignment?.vehicle_id, report?.status, isLocationSharingActive, startLocationSharing]);

  // Auto-stop location sharing when assignment is done or canceled
  useEffect(() => {
    if (report && (report.status === "done" || report.status === "canceled") && isLocationSharingActive) {
      stopLocationSharing();
    }
  }, [report?.status, isLocationSharingActive, stopLocationSharing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
      }
    };
  }, []);

  // Auto token refresh when driver has active assignment
  // Refresh token every 20 minutes to prevent session expiry during duty
  useEffect(() => {
    const hasActiveAssignment = activeAssignment &&
      (!report || (report.status !== "done" && report.status !== "canceled"));

    if (hasActiveAssignment) {
      // Refresh immediately on start
      refreshAuthToken().then(success => {
        if (success) {
          console.log("🔐 Initial token refresh successful");
        }
      });

      // Set up interval to refresh every 20 minutes (1,200,000 ms)
      const REFRESH_INTERVAL = 20 * 60 * 1000; // 20 minutes
      tokenRefreshIntervalRef.current = setInterval(async () => {
        const success = await refreshAuthToken();
        if (success) {
          console.log("🔐 Token auto-refreshed for active assignment");
        } else {
          console.warn("⚠️ Token refresh failed - session may expire");
          toast.warning("Session akan segera berakhir. Simpan pekerjaan Anda.");
        }
      }, REFRESH_INTERVAL);

      return () => {
        if (tokenRefreshIntervalRef.current) {
          clearInterval(tokenRefreshIntervalRef.current);
          tokenRefreshIntervalRef.current = null;
        }
      };
    } else {
      // Clear interval when no active assignment
      if (tokenRefreshIntervalRef.current) {
        clearInterval(tokenRefreshIntervalRef.current);
        tokenRefreshIntervalRef.current = null;
      }
    }
  }, [activeAssignment, report?.status]);

  // Handle redirect in useEffect to prevent setState during render
  useEffect(() => {
    if (user && user.role !== "driver") {
      router.push("/dashboard");
    }
  }, [user, router]);

  // Return null while redirecting or if not driver
  if (!user || user.role !== "driver") {
    return null;
  }

  // Calculate stats based on assignment status
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedToday = allAssignments.filter(
    (assignment) =>
      assignment.status === "completed" &&
      new Date(assignment.completed_at || "") >= today
  ).length;

  const completedTotal = allAssignments.filter(
    (assignment) => assignment.status === "completed"
  ).length;

  const handleUpdateReportStatus = (
    status: "on_way" | "arrived_pickup" | "arrived_destination" | "done"
  ) => {
    const statusMessages: Record<string, { title: string; message: string }> = {
      on_way: {
        title: "Confirm Departure",
        message:
          "Are you sure you want to confirm departure? This will mark your status as 'On the Way' to the pickup location.",
      },
      arrived_pickup: {
        title: "Confirm Arrival at Pickup",
        message:
          "Have you arrived at the pickup location? This will update your status to 'Arrived at Pickup'.",
      },
      arrived_destination: {
        title: "Confirm Arrival at Destination",
        message:
          "Have you arrived at the destination? This will update your status to 'Arrived at Destination'.",
      },
      done: {
        title: "Mark as Completed",
        message:
          "Are you sure you want to mark this assignment as completed? This action will finalize the assignment.",
      },
    };

    const { title, message } = statusMessages[status];
    setConfirmDialog({
      isOpen: true,
      status,
      title,
      message,
    });
  };

  const handleConfirmStatusUpdate = () => {
    if (confirmDialog.status) {
      updateReportStatusMutation.mutate(confirmDialog.status);
      setConfirmDialog({
        isOpen: false,
        status: null,
        title: "",
        message: "",
      });
    }
  };

  const handleCancelStatusUpdate = () => {
    setConfirmDialog({
      isOpen: false,
      status: null,
      title: "",
      message: "",
    });
  };

  const handleSelectVehicle = (vehicleId: string) => {
    assignVehicleMutation.mutate(vehicleId);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dasbor Driver
              </h1>
              <p className="text-gray-600 mt-1">Selamat datang kembali, {user?.name}!</p>
            </div>
            <Truck className="w-12 h-12 text-red-600" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Selesai Hari Ini
                </p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {completedToday}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Selesai
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-1">
                  {completedTotal}
                </p>
              </div>
              <Calendar className="w-12 h-12 text-blue-400" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Penugasan Aktif
                </p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {activeAssignment &&
                    (!report ||
                      (report.status !== "done" && report.status !== "canceled"))
                    ? "1"
                    : "0"}
                </p>
              </div>
              <Clock className="w-12 h-12 text-red-400" />
            </div>
          </div>
        </div>

        {/* Location Sharing Status Indicator */}
        {activeAssignment?.vehicle_id && report && report.status !== "done" && report.status !== "canceled" && (
          <div className={`rounded-lg shadow p-4 ${isLocationSharingActive ? 'bg-green-50 border-2 border-green-400' : 'bg-gray-50 border border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isLocationSharingActive ? 'bg-green-100' : 'bg-gray-200'}`}>
                  <Navigation className={`w-6 h-6 ${isLocationSharingActive ? 'text-green-600 animate-pulse' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    📍 Location Sharing
                    {isLocationSharingActive && (
                      <span className="text-xs font-normal bg-green-600 text-white px-2 py-0.5 rounded-full animate-pulse">
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  {isLocationSharingActive ? (
                    <div className="text-sm text-gray-600">
                      {currentLocation && (
                        <p>Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}</p>
                      )}
                      {lastLocationUpdate && (
                        <p className="text-xs text-green-600">
                          Last update: {lastLocationUpdate.toLocaleTimeString()} • Auto-update setiap 30 detik
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      {locationError || "Menunggu aktivasi..."}
                    </p>
                  )}
                </div>
              </div>
              {isLocationSharingActive && (
                <div className="flex items-center gap-2 text-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                  <span className="text-sm font-medium">Tracking</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Active Assignment */}
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">Loading assignment...</p>
          </div>
        ) : activeAssignment &&
          (!report ||
            (report.status !== "done" && report.status !== "canceled")) ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-red-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">
                Active Assignment
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge - Large and Prominent */}
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                  <div
                    className={`w-3 h-3 rounded-full animate-pulse ${report?.status === "on_way" ||
                      report?.status === "arrived_pickup" ||
                      report?.status === "arrived_destination"
                      ? "bg-green-500"
                      : "bg-blue-500"
                      }`}
                  />
                  <span className="text-lg font-bold text-gray-900">
                    {!report
                      ? "📋 Loading..."
                      : report.status === "pending"
                        ? "📋 Pending"
                        : report.status === "assigned"
                          ? "📌 Assigned"
                          : report.status === "on_way"
                            ? "🚀 On the Way"
                            : report.status === "arrived_pickup"
                              ? "📍 At Pickup Location"
                              : report.status === "arrived_destination"
                                ? "🏥 At Destination"
                                : report.status === "done"
                                  ? "✅ Completed"
                                  : report.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Modern Card Style */}
              {report && (
                <div className="grid grid-cols-1 gap-3">
                  {report.status === "assigned" &&
                    activeAssignment.vehicle_id && (
                      <div className="space-y-2">
                        <button
                          onClick={() => handleUpdateReportStatus("on_way")}
                          disabled={updateReportStatusMutation.isPending || (report.use_stretcher && !coffinChecklistConfirmed)}
                          className="w-full group relative overflow-hidden bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                        >
                          <div className="flex items-center justify-center gap-3">
                            <div className="bg-white/20 rounded-full p-2">
                              <PlayCircle className="w-6 h-6" />
                            </div>
                            <span className="text-lg font-bold">
                              {updateReportStatusMutation.isPending
                                ? "Memperbarui..."
                                : "🚀 Konfirmasi Keberangkatan"}
                            </span>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </button>
                        {report.use_stretcher && !coffinChecklistConfirmed && (
                          <p className="text-center text-sm text-red-600 font-medium">
                            ⚠️ Konfirmasi checklist perlengkapan di bawah untuk dapat berangkat
                          </p>
                        )}
                      </div>
                    )}

                  {report.status === "on_way" && (
                    <button
                      onClick={() => handleUpdateReportStatus("arrived_pickup")}
                      disabled={updateReportStatusMutation.isPending}
                      className="group relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold">
                          {updateReportStatusMutation.isPending
                            ? "Memperbarui..."
                            : "📍 Tiba di Lokasi Jemput"}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  )}

                  {report.status === "arrived_pickup" && (
                    <button
                      onClick={() =>
                        handleUpdateReportStatus("arrived_destination")
                      }
                      disabled={updateReportStatusMutation.isPending}
                      className="group relative overflow-hidden bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                          <MapPin className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold">
                          {updateReportStatusMutation.isPending
                            ? "Memperbarui..."
                            : "🏥 Tiba di Tujuan"}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  )}

                  {report.status === "arrived_destination" && (
                    <button
                      onClick={() => handleUpdateReportStatus("done")}
                      disabled={updateReportStatusMutation.isPending}
                      className="group relative overflow-hidden bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-xl p-4 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all duration-200"
                    >
                      <div className="flex items-center justify-center gap-3">
                        <div className="bg-white/20 rounded-full p-2">
                          <CheckCircle className="w-6 h-6" />
                        </div>
                        <span className="text-lg font-bold">
                          {updateReportStatusMutation.isPending
                            ? "Memperbarui..."
                            : "✅ Tandai Selesai"}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  )}
                </div>
              )}

              {/* Report Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Laporan Darurat
                </h3>
                {report ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Nama Pemohon</p>
                      <p className="font-medium text-gray-900">
                        {report.requester_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Telepon Pemohon</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {report.requester_phone}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Nama Pasien</p>
                      <p className="font-medium text-gray-900">
                        {report.patient_name} - {report.patient_age} tahun
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Jenis Kelamin</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {report.patient_gender === 'male' ? 'Laki-laki' : report.patient_gender === 'female' ? 'Perempuan' : report.patient_gender}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Lokasi Jemput</p>
                      <p className="font-medium text-gray-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {report.pickup_address}
                      </p>
                      {report.pickup_address && (
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                            report.pickup_address
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline mt-1 inline-block"
                        >
                          Buka di Google Maps →
                        </a>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600">Tujuan</p>
                      <p className="font-medium text-gray-900">
                        {report.destination_address}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status Laporan</p>
                      <Badge variant={report.status || "pending"}>
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Memuat detail laporan...</p>
                )}
              </div>

              {/* Transport Information */}
              <div className={`border rounded-lg p-4 ${report?.use_stretcher ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}>
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Informasi Transportasi
                </h3>
                {report ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Jenis Transportasi</p>
                        <p className="font-medium text-gray-900">
                          {report.transport_type_name
                            ? report.transport_type_name
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Keranda Jenazah Diperlukan</p>
                        <p className="font-medium text-gray-900">
                          {report.use_stretcher ? "✓ Ya" : "✗ Tidak"}
                        </p>
                      </div>
                    </div>

                    {/* Prominent Alert for Coffin Required */}
                    {report.use_stretcher && (
                      <div className="bg-red-600 text-white rounded-lg p-4 shadow-lg animate-pulse">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                          <div>
                            <h4 className="font-bold text-lg">⚠️ KERANDA JENAZAH DIPERLUKAN</h4>
                            <p className="text-sm text-red-100 mt-1">
                              Pastikan keranda jenazah dan perlengkapan sudah siap sebelum berangkat!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Preparation Checklist for Mortuary Transport */}
                    {report.use_stretcher && (
                      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                        <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                          📋 Checklist Persiapan Perlengkapan
                        </h4>
                        <ul className="space-y-2 text-sm text-gray-700">
                          <li className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                            Keranda jenazah dalam kondisi baik
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                            Kain kafan dan penutup jenazah
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                            Sarung tangan dan APD lengkap
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                            Pengharum/disinfektan
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                            Tali pengikat dan pengaman
                          </li>
                        </ul>

                        {/* Driver Confirmation Checkbox */}
                        <div className="mt-4 pt-4 border-t border-amber-300">
                          <label
                            className="flex items-center gap-3 cursor-pointer select-none"
                            onClick={() => handleCoffinChecklistChange(!coffinChecklistConfirmed)}
                          >
                            {coffinChecklistConfirmed ? (
                              <CheckSquare className="w-6 h-6 text-green-600" />
                            ) : (
                              <Square className="w-6 h-6 text-gray-400" />
                            )}
                            <span className={`font-medium ${coffinChecklistConfirmed ? 'text-green-700' : 'text-gray-700'}`}>
                              Saya konfirmasi semua perlengkapan sudah siap dan diperiksa
                            </span>
                          </label>
                          {!coffinChecklistConfirmed && report.status === "assigned" && activeAssignment.vehicle_id && (
                            <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              Anda harus mengkonfirmasi checklist sebelum dapat berangkat
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">Loading transport information...</p>
                )}
              </div>

              {/* Vehicle Details */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-600" />
                  Vehicle Details
                </h3>
                {vehicle ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Nama Kendaraan</p>
                        <p className="font-medium text-gray-900">
                          {vehicle.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Nomor Plat</p>
                        <p className="font-medium text-gray-900">
                          {vehicle.plate_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Jenis</p>
                        <p className="font-medium text-gray-900">
                          {(vehicle as unknown as { vehicle_type_name?: string }).vehicle_type_name
                            ? ((vehicle as unknown as { vehicle_type_name: string }).vehicle_type_name)
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())
                            : vehicle.vehicle_type?.name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={vehicle.status}>{vehicle.status}</Badge>
                      </div>
                    </div>
                    {/* Allow change vehicle only if status is still "assigned" */}
                    {report?.status === "assigned" && (
                      <button
                        onClick={() => setIsVehicleModalOpen(true)}
                        disabled={assignVehicleMutation.isPending}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-all duration-200"
                      >
                        <Truck className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {assignVehicleMutation.isPending
                            ? "Mengganti..."
                            : "Ganti Kendaraan"}
                        </span>
                      </button>
                    )}
                  </div>
                ) : activeAssignment.vehicle_id ? (
                  <p className="text-gray-500">Memuat detail kendaraan...</p>
                ) : (
                  <button
                    onClick={() => setIsVehicleModalOpen(true)}
                    disabled={assignVehicleMutation.isPending}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Truck className="w-5 h-5" />
                    <span className="font-medium">
                      {assignVehicleMutation.isPending
                        ? "Menugaskan..."
                        : "🚗 Pilih Kendaraan"}
                    </span>
                  </button>
                )}
              </div>

              {/* Timeline */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Linimasa</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Ditugaskan:</span>
                    <span className="font-medium text-gray-900">
                      {formatDateTime(activeAssignment.assigned_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <CheckCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Assignment
            </h3>
            <p className="text-gray-600 mb-4">
              You don&apos;t have any active assignments at the moment.
            </p>
            <button
              onClick={() => router.push("/driver/assignments")}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              View All Assignments
            </button>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => router.push("/driver/assignments")}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <Clock className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">My Assignments</h3>
            <p className="text-sm text-gray-600">
              View all your assignments and history
            </p>
          </button>

          <button
            onClick={() => router.push("/driver/location")}
            className="bg-white rounded-lg shadow p-6 text-left hover:shadow-lg transition-shadow"
          >
            <MapPin className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">
              Update Location
            </h3>
            <p className="text-sm text-gray-600">
              Share your current location with dispatch
            </p>
          </button>
        </div>
      </div>

      <VehicleSelectionModal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSelectVehicle={handleSelectVehicle}
        transportTypeId={report?.transport_type}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCancelStatusUpdate}
        onConfirm={handleConfirmStatusUpdate}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Yes, Confirm"
        cancelText="Cancel"
        type="info"
        isLoading={updateReportStatusMutation.isPending}
      />
    </div>
  );
}
