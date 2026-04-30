"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BusLocationPayload, listenBusLocation } from "@/firebase/rtdb";
import { haversineDistanceMeters } from "@/lib/haversine";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Icon, Map, Marker as LeafletMarker } from "leaflet";
import { deleteField, doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

const ENABLE_BUS_TOWARD_PICKUP_TEST = true;
const SIMULATION_STEP_METERS = 35;

const ParentMapClient = dynamic(() => import("./ParentMapClient"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100" />,
});

function animateMarker(
    marker: LeafletMarker,
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    duration = 900
) {
    const startTime = performance.now();

    const step = (time: number) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);

        const lat = start.lat + (end.lat - start.lat) * eased;
        const lng = start.lng + (end.lng - start.lng) * eased;

        marker.setLatLng([lat, lng]);

        if (progress < 1) {
            requestAnimationFrame(step);
        }
    };

    requestAnimationFrame(step);
}

const ParentPage = () => {
    const { user, loading: authLoading } = useAuth();
    // console.log(user)
    const [mapMounted, setMapMounted] = useState(false);
    const [position, setPosition] = useState<BusLocationPayload | null>(null);
    const [simulatedPosition, setSimulatedPosition] = useState<BusLocationPayload | null>(null);
    const [locationLoading, setLocationLoading] = useState(true);
    const [now, setNow] = useState(Date.now());
    const [currentDistanceMeters, setCurrentDistanceMeters] = useState<number | null>(null);
    const [markerIcon, setMarkerIcon] = useState<Icon | null>(null);
    const mapRef = useRef<Map | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
    const prevTripActiveRef = useRef<boolean | null>(null);
    const hasNearbyToastTriggeredRef = useRef(false);
    const busId = user?.busId;
    const isTripActive = position?.tripActive === true;
    const hasLocation = typeof position?.lat === "number" && typeof position?.lng === "number";
    const pickupLocation = user?.pickupLocation;
    const pickupCoordinates =
        typeof pickupLocation?.lat === "number" && typeof pickupLocation?.lng === "number"
            ? { lat: pickupLocation.lat, lng: pickupLocation.lng }
            : null;
    const displayPosition = ENABLE_BUS_TOWARD_PICKUP_TEST ? simulatedPosition ?? position : position;
    const displayHasLocation =
        typeof displayPosition?.lat === "number" && typeof displayPosition?.lng === "number";
    const displayIsTripActive = displayPosition?.tripActive === true;

    useEffect(() => {
        setMapMounted(true);
    }, []);

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

    useEffect(() => {
        if (!busId) {
            setLocationLoading(false);
            setPosition(null);
            setSimulatedPosition(null);
            return;
        }

        setLocationLoading(true);

        const unsubscribe = listenBusLocation(busId, (data) => {
            setPosition(data);
            setLocationLoading(false);

            const nextActive = data?.tripActive === true;
            const prevActive = prevTripActiveRef.current;


            // -----------  ADD FIREBASE MESSAGING NOTIFICATION HERE FOR BUS START/STOP  --------------

            if (prevActive !== null && prevActive !== nextActive) {
                if (nextActive) {
                    toast.success("Driver started trip. Live tracking is active.");
                } else {
                    toast.message("Driver stopped trip. Live tracking paused.");
                }
            }

            prevTripActiveRef.current = nextActive;
        });

        return () => unsubscribe();
    }, [busId]);

    useEffect(() => {
        if (!ENABLE_BUS_TOWARD_PICKUP_TEST) return;
        if (!pickupCoordinates || !displayIsTripActive) {
            setSimulatedPosition(null);
            return;
        }

        const basePosition = simulatedPosition ?? position;
        const startPosition =
            basePosition && typeof basePosition.lat === "number" && typeof basePosition.lng === "number"
                ? basePosition
                : {
                    lat: pickupCoordinates.lat + 0.01,
                    lng: pickupCoordinates.lng + 0.01,
                    tripActive: true,
                    accuracy: 10,
                    timestamp: Date.now(),
                };

        const interval = window.setInterval(() => {
            setSimulatedPosition((current) => {
                const source =
                    current && typeof current.lat === "number" && typeof current.lng === "number"
                        ? current
                        : startPosition;

                const currentDistance = haversineDistanceMeters(
                    { lat: source.lat, lng: source.lng },
                    pickupCoordinates
                );

                if (currentDistance <= 20) {
                    return {
                        ...source,
                        lat: pickupCoordinates.lat,
                        lng: pickupCoordinates.lng,
                        timestamp: Date.now(),
                    };
                }

                const moveRatio = Math.min(1, SIMULATION_STEP_METERS / Math.max(currentDistance, 1));
                const nextLat = source.lat + (pickupCoordinates.lat - source.lat) * moveRatio;
                const nextLng = source.lng + (pickupCoordinates.lng - source.lng) * moveRatio;

                return {
                    ...source,
                    lat: nextLat,
                    lng: nextLng,
                    tripActive: true,
                    timestamp: Date.now(),
                };
            });
        }, 1000);

        return () => window.clearInterval(interval);
    }, [displayIsTripActive, pickupCoordinates, position, simulatedPosition]);

    useEffect(() => {
        if (!displayPosition || !displayIsTripActive || !markerRef.current) return;

        const nextPos = { lat: displayPosition.lat, lng: displayPosition.lng };

        if (!prevPositionRef.current) {
            markerRef.current.setLatLng([nextPos.lat, nextPos.lng]);
            prevPositionRef.current = nextPos;
            return;
        }

        animateMarker(markerRef.current, prevPositionRef.current, nextPos);
        prevPositionRef.current = nextPos;
    }, [displayPosition, displayIsTripActive]);

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!mapRef.current || !displayHasLocation || !displayIsTripActive) return;

        mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }, [displayPosition, displayHasLocation, displayIsTripActive]);

    useEffect(() => {
        const pickupLat = pickupCoordinates?.lat;
        const pickupLng = pickupCoordinates?.lng;

        if (!displayHasLocation || typeof pickupLat !== "number" || typeof pickupLng !== "number" || !displayIsTripActive) {
            hasNearbyToastTriggeredRef.current = false;
            setCurrentDistanceMeters(null);
            return;
        }

        const busLocation = { lat: displayPosition.lat, lng: displayPosition.lng };
        const distanceInMeters = haversineDistanceMeters(busLocation, {
            lat: pickupLat,
            lng: pickupLng,
        });
        console.log("distanceInMeters:", distanceInMeters);
        setCurrentDistanceMeters(distanceInMeters);


        if (distanceInMeters <= 200 && !hasNearbyToastTriggeredRef.current) {
            fetch("/api/sendnotification", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    busId: busId,
                    title: "Bus is very close",
                    body: "Get ready. Your bus is arriving now.",
                    data: {
                        busId,
                    },
                }),
            }).catch((error) => {
                console.error("Failed to send proximity notification:", error);
                toast.error("Unable to send proximity notification.");
            });

            hasNearbyToastTriggeredRef.current = true;
            return;
        }

        if (distanceInMeters > 300 && hasNearbyToastTriggeredRef.current) {
            hasNearbyToastTriggeredRef.current = false;
        }
    }, [displayPosition, displayHasLocation, displayIsTripActive, pickupCoordinates]);

    const getLastUpdatedLabel = (timestamp: number) => {
        const diffMs = Math.max(0, now - timestamp);
        const diffSec = Math.floor(diffMs / 1000);

        if (diffSec < 5) return "just now";
        if (diffSec < 60) return `${diffSec}s ago`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m ago`;

        const diffHr = Math.floor(diffMin / 60);
        return `${diffHr}h ago`;
    };

    function recenterMap() {
        if (!mapRef.current || !displayHasLocation) return;

        mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }

    async function handleBeforeLogout() {
        if (user?.role !== "parent") return;

        try {
            await updateDoc(doc(db, "students", user.uid), {
                notificationToken: deleteField(),
                notificationTokenUpdatedAt: deleteField(),
            });
        } catch (error) {
            console.error("Failed to clear FCM token on logout:", error);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-emerald-50 to-cyan-100">
            <div className="sticky top-0 z-50 bg-white shadow-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Parent Tracking</h1>
                        <p className="text-sm text-gray-500">Track your child&apos;s bus in real-time</p>
                    </div>
                    <LogoutButton onBeforeLogout={handleBeforeLogout} />
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-6">
                <Card className="mb-6 border-l-4 border-emerald-500 p-6">
                    <p className="text-sm text-gray-600">Assigned Bus</p>
                    <p className="mt-1 text-lg font-semibold text-gray-800">
                        {authLoading ? "Loading assigned bus..." : busId ?? "Not assigned"}
                    </p>

                    {!authLoading && !busId && (
                        <p className="mt-2 text-sm text-amber-700">No bus is currently assigned to this account.</p>
                    )}

                    {busId && (
                        <p className="mt-2 text-sm text-gray-600">
                            {isTripActive ? "Trip is active. Live location is updating." : "Waiting for driver to start trip."}
                        </p>
                    )}
                </Card>

                <Card className="mb-6 p-4">
                    <div className="mb-3 flex justify-end">
                        <Button
                            type="button"
                            onClick={recenterMap}
                            disabled={!hasLocation}
                            variant="outline"
                            className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
                        >
                            Recenter map
                        </Button>
                    </div>
                    <div className="h-150 w-full overflow-hidden rounded-lg border border-gray-200">
                        {mapMounted ? (
                            <ParentMapClient
                                mapRef={mapRef}
                                markerRef={markerRef}
                                markerIcon={markerIcon}
                                isTripActive={displayIsTripActive}
                                hasLocation={displayHasLocation}
                                position={displayPosition}
                                pickupLocation={pickupCoordinates}
                            />
                        ) : (
                            <div className="h-full w-full bg-slate-100" />
                        )}
                    </div>
                </Card>

                <Card className="p-6">
                    {locationLoading ? (
                        <p className="text-sm text-gray-600">Loading location...</p>
                    ) : hasLocation ? (
                        <div className="space-y-1 text-sm text-gray-700">
                            <p>
                                <span className="font-medium">Latitude:</span> {position.lat}
                            </p>
                            <p>
                                <span className="font-medium">Longitude:</span> {position.lng}
                            </p>
                            <p>
                                <span className="font-medium">Accuracy:</span> {position.accuracy} meters
                            </p>
                            <p>
                                <span className="font-medium">Timestamp:</span> {new Date(position.timestamp).toLocaleString()}
                            </p>
                            {pickupCoordinates && (
                                <>
                                    <p>
                                        <span className="font-medium">Home Pickup:</span> {pickupCoordinates.lat.toFixed(5)}, {pickupCoordinates.lng.toFixed(5)}
                                    </p>
                                    <p>
                                        <span className="font-medium">Distance to Home:</span>{" "}
                                        {typeof currentDistanceMeters === "number" ? `${Math.round(currentDistanceMeters)} m` : "--"}
                                    </p>
                                    <p>
                                        <span className="font-medium">Status:</span>{" "}
                                        {typeof currentDistanceMeters === "number" && currentDistanceMeters <= 200
                                            ? "Arrived near pickup"
                                            : "On the way"}
                                    </p>
                                </>
                            )}
                            {!isTripActive && (
                                <p>
                                    <span className="font-medium">Last Updated:</span> {getLastUpdatedLabel(position.timestamp)}
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600">No location available yet.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ParentPage;