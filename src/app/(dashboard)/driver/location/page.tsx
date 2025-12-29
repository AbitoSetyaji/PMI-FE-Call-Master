"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { MapPin, Power, RefreshCw, Navigation } from "lucide-react";

export default function DriverLocationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);

  // Handle redirects in useEffect to prevent setState during render
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "driver") {
        router.push("/dashboard");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Return null while redirecting
  if (!user || user.role !== "driver") {
    return null;
  }

  const handleToggleDuty = () => {
    setIsOnDuty(!isOnDuty);
    setLocationError(null);
  };

  const getCurrentPosition = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          setLocationError(null);
        },
        (error) => {
          setLocationError(`Error getting location: ${error.message}`);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser");
    }
  };

  const sendLocationUpdate = () => {
    if (currentLocation) {
      const newLocation = {
        id: Date.now().toString(),
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
        timestamp: new Date().toISOString(),
        status: isOnDuty ? "on_duty" : "idle",
        updated_at: new Date().toISOString(),
      };
      setLocationHistory([newLocation, ...locationHistory]);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Location Sharing
              </h1>
              <p className="text-gray-600 mt-1">
                Share your location for real-time tracking
              </p>
            </div>
            <Navigation className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* On Duty Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Power
                  className={`w-6 h-6 ${isOnDuty ? "text-green-600" : "text-gray-400"
                    }`}
                />
                <div>
                  <p className="font-medium text-gray-900">Status</p>
                  <p className="text-sm text-gray-600">
                    {isOnDuty ? "On Duty" : "Off Duty"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleDuty}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${isOnDuty
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-green-600 text-white hover:bg-green-700"
                  }`}
              >
                {isOnDuty ? "Go Off Duty" : "Go On Duty"}
              </button>
            </div>

            {/* Auto-Update Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <RefreshCw
                  className={`w-6 h-6 ${autoUpdate ? "text-blue-600" : "text-gray-400"
                    }`}
                />
                <div>
                  <p className="font-medium text-gray-900">Auto-Update</p>
                  <p className="text-sm text-gray-600">
                    {autoUpdate ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoUpdate(!autoUpdate)}
                disabled={!isOnDuty}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${autoUpdate
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  } disabled:opacity-50`}
              >
                {autoUpdate ? "Disable" : "Enable"}
              </button>
            </div>

            {/* Current Location */}
            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="w-6 h-6 text-red-600" />
                <p className="font-medium text-gray-900">Current Location</p>
              </div>
              {currentLocation ? (
                <div className="text-sm text-gray-600">
                  <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                  <p>Lng: {currentLocation.lng.toFixed(6)}</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No location yet</p>
              )}
              <button
                onClick={getCurrentPosition}
                className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Get Location
              </button>
            </div>
          </div>

          {/* Error Message */}
          {locationError && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{locationError}</p>
            </div>
          )}

          {/* Manual Update Button */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={sendLocationUpdate}
              disabled={!currentLocation || !isOnDuty}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Update Location Now
            </button>
            {autoUpdate && (
              <p className="flex items-center text-sm text-gray-600">
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Auto-updating every 30 seconds
              </p>
            )}
          </div>
        </div>

        {/* Location History List */}
        {locationHistory.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Location Updates
            </h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {locationHistory.map((loc, index) => (
                <div
                  key={loc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className={`w-5 h-5 ${loc.status === "on_duty"
                          ? "text-green-600"
                          : "text-gray-400"
                        }`}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(loc.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${loc.status === "on_duty"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-200 text-gray-600"
                        }`}
                    >
                      {loc.status === "on_duty" ? "On Duty" : "Idle"}
                    </span>
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Latest
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            How to use:
          </h3>
          <ul className="list-disc list-inside space-y-1 text-blue-800">
            <li>Click &quot;Go On Duty&quot; to start sharing your location</li>
            <li>
              Enable &quot;Auto-Update&quot; to automatically send location every 30 seconds
            </li>
            <li>
              Click &quot;Get Location&quot; to manually fetch your current position
            </li>
            <li>
              Click &quot;Update Location Now&quot; to manually send location to server
            </li>
            <li>Your location will be visible on the tracking dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
