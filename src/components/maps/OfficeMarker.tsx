"use client";

import { Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface OfficeMarkerProps {
    position: [number, number];
    name: string;
    address?: string;
}

// Create custom office icon (building icon)
const createOfficeIcon = () => {
    const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#dc2626" stroke="white" stroke-width="1.5">
      <path d="M3 21h18"/>
      <path d="M5 21V7l8-4v18"/>
      <path d="M19 21V11l-6-4"/>
      <path d="M9 9v.01"/>
      <path d="M9 12v.01"/>
      <path d="M9 15v.01"/>
      <path d="M9 18v.01"/>
    </svg>
  `;

    return L.divIcon({
        html: `<div style="background: white; border-radius: 50%; padding: 4px; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${svgIcon}</div>`,
        className: "office-marker-icon",
        iconSize: [48, 48],
        iconAnchor: [24, 48],
        popupAnchor: [0, -48],
    });
};

export function OfficeMarker({ position, name, address }: OfficeMarkerProps) {
    return (
        <Marker position={position} icon={createOfficeIcon()}>
            <Popup>
                <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-red-600 mb-2 text-lg flex items-center gap-2">
                        🏥 {name}
                    </h3>

                    {address && (
                        <p className="text-sm text-gray-600 mb-2">{address}</p>
                    )}

                    <div className="text-xs text-gray-500 mb-2">
                        📍 {position[0].toFixed(6)}, {position[1].toFixed(6)}
                    </div>

                    <a
                        href={`https://www.google.com/maps?q=${position[0]},${position[1]}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        🗺️ Buka di Google Maps
                    </a>
                </div>
            </Popup>
        </Marker>
    );
}
