"use client";

import React, { useRef, useEffect, useState } from "react";
import { useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries: ("places")[] = ["places"];

interface AddressAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
}

export default function AddressAutocomplete({
    value,
    onChange,
    placeholder = "Masukkan alamat",
    label,
    error,
    required = false,
    disabled = false,
}: AddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        libraries,
    });

    // Sync external value with internal state
    useEffect(() => {
        setInputValue(value);
    }, [value]);

    const onLoad = (autocomplete: google.maps.places.Autocomplete) => {
        autocompleteRef.current = autocomplete;
    };

    const onPlaceChanged = () => {
        if (autocompleteRef.current) {
            const place = autocompleteRef.current.getPlace();
            if (place.formatted_address) {
                setInputValue(place.formatted_address);
                onChange(place.formatted_address);
            } else if (place.name) {
                setInputValue(place.name);
                onChange(place.name);
            }
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);
        onChange(newValue);
    };

    // If API key is not set or loading failed, render a regular input
    if (loadError || !process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
        return (
            <div className="mb-4">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? "border-red-500" : "border-gray-300"
                        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="mb-4">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {label} {required && <span className="text-red-500">*</span>}
                    </label>
                )}
                <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 animate-pulse">
                    <span className="text-gray-400">Memuat...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            {label && (
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <Autocomplete
                onLoad={onLoad}
                onPlaceChanged={onPlaceChanged}
                options={{
                    componentRestrictions: { country: "id" }, // Restrict to Indonesia
                    types: ["geocode", "establishment"],
                }}
            >
                <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${error ? "border-red-500" : "border-gray-300"
                        } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
                />
            </Autocomplete>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
}
