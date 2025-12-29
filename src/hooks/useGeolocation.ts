/**
 * useGeolocation Hook
 * Custom hook for accessing browser geolocation
 */

import { useState, useEffect } from "react";

interface GeolocationState {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
}

interface UseGeolocationOptions {
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
    watch?: boolean; // If true, continuously watch position
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
    const {
        enableHighAccuracy = true,
        timeout = 10000,
        maximumAge = 0,
        watch = false,
    } = options;

    const [state, setState] = useState<GeolocationState>({
        latitude: null,
        longitude: null,
        accuracy: null,
        error: null,
        loading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState((prev) => ({
                ...prev,
                error: "Geolocation tidak didukung oleh browser Anda",
                loading: false,
            }));
            return;
        }

        const handleSuccess = (position: GeolocationPosition) => {
            setState({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                error: null,
                loading: false,
            });
        };

        const handleError = (error: GeolocationPositionError) => {
            let errorMessage = "Terjadi kesalahan saat mengakses lokasi";

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = "Akses lokasi ditolak. Silakan aktifkan izin lokasi.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = "Informasi lokasi tidak tersedia";
                    break;
                case error.TIMEOUT:
                    errorMessage = "Permintaan lokasi timeout";
                    break;
            }

            setState((prev) => ({
                ...prev,
                error: errorMessage,
                loading: false,
            }));
        };

        const geoOptions: PositionOptions = {
            enableHighAccuracy,
            timeout,
            maximumAge,
        };

        let watchId: number | undefined;

        if (watch) {
            // Watch position continuously
            watchId = navigator.geolocation.watchPosition(
                handleSuccess,
                handleError,
                geoOptions
            );
        } else {
            // Get position once
            navigator.geolocation.getCurrentPosition(
                handleSuccess,
                handleError,
                geoOptions
            );
        }

        // Cleanup
        return () => {
            if (watchId !== undefined) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [enableHighAccuracy, timeout, maximumAge, watch]);

    const refetch = () => {
        setState((prev) => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    loading: false,
                });
            },
            (error) => {
                let errorMessage = "Terjadi kesalahan saat mengakses lokasi";

                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = "Akses lokasi ditolak";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = "Informasi lokasi tidak tersedia";
                        break;
                    case error.TIMEOUT:
                        errorMessage = "Permintaan lokasi timeout";
                        break;
                }

                setState((prev) => ({
                    ...prev,
                    error: errorMessage,
                    loading: false,
                }));
            },
            {
                enableHighAccuracy,
                timeout,
                maximumAge,
            }
        );
    };

    return {
        ...state,
        refetch,
    };
}
