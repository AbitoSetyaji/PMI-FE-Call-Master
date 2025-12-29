"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "./Modal";
import { Truck, Search, CheckCircle } from "lucide-react";
import { Badge } from "./Badge";
import type { Vehicle } from "@/lib/types";

interface VehicleSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectVehicle: (vehicleId: string) => void;
    transportTypeId?: string; // Filter vehicles by transport type from report
}

export default function VehicleSelectionModal({
    isOpen,
    onClose,
    onSelectVehicle,
    transportTypeId,
}: VehicleSelectionModalProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

    // Fetch available vehicles
    const { data: vehiclesData, isLoading } = useQuery<{ status: string; message: string; data: Vehicle[] }>({
        queryKey: ["vehicles"],
        queryFn: async () => {
            const token = localStorage.getItem("pmi_auth_token");
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"}/vehicles`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) throw new Error("Failed to fetch vehicles");
            return response.json();
        },
        enabled: isOpen,
    });

    const vehicles = vehiclesData?.data || [];

    // Filter available vehicles by status and transport type
    const availableVehicles = vehicles.filter(
        (vehicle) => {
            // Must be available
            if (vehicle.status !== "available") return false;

            // If transportTypeId is provided, filter by matching vehicle type
            // Check both vehicle_type_id and type fields for API compatibility
            if (transportTypeId) {
                const vehicleTypeId = vehicle.vehicle_type_id || (vehicle as unknown as { type?: string }).type;
                return vehicleTypeId === transportTypeId;
            }

            return true;
        }
    );

    // Filter by search query
    const filteredVehicles = availableVehicles.filter(
        (vehicle) =>
            vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            vehicle.plate_number.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectVehicle = () => {
        if (selectedVehicleId) {
            onSelectVehicle(selectedVehicleId);
            setSelectedVehicleId(null);
            setSearchQuery("");
        }
    };

    const handleClose = () => {
        setSelectedVehicleId(null);
        setSearchQuery("");
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Select Vehicle" size="lg">
            <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or plate number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>

                {/* Vehicle List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">
                            Loading vehicles...
                        </div>
                    ) : filteredVehicles.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {searchQuery
                                ? "No vehicles found matching your search"
                                : "No available vehicles at the moment"}
                        </div>
                    ) : (
                        filteredVehicles.map((vehicle) => (
                            <div
                                key={vehicle.id}
                                onClick={() => setSelectedVehicleId(vehicle.id)}
                                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedVehicleId === vehicle.id
                                    ? "border-red-600 bg-red-50"
                                    : "border-gray-200 hover:border-red-300 hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="bg-red-100 p-2 rounded-lg">
                                            <Truck className="w-6 h-6 text-red-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900">
                                                {vehicle.name}
                                            </h4>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Plate: {vehicle.plate_number}
                                            </p>
                                            {vehicle.vehicle_type && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Type: {typeof vehicle.vehicle_type === 'object'
                                                        ? vehicle.vehicle_type.name
                                                        : vehicle.vehicle_type}
                                                </p>
                                            )}
                                            <div className="mt-2">
                                                <Badge variant={vehicle.status}>
                                                    {vehicle.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                    {selectedVehicleId === vehicle.id && (
                                        <CheckCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSelectVehicle}
                        disabled={!selectedVehicleId}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Select Vehicle
                    </button>
                </div>
            </div>
        </Modal>
    );
}
