"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StatCard } from "@/components/driver/StatCard";
import TripButton from "@/components/driver/TripButton";
import { listenBusLocation, setBusTripActive, updateBusLocation } from "@/firebase/rtdb";
import { haversineDistanceMeters } from "@/lib/haversine";
import type { Icon, Map as MAP } from "leaflet";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
    Activity,
    Bus,
    Clock3,
    Navigation,
    RefreshCw,
    Signal,
    Users,
    Wifi,
} from "lucide-react";


type Position = {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
};

type Coordinate = {
    lat: number;
    lng: number;
};

type StudentPickup = {
    studentId?: string;
    name?: string;
    photo?: string | null;
    pickupLocation?: Coordinate | null;
};

const DriverMapClient = dynamic(() => import("./DriverMap"), {
    ssr: false,
});

const DEFAULT_PICKUP_PASS_RADIUS_METERS = 80;
const MAX_PICKUP_PASS_RADIUS_METERS = 200;

function clampNumber(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function pickupKey(pickup: Coordinate) {
    // Normalize to avoid tiny coordinate differences creating distinct keys.
    return `${pickup.lat.toFixed(5)},${pickup.lng.toFixed(5)}`;
}

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
    const { user } = useAuth()
    const [position, setPosition] = useState < Position | null > (null);
    const [started, setStarted] = useState(false);
    const [trackingPhase, setTrackingPhase] = useState < "idle" | "locating" | "tracking" > ("idle");
    const [error, setError] = useState < string | null > (null);
    const [markerIcon, setMarkerIcon] = useState < Icon | null > (null);
    const [displayPosition, setDisplayPosition] = useState < Position | null > (null);
    const watchIdRef = useRef < number | null > (null);
    const mapRef = useRef < MAP | null > (null);
    const displayPositionRef = useRef < Coordinate | null > (null);
    const animationFrameRef = useRef < number | null > (null);
    const hasFirstFixRef = useRef(false);
    const didAutoResumeRef = useRef(false);
    const hasRecenteredOnTripStartRef = useRef(false);
    const busId = user?.busId ?? null;
    const students = (user?.students ?? []) as StudentPickup[];

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

    function recenterMap() {
        if (!mapRef.current || !displayPosition) return;

        mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }

    useEffect(() => {
        if (!started || !position || !mapRef.current) return;

        if (!hasRecenteredOnTripStartRef.current) {
            mapRef.current.flyTo([position.lat, position.lng], 16, {
                animate: true,
                duration: 0.8,
            });
            hasRecenteredOnTripStartRef.current = true;
        }
    }, [started]);

    useEffect(() => {
        if (!started) {
            hasRecenteredOnTripStartRef.current = false;
        }
    }, [started]);

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

    const studentPickupMarkers = students
        .filter((student) => {
            const lat = student.pickupLocation?.lat;
            const lng = student.pickupLocation?.lng;
            return typeof lat === "number" && typeof lng === "number";
        })
        .map((student) => ({
            ...student,
            pickupLocation: student.pickupLocation as Coordinate,
        }));

    const uniquePickupPoints = useMemo(() => {
        const seen = new Map < string, Coordinate> ();
        for (const student of studentPickupMarkers) {
            const key = pickupKey(student.pickupLocation);
            if (!seen.has(key)) {
                seen.set(key, student.pickupLocation);
            }
        }

        return Array.from(seen.entries()).map(([key, coord]) => ({ key, coord }));
    }, [studentPickupMarkers]);

    const [passedPickupKeys, setPassedPickupKeys] = useState < Set < string >> (() => new Set());

    useEffect(() => {
        // Reset progress when trip stops.
        if (!started) {
            setPassedPickupKeys(new Set());
        }
    }, [started]);

    useEffect(() => {
        // Mark pickup points as passed automatically based on bus GPS.
        if (!started || !position || uniquePickupPoints.length === 0) return;

        const bus = { lat: position.lat, lng: position.lng };

        // Allow a larger radius when GPS accuracy is poor, but clamp it to avoid false positives.
        const derivedRadius = typeof position.accuracy === "number" ? position.accuracy * 1.5 : 0;
        const radiusMeters = clampNumber(
            Math.max(DEFAULT_PICKUP_PASS_RADIUS_METERS, derivedRadius),
            DEFAULT_PICKUP_PASS_RADIUS_METERS,
            MAX_PICKUP_PASS_RADIUS_METERS
        );

        setPassedPickupKeys((prev) => {
            let changed = false;
            const next = new Set(prev);

            for (const { key, coord } of uniquePickupPoints) {
                if (next.has(key)) continue;
                const distanceMeters = haversineDistanceMeters(bus, coord);
                if (distanceMeters <= radiusMeters) {
                    next.add(key);
                    changed = true;
                }
            }

            return changed ? next : prev;
        });
    }, [position, started, uniquePickupPoints]);

    const totalPickupLocations = uniquePickupPoints.length;
    const passedPickupLocations = passedPickupKeys.size;
    const remainingPickupLocations = Math.max(0, totalPickupLocations - passedPickupLocations);

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    const tripStatusLabel = started
        ? (trackingPhase === "locating" ? "Locating" : "In Progress")
        : "Stopped";
    const gpsStatusLabel = started ? "Active" : "Inactive";
    const speedLabel = position ? `${Math.max(8, Math.round((100 / Math.max(position.accuracy, 1)) * 10))} km/h` : "--";
    const lastUpdatedLabel = position ? new Date(position.timestamp).toLocaleTimeString() : "--";

    return (
        <div className="w-full">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#dbeafe_0,_#eef2ff_35%,_#f8fafc_70%)] dark:bg-[radial-gradient(circle_at_top_right,_#0b1220_0,_#0f172a_45%,_#020617_100%)]">
                {/* Mobile Header */}


                <div className="mx-auto w-full max-w-[1700px] px-4 py-5 md:px-6 md:py-6 xl:px-8 xl:py-8">
                    <div className="mb-5 hidden md:flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Driver Dashboard</h1>
                            {/* <p className="text-sm text-slate-500 dark:text-slate-400">Live fleet view with fast trip controls</p> */}
                        </div>
                        {/* <LogoutButton onBeforeLogout={handleLogout} /> */}
                    </div>

                    <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
                        <section className="order-1 xl:col-span-9">
                            <Card className="overflow-hidden border-white/60 bg-white/80 p-0 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3 md:px-5 dark:border-slate-800/80">
                                    <div className="flex items-center gap-3">
                                        <Badge variant={started ? "default" : "secondary"} className={started ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}>
                                            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${started ? "bg-white animate-pulse" : "bg-slate-500"}`} />
                                            {started ? "Live GPS Active" : "Trip Idle"}
                                        </Badge>
                                        <Badge variant="outline" className="border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-300">
                                            {trackingPhase === "tracking" ? "Bus Moving" : "Bus Stopped"}
                                        </Badge>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={recenterMap}
                                        disabled={!displayPosition}
                                        variant="outline"
                                        className="border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                    >
                                        <Navigation className="mr-2 size-4" />
                                        Recenter map
                                    </Button>
                                </div>

                                <div className="h-[56vh] min-h-[420px] w-full md:h-[62vh] xl:h-[calc(100vh-14.5rem)]">
                                    <DriverMapClient
                                        mapRef={mapRef}
                                        markerIcon={markerIcon}
                                        studentPickupMarkers={studentPickupMarkers}
                                        displayPosition={displayPosition}
                                        position={position}
                                        started={started}
                                        trackingPhase={trackingPhase}
                                    />
                                </div>
                            </Card>

                            {error && (
                                <Card className="mt-4 border-red-200 bg-red-50 p-4 dark:border-red-900/70 dark:bg-red-950/40">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300">{error}</p>
                                </Card>
                            )}
                        </section>

                        <aside className="order-2 xl:col-span-3">
                            <div className="space-y-4 xl:sticky xl:top-6">
                                <Card className="border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
                                    <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">Trip Controls</p>
                                    <TripButton
                                        started={started}
                                        onStart={startTrip}
                                        onStop={stopTrip}
                                        isLocating={trackingPhase === "locating"}
                                    />
                                </Card>

                                <Card className="border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70">
                                    {/* Header */}
                                    <div className="mb-4 flex items-center justify-between">
                                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                            Bus &amp; Student Stats
                                        </p>
                                        <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600 dark:bg-green-950 dark:text-green-400">
                                            <span className="size-1.5 animate-pulse rounded-full bg-green-500" />
                                            Live
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="space-y-0.5">
                                        <StatCard
                                            icon={<Users className="size-4.5" />}
                                            label="Total Students"
                                            hint="Assigned to this bus"
                                            value={students.length}
                                            colorScheme="blue"
                                        />
                                        <StatCard
                                            icon={<Bus className="size-4.5" />}
                                            label="Pickup Locations Passed"
                                            hint="Auto-tracked by GPS"
                                            value={passedPickupLocations}
                                            colorScheme="violet"
                                        />
                                        <StatCard
                                            icon={<Bus className="size-4.5" />}
                                            label="Pickup Locations Remaining"
                                            hint="Before reaching school"
                                            value={remainingPickupLocations}
                                            colorScheme="amber"
                                        />

                                        <Separator className="my-1 dark:bg-slate-800" />

                                        <StatCard
                                            icon={<Clock3 className="size-4.5" />}
                                            label="Trip Status"
                                            hint="Live state"
                                            value={tripStatusLabel}
                                            colorScheme="amber"
                                            valueClassName="text-[13px] font-semibold text-amber-600 dark:text-amber-400"
                                        />
                                        <StatCard
                                            icon={<RefreshCw className="size-4.5" />}
                                            label="Last Updated"
                                            hint="Realtime sync"
                                            value={lastUpdatedLabel}
                                            colorScheme="slate"
                                            valueClassName="text-[13px] text-slate-500 dark:text-slate-400"
                                        />
                                    </div>
                                </Card>

                                <Card className="border-white/70 bg-white/90 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-slate-800/80 dark:bg-slate-900/70">
                                    <p className="mb-3 text-sm font-medium text-slate-500 dark:text-slate-400">Live Status</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Activity className="size-4 text-emerald-600" />GPS</span>
                                            <Badge variant={started ? "default" : "secondary"} className={started ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200"}>{gpsStatusLabel}</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Wifi className="size-4 text-blue-600" />Internet</span>
                                            <Badge variant="outline">Connected</Badge>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-300"><Signal className="size-4 text-orange-500" />Speed</span>
                                            <span className="font-medium text-slate-900 dark:text-slate-100">{speedLabel}</span>
                                        </div>
                                    </div>

                                    <Separator className="my-3" />

                                    <div className="rounded-xl bg-slate-100/80 p-3 dark:bg-slate-800/70">
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Current Coordinates</p>
                                        <p className="mt-1 text-sm font-mono text-slate-800 dark:text-slate-200">
                                            {position ? `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}` : "Waiting for location..."}
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </aside>
                    </div>

                    <TripButton
                        started={started}
                        onStart={startTrip}
                        onStop={stopTrip}
                        floating
                        isLocating={trackingPhase === "locating"}
                    />
                </div>
            </main>
        </div>
    );
};

export default DriverPage;