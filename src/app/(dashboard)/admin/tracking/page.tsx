"use client";

import { useState } from "react";
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

export default function TrackingPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

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
  const activeDrivers = locations.filter((loc) => loc.assignment_id);
  const idleDrivers = locations.filter((loc) => !loc.assignment_id);

  // Default center (Jakarta, Indonesia - PMI headquarters example)
  const defaultCenter: [number, number] = [-6.2088, 106.8456];

  // Calculate map center based on driver locations
  const mapCenter: [number, number] =
    locations.length > 0
      ? [
        locations.reduce((sum, loc) => sum + loc.latitude, 0) /
        locations.length,
        locations.reduce((sum, loc) => sum + loc.longitude, 0) /
        locations.length,
      ]
      : defaultCenter;

  const handleManualRefresh = () => {
    refetch();
  };

  const lastRefresh = new Date(dataUpdatedAt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-red-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real-Time Tracking
            </h1>
            <p className="text-gray-600 mt-1">
              Monitor driver locations in real-time
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Auto-refresh (30s)
            </span>
          </label>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Drivers</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {locations.length}
              </p>
            </div>
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Duty</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {activeDrivers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Idle</p>
              <p className="text-3xl font-bold text-gray-600 mt-1">
                {idleDrivers.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPin className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Driver Locations
          </h2>
          <div className="text-sm text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        </div>

        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-gray-600">Loading map...</p>
            </div>
          </div>
        ) : locations.length === 0 ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No driver locations available</p>
              <p className="text-sm text-gray-500 mt-1">
                Drivers will appear here once they start sharing their location
              </p>
            </div>
          </div>
        ) : (
          <div className="h-[600px]">
            <MapView center={mapCenter} zoom={12}>
              {locations.map((location) => (
                <DriverMarker key={location.id} location={location} />
              ))}
            </MapView>
          </div>
        )}
      </div>

      {/* Driver List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Drivers
          </h2>
        </div>

        {locations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No drivers online</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {locations.map((location) => (
              <div
                key={location.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${location.assignment_id ? "bg-red-600" : "bg-gray-400"
                        }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {location.driver_name}
                      </p>
                      {location.vehicle_license_plate && (
                        <p className="text-sm text-gray-600">
                          Vehicle: {location.vehicle_license_plate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {location.assignment_id ? "On Duty" : "Idle"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {location.updated_at ? new Date(location.updated_at).toLocaleTimeString() : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
