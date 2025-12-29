"use client";

import { useMap } from "react-leaflet";
import { useEffect } from "react";

interface FlyToLocationProps {
    position: [number, number] | null;
    zoom?: number;
}

export function FlyToLocation({ position, zoom = 15 }: FlyToLocationProps) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom, {
                duration: 1.5,
            });
        }
    }, [map, position, zoom]);

    return null;
}
