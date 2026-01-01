"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { DriverLocation } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { generateReportDisplayId } from "@/lib/utils";

interface DriverMarkerProps {
  location: DriverLocation;
  color?: string;
}

// Fix default marker icon issue in Leaflet with Next.js
const createCustomIcon = (color: string) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3" fill="white"/>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: "custom-marker-icon",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

export function DriverMarker({ location, color = "#ef4444" }: DriverMarkerProps) {
  const position: [number, number] = [location.latitude, location.longitude];
  const isOnDuty = !!location.assignment_id;

  return (
    <Marker position={position} icon={createCustomIcon(color)}>
      <Popup>
        <div className="p-2 min-w-[220px]">
          <h3 className="font-semibold text-gray-900 mb-2 text-lg">
            {location.driver_name || "Unknown Driver"}
          </h3>

          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Status:</span>
              <Badge variant={isOnDuty ? "info" : "default"}>
                {isOnDuty ? "🔴 On Duty" : "⚪ Idle"}
              </Badge>
            </div>

            {location.vehicle_license_plate && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">🚗 Vehicle:</span>
                <span className="font-medium">
                  {location.vehicle_license_plate}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-600">📍 Coordinates:</span>
              <span className="font-mono text-xs">
                {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
              </span>
            </div>

            {location.assignment_id && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  📋 ID Laporan: {location.report
                    ? generateReportDisplayId(
                      location.report.transport_type_name,
                      location.report.schedule_date,
                      location.report.schedule_time
                    )
                    : `#${location.assignment_id.slice(0, 8)}...`
                  }
                </span>
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-gray-200">
              <a
                href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs"
              >
                🗺️ Buka di Google Maps
              </a>
            </div>

            {location.timestamp && (
              <div className="text-xs text-gray-400 mt-1">
                🕐 Updated: {new Date(location.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
              </div>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}

