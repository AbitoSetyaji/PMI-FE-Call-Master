"use client";

import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { ReactNode } from "react";

interface MapViewProps {
  center: [number, number];
  zoom?: number;
  className?: string;
  children?: ReactNode;
}

export function MapView({
  center,
  zoom = 13,
  className = "h-[600px] w-full rounded-lg",
  children,
}: MapViewProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
