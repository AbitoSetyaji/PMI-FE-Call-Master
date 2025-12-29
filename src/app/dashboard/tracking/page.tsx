"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { driverLocations } from "@/lib/api";
import dynamic from "next/dynamic";
import { MapPin, RefreshCw, Users } from "lucide-react";
import type { DriverLocation } from "@/lib/types";

// Dynamically import map components to avoid SSR issues with Leaflet
const MapView = dynamic(
  () => import("@/components/maps/MapView").then((mod) => mod.MapView),
  { ssr: false }
);

const DriverMarker = dynamic(
  () =>
    import("@/components/maps/DriverMarker").then((mod) => mod.DriverMarker),
  { ssr: false }
);

const FlyToLocation = dynamic(
  () =>
    import("@/components/maps/FlyToLocation").then((mod) => mod.FlyToLocation),
  { ssr: false }
);

export default function TrackingPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [flyToPosition, setFlyToPosition] = useState<[number, number] | null>(null);

  // Color palette for different drivers
  const DRIVER_COLORS = [
    "#ef4444", // red
    "#3b82f6", // blue
    "#22c55e", // green
    "#f97316", // orange
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#14b8a6", // teal
    "#eab308", // yellow
  ];

  const getDriverColor = (index: number) => DRIVER_COLORS[index % DRIVER_COLORS.length];

  // Fix hydration mismatch by only rendering time on client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch driver locations
  const {
    data: locationsData,
    isLoading,
    refetch,
    dataUpdatedAt,
  } = useQuery({
    queryKey: ["driver-locations"],
    queryFn: () => driverLocations.getDriverLocations(),
    staleTime: 0,
    refetchInterval: autoRefresh ? 5 * 1000 : false, // Auto-refetch every 5 seconds for real-time tracking
    refetchIntervalInBackground: true,
  });

  const locations: DriverLocation[] = locationsData?.data || [];
  const driversWithLocation = locations.filter((loc) => loc.has_location !== false);
  const driversNoLocation = locations.filter((loc) => loc.has_location === false);
  const activeDrivers = driversWithLocation.filter((loc) => loc.assignment_id);
  const idleDrivers = driversWithLocation.filter((loc) => !loc.assignment_id);

  // Default center (Jakarta, Indonesia - PMI headquarters example)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  // Calculate map center based on driver locations (only those with real locations)
  const mapCenter: [number, number] =
    driversWithLocation.length > 0
      ? [
        driversWithLocation.reduce((sum, loc) => sum + loc.latitude, 0) /
        driversWithLocation.length,
        driversWithLocation.reduce((sum, loc) => sum + loc.longitude, 0) /
        driversWithLocation.length,
      ]
      : defaultCenter;

  const handleManualRefresh = () => {
    refetch();
  };

  const lastRefresh = new Date(dataUpdatedAt);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3">
          <MapPin className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              Real-Time Tracking
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">
              Monitor driver locations in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <label className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500 w-3.5 h-3.5 sm:w-4 sm:h-4"
            />
            <span className="text-xs sm:text-sm font-medium text-gray-700">
              Auto<span className="hidden sm:inline">-refresh</span>
            </span>
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-900">
                {locations.length}
              </p>
            </div>
            <Users className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-gray-400 hidden xs:block" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">On Duty</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-red-600">
                {activeDrivers.length}
              </p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-red-100 rounded-full hidden xs:flex items-center justify-center">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-600">Idle</p>
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-gray-600">
                {idleDrivers.length}
              </p>
            </div>
            <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 bg-gray-100 rounded-full hidden xs:flex items-center justify-center">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Driver Locations
          </h2>
          <div className="text-xs sm:text-sm text-gray-500">
            {mounted ? lastRefresh.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
          </div>
        </div>

        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : driversWithLocation.length === 0 ? (
          <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No driver locations available</p>
              <p className="text-sm text-gray-500 mt-1">
                {locations.length > 0
                  ? `${locations.length} driver(s) registered but haven't shared their location yet`
                  : "Drivers will appear here once they start sharing their location"
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[300px] sm:h-[350px] md:h-[400px] lg:h-[500px]">
            <MapView center={mapCenter} zoom={12}>
              <FlyToLocation position={flyToPosition} zoom={16} />
              {driversWithLocation.map((location, index) => (
                <DriverMarker key={location.id} location={location} color={getDriverColor(index)} />
              ))}
            </MapView>
          </div>
        )}
      </div>

      {/* Driver List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900">
            Active Drivers
          </h2>
        </div>

        {locations.length === 0 ? (
          <div className="p-4 sm:p-6 md:p-8 text-center text-gray-500 text-sm sm:text-base">No drivers online</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {locations.map((location, index) => (
              <div
                key={location.id}
                onClick={() => {
                  const isSelected = selectedDriverId === location.id;
                  setSelectedDriverId(isSelected ? null : location.id);
                  if (!isSelected) {
                    setFlyToPosition([location.latitude, location.longitude]);
                  }
                }}
                className={`p-2 sm:p-3 md:p-4 cursor-pointer transition-colors ${selectedDriverId === location.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : "hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow-md border-2 border-white flex-shrink-0"
                      style={{ backgroundColor: getDriverColor(index) }}
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {location.driver_name || "Unknown Driver"}
                      </p>
                      {location.vehicle_license_plate && (
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          🚗 {location.vehicle_license_plate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${location.has_location === false
                      ? "bg-yellow-100 text-yellow-800"
                      : location.assignment_id
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-600"
                      }`}>
                      {location.has_location === false
                        ? "📍 No Location"
                        : location.assignment_id
                          ? "🔴 On Duty"
                          : "⚪ Idle"}
                    </span>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                      {mounted && location.timestamp
                        ? new Date(location.timestamp).toLocaleTimeString("id-ID", {
                          hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
                        })
                        : "--:--:--"}
                    </p>
                  </div>
                </div>

                {/* Full Detail Panel - shown when selected */}
                {selectedDriverId === location.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                    {/* Driver & Vehicle Info */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-800 mb-2">📋 Assignment Details</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Vehicle</p>
                          <p className="font-medium">{location.vehicle_license_plate || "Tidak ada"}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Driver</p>
                          <p className="font-medium">{location.driver_name || "Unknown"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Report Details - if available */}
                    {location.report && (
                      <>
                        <div className="bg-amber-50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-800 mb-2">👤 Requester Information</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Name</p>
                              <p className="font-medium">{location.report.requester_name || "-"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Phone</p>
                              <p className="font-medium">{location.report.requester_phone || "-"}</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-800 mb-2">🚑 Transport Information</h4>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-gray-500">Transport Type</p>
                              <p className="font-medium capitalize">
                                {location.report.transport_type?.replace(/_/g, " ") || "-"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Coffin Required</p>
                              <p className="font-medium">
                                {location.report.use_stretcher ? "✓ Yes" : "✗ No"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                          <h4 className="font-semibold text-gray-800 mb-2">📍 Pickup & Destination</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="text-gray-500">📍 Pickup Address</p>
                              <p className="font-medium">{location.report.pickup_address || "-"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">🏥 Destination Address</p>
                              <p className="font-medium">{location.report.destination_address || "-"}</p>
                            </div>
                            {location.report.notes && (
                              <div>
                                <p className="text-gray-500">📝 Notes</p>
                                <p className="font-medium">{location.report.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Location Coordinates */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold text-gray-800 mb-2">🌍 Current Location</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Latitude</p>
                          <p className="font-mono font-medium">{location.latitude.toFixed(6)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Longitude</p>
                          <p className="font-mono font-medium">{location.longitude.toFixed(6)}</p>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                    >
                      🗺️ Open in Google Maps
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
