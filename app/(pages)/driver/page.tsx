"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { listenBusLocation, setBusTripActive, updateBusLocation } from "@/firebase/rtdb";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { Icon, Map } from "leaflet";

type Position = {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
};

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup), { ssr: false });

type Coordinate = {
    lat: number;
    lng: number;
};

function animateCoordinate(
    start: Coordinate,
    end: Coordinate,
    onFrame: (value: Coordinate) => void,
    duration = 900
) {
    const startTime = performance.now();
    let frameId = 0;

    const step = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        onFrame({
            lat: start.lat + (end.lat - start.lat) * eased,
            lng: start.lng + (end.lng - start.lng) * eased,
        });

        if (progress < 1) {
            frameId = requestAnimationFrame(step);
        }
    };

    frameId = requestAnimationFrame(step);
    return frameId;
}

const DriverPage = () => {
    const { user } = useAuth();
    const [position, setPosition] = useState<Position | null>(null);
    const [started, setStarted] = useState(false);
    const [trackingPhase, setTrackingPhase] = useState<"idle" | "locating" | "tracking">("idle");
    const [error, setError] = useState<string | null>(null);
    const [markerIcon, setMarkerIcon] = useState<Icon | null>(null);
    const [displayPosition, setDisplayPosition] = useState<Position | null>(null);
    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<Map | null>(null);
    const displayPositionRef = useRef<Coordinate | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const hasFirstFixRef = useRef(false);
    const didAutoResumeRef = useRef(false);
    const busId = user?.busId ?? null;

    // Initialize marker icon on client side only
    useEffect(() => {
        let isMounted = true;

        import("leaflet").then((leaflet) => {
            if (!isMounted) return;

            setMarkerIcon(
                new leaflet.Icon({
                    iconUrl: "/bus-icon.svg",
                    iconSize: [42, 42],
                    iconAnchor: [21, 21],
                    popupAnchor: [0, -18],
                })
            );
        });

        return () => {
            isMounted = false;
        };
    }, []);

    const beginLocationWatch = useCallback(() => {
        if (!busId || watchIdRef.current !== null) return;

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const newPos = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    timestamp: pos.timestamp,
                };

                if (!hasFirstFixRef.current) {
                    hasFirstFixRef.current = true;
                    setTrackingPhase("tracking");
                    toast.success("Tracking is now live");
                }

                setPosition(newPos);
                updateBusLocation(busId, newPos);
            },
            (err) => {
                console.error("Geolocation error:", err);
                if (watchIdRef.current !== null) {
                    navigator.geolocation.clearWatch(watchIdRef.current);
                    watchIdRef.current = null;
                }
                setStarted(false);
                setTrackingPhase("idle");
                setBusTripActive(busId, false);
                setError("Unable to access location. Please enable GPS.");
                toast.error("Location access denied");
            },
            { enableHighAccuracy: true }
        );

        watchIdRef.current = watchId;
    }, [busId]);

    async function startTrip() {
        if (!busId) {
            toast.error("No bus assigned");
            setError("No bus assigned to your account");
            return;
        }

        if (watchIdRef.current !== null) {
            toast.warning("Trip already started");
            return;
        }

        setStarted(true);
        setTrackingPhase("locating");
        setError(null);
        hasFirstFixRef.current = false;
        await setBusTripActive(busId, true);
        toast.message("Finding your GPS location...");
        beginLocationWatch();
    }

    async function stopTrip() {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        if (busId) {
            await setBusTripActive(busId, false);
        }
        setStarted(false);
        setTrackingPhase("idle");
        hasFirstFixRef.current = false;
        didAutoResumeRef.current = false;
        setDisplayPosition(null);
        displayPositionRef.current = null;
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        toast.success("Trip stopped");
    }

    async function handleLogout() {
        if (!busId) return;

        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }

        await setBusTripActive(busId, false);
        setDisplayPosition(null);
        displayPositionRef.current = null;
        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
    }

    useEffect(() => {
        if (!busId) return;

        const unsubscribe = listenBusLocation(busId, (data) => {
            const isTripActive = data?.tripActive === true;
            const hasCoords = typeof data?.lat === "number" && typeof data?.lng === "number";

            if (hasCoords) {
                const nextPos = {
                    lat: data.lat,
                    lng: data.lng,
                    accuracy: data.accuracy,
                    timestamp: data.timestamp,
                };

                setPosition(nextPos);

                if (isTripActive && displayPositionRef.current === null) {
                    setDisplayPosition(nextPos);
                }
            }

            if (isTripActive && watchIdRef.current === null) {
                setStarted(true);
                setTrackingPhase(hasFirstFixRef.current ? "tracking" : "locating");
                beginLocationWatch();

                if (!didAutoResumeRef.current) {
                    didAutoResumeRef.current = true;
                }
                return;
            }

            if (!isTripActive && watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                setStarted(false);
                setTrackingPhase("idle");
                hasFirstFixRef.current = false;
                didAutoResumeRef.current = false;
                setDisplayPosition(null);
                displayPositionRef.current = null;
                if (animationFrameRef.current !== null) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            }
        });

        return () => unsubscribe();
    }, [beginLocationWatch, busId]);

    useEffect(() => {
        if (!mapRef.current || !position) return;

        mapRef.current.flyTo([position.lat, position.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }, [position]);

    function recenterMap() {
        if (!mapRef.current || !displayPosition) return;

        mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }

    useEffect(() => {
        displayPositionRef.current = displayPosition ? { lat: displayPosition.lat, lng: displayPosition.lng } : null;
    }, [displayPosition]);

    useEffect(() => {
        if (!position || !started || !markerIcon) {
            return;
        }

        const start = displayPositionRef.current ?? { lat: position.lat, lng: position.lng };
        const end = { lat: position.lat, lng: position.lng };

        if (!displayPositionRef.current) {
            setDisplayPosition(position);
            displayPositionRef.current = end;
            return;
        }

        if (animationFrameRef.current !== null) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = animateCoordinate(start, end, (value) => {
            setDisplayPosition({
                lat: value.lat,
                lng: value.lng,
                accuracy: position.accuracy,
                timestamp: position.timestamp,
            });
        });

        return () => {
            if (animationFrameRef.current !== null) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [markerIcon, position, started]);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Driver Portal</h1>
                        <p className="text-sm text-gray-500">Manage your bus trip</p>
                    </div>
                    {/* <LogoutButton onBeforeLogout={handleLogout} /> */}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Status Card */}
                <Card className="mb-6 p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-2">Trip Status</p>
                            <p className="text-2xl font-bold">
                                {started ? (
                                    <span className="text-green-600 flex items-center gap-2">
                                        <span className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></span>
                                        {trackingPhase === "locating" ? "Locating..." : "Tracking..."}
                                    </span>
                                ) : (
                                    <span className="text-gray-600 flex items-center gap-2">
                                        <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                                        Stopped
                                    </span>
                                )}
                            </p>
                        </div>
                        {position && (
                            <div className="text-right">
                                <p className="text-sm text-gray-600 mb-1">Current Location</p>
                                <p className="text-sm font-mono text-gray-800">
                                    {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Accuracy: ±{position.accuracy.toFixed(0)}m</p>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Control Buttons */}
                <Card className="mb-6 p-6">
                    <div className="flex gap-4 flex-wrap">
                        <Button
                            onClick={startTrip}
                            disabled={started}
                            className={`px-8 py-2 font-semibold text-white rounded-lg transition-all ${started
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 active:scale-95"
                                }`}
                        >
                            ▶ Start Trip
                        </Button>
                        <Button
                            onClick={stopTrip}
                            disabled={!started}
                            className={`px-8 py-2 font-semibold text-white rounded-lg transition-all ${!started
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-600 hover:bg-red-700 active:scale-95"
                                }`}
                        >
                            ⏹ Stop Trip
                        </Button>
                    </div>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">⚠️ {error}</p>
                        </div>
                    )}
                </Card>

                {/* MAP */}
                <Card className="p-4">
                    <div className="mb-3 flex justify-end">
                        <Button
                            type="button"
                            onClick={recenterMap}
                            disabled={!displayPosition}
                            variant="outline"
                            className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50"
                        >
                            Recenter map
                        </Button>
                    </div>
                    <div className="h-150 w-full rounded-lg overflow-hidden border border-gray-200">
                        <MapContainer
                            center={[27.7172, 85.3240]}
                            zoom={16}
                            style={{ height: "100%", width: "100%" }}
                            ref={mapRef}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; OpenStreetMap contributors'
                            />

                            {displayPosition && markerIcon && (
                                <Marker
                                    position={[displayPosition.lat, displayPosition.lng]}
                                    icon={markerIcon}
                                >
                                    <Popup>
                                        <div className="text-sm">
                                            <p><strong>Current Location</strong></p>
                                            <p>Lat: {position?.lat.toFixed(4)}</p>
                                            <p>Lng: {position?.lng.toFixed(4)}</p>
                                            <p>Accuracy: ±{position?.accuracy.toFixed(0)}m</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            )}
                        </MapContainer>
                    </div>
                </Card>

            </div>
        </div>
    );
};

export default DriverPage;