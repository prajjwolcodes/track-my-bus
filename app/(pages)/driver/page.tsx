"use client";

import { updateBusLocation } from "@/firebase/rtdb";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface BusPosition {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
}

const DriverPage = () => {
    const [position, setPosition] = useState<BusPosition | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [started, setStarted] = useState<boolean>(false);
    const watchIdRef = useRef<number | null>(null);

    function startTrip() {
        setStarted(true);
        setLoading(true);

        try {
            if (!navigator.geolocation) {
                toast.error("Geolocation not supported");
                return;
            }

            if (watchIdRef.current !== null) return;

            function successCallback(pos: GeolocationPosition) {
                const { coords, timestamp } = pos;

                const newPos = {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    accuracy: coords.accuracy,
                    timestamp,
                };

                updateBusLocation(1, newPos);
                setPosition(newPos);
            }

            function errorCallback(err: GeolocationPositionError) {
                toast.error(err.message);
            }

            const watchId = navigator.geolocation.watchPosition(
                successCallback,
                errorCallback,
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 1000,
                }
            );

            watchIdRef.current = watchId;
            toast.success("Trip Started 🚍");
        } catch (error) {
            toast.error("Error starting trip");
        } finally {
            setLoading(false);
        }
    }

    const stopTrip = () => {
        setStarted(false);
        setLoading(true);

        try {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                toast.success("Trip Stopped 🛑");
            }
        } catch (error) {
            toast.error("Error stopping trip");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          🚌 Driver Live Tracking
        </h1>
        <p className="text-gray-600">
          Share your real-time location with parents
        </p>
      </div>


            {/* Main Card */}
            <div className="bg-white shadow-xl rounded-3xl p-6 w-full max-w-4xl">

                {/* Trip Status */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="text-sm text-gray-500">Trip Status</p>
                        <p className={`text-lg font-semibold ${started ? "text-green-600" : "text-red-500"}`}>
                            {started ? "🟢 Trip In Progress" : "🔴 Trip Not Started"}
                        </p>
                    </div>

                    {loading && <p className="text-blue-500">Updating...</p>}
                </div>

                {/* Map Placeholder */}
                <div className="w-full h-96 bg-gray-200 rounded-2xl flex items-center justify-center mb-6">
                    <p className="text-gray-500">
                        Live Map Preview (You can integrate Leaflet here)
                    </p>
                </div>

                {/* Location Info */}
                {started && position && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500">Latitude</p>
                            <p className="font-semibold">{position.lat}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500">Longitude</p>
                            <p className="font-semibold">{position.lng}</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500">Accuracy</p>
                            <p className="font-semibold">{position.accuracy} m</p>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-xl">
                            <p className="text-sm text-gray-500">Last Updated</p>
                            <p className="font-semibold">
                                {new Date(position.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-4">
                    <button
                        onClick={startTrip}
                        disabled={started}
                        className="flex-1 bg-green-900 hover:bg-green-700 text-white py-3 rounded-xl transition disabled:opacity-50"
                    >
                        ▶️ Start Trip
                    </button>

                    <button
                        onClick={stopTrip}
                        disabled={!started}
                        className="flex-1 bg-red-900 hover:bg-red-700 text-white py-3 rounded-xl transition disabled:opacity-50"
                    >
                        ⏹ Stop Trip
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverPage;