"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { listenBusLocation, setBusTripActive, updateBusLocation } from "@/firebase/rtdb";
import { haversineDistanceMeters } from "@/lib/haversine";
import { cn } from "@/lib/utils";
import { doc, getDoc } from "firebase/firestore";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactDOMServer from "react-dom/server";
import { TbBusFilled } from "react-icons/tb";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import type { Icon, DivIcon, Map as MAP } from "leaflet";
import {
    AlertCircle,
    Bus,
    BusFront,
    BusFrontIcon,
    Calendar,
    ChevronRight,
    Clock,
    Gauge,
    Loader2,
    LocateFixed,
    Mail,
    Phone,
    Play,
    Route,
    ShieldCheck,
    Signal,
    Square,
    UserCheck,
    Users
} from "lucide-react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState, type JSX, type ReactNode } from "react";
import { toast } from "sonner";
import LogoutButton from "@/components/LogoutButton";


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

type DriverUser = {
    uid?: string;
    name?: string;
    busId?: string;
    students?: unknown[];
    photo?: string | null;
    driverId?: string;
    routeNo?: string | number | null;
};

type BusInfo = {
    busNo?: string | number;
    plateNo?: string;
    route?: string;
    model?: string;
    busModel?: string;
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

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "D";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function formatTime(value: Date | null) {
    if (!value) return "--";
    return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatCoordinate(value: number | null | undefined) {
    return typeof value === "number" ? value.toFixed(5) : "--";
}

// --- Animated GPS dot ---
function GpsDot(): JSX.Element {
    return (
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
    );
}

// --- Badge (local, for the /map-style UI) ---
function PillBadge({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}): JSX.Element {
    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border",
                className
            )}
        >
            {children}
        </span>
    );
}

function StatRow({
    icon: IconComponent,
    label,
    value,
    accent,
}: {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent?: string;
}): JSX.Element {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2.5 text-gray-600">
                <IconComponent size={14} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className={cn("text-xs font-bold", accent || "text-gray-900")}>{value}</span>
        </div>
    );
}

function CardShell({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
    return (
        <div className={cn("bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg", className)}>
            {children}
        </div>
    );
}

function CardHeader({
    title,
    subtitle,
    action,
}: {
    title: string;
    subtitle?: string;
    action?: ReactNode;
}): JSX.Element {
    return (
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle ? <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p> : null}
            </div>
            {action}
        </div>
    );
}

function MapPill({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
    return (
        <div
            className={cn(
                "flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg",
                className
            )}
        >
            {children}
        </div>
    );
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
    const { user: rawUser } = useAuth();
    console.log(rawUser)
    const user = rawUser as unknown as DriverUser | null;
    const [position, setPosition] = useState<Position | null>(null);
    const [started, setStarted] = useState(false);
    const [trackingPhase, setTrackingPhase] = useState<"idle" | "locating" | "tracking">("idle");
    const [error, setError] = useState<string | null>(null);
    const [markerIcon, setMarkerIcon] = useState<Icon<any> | DivIcon | null>(null);
    const [displayPosition, setDisplayPosition] = useState<Position | null>(null);
    const [tripStartedAt, setTripStartedAt] = useState<Date | null>(null);
    const [tripActionLoading, setTripActionLoading] = useState(false);
    const [time, setTime] = useState<Date | null>(null);
    const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const watchIdRef = useRef<number | null>(null);
    const mapRef = useRef<MAP | null>(null);
    const displayPositionRef = useRef<Coordinate | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const hasFirstFixRef = useRef(false);
    const didAutoResumeRef = useRef(false);
    const hasRecenteredOnTripStartRef = useRef(false);
    const tripStartedAtRef = useRef<Date | null>(null);
    const busId = user?.busId ?? null;
    const students = (user?.students ?? []) as StudentPickup[];
    console.log(students)

    const driverName = user?.name ?? "Driver";
    const driverId = user?.driverId ?? user?.uid ?? "";
    const driverAvatar = getInitials(driverName);
    const driverPhotoUrl = user?.photo ?? ((rawUser as any)?.photoURL ?? null);
    const driverEmail = rawUser?.email ?? null;
    const driverPhone =
        (user as any)?.phone ??
        (user as any)?.phoneNumber ??
        (user as any)?.contact ??
        (rawUser as any)?.phone ??
        (rawUser as any)?.phoneNumber ??
        null;

    const busLabel = useMemo(() => {
        const busNo = busInfo?.busNo;
        const plateNo = busInfo?.plateNo;

        if (plateNo) return plateNo;
        if (busNo !== undefined && busNo !== null && String(busNo).trim().length > 0) {
            return `Bus ${busNo}`;
        }
        return busId ? String(busId) : "No bus assigned";
    }, [busId, busInfo?.busNo, busInfo?.plateNo]);

    const routeLabel = useMemo(() => {
        const route = busInfo?.route;
        if (typeof route === "string" && route.trim().length > 0) return route;

        const routeNo = user?.routeNo;
        if (routeNo !== undefined && routeNo !== null && String(routeNo).trim().length > 0) {
            return `Route ${routeNo}`;
        }
        return "Assigned Route";
    }, [busInfo?.route, user?.routeNo]);

    const busModelLabel = useMemo(() => {
        const model = busInfo?.model ?? busInfo?.busModel;
        if (typeof model === "string" && model.trim().length > 0) return model;
        return "Vehicle";
    }, [busInfo?.busModel, busInfo?.model]);

    // Initialize marker icon on client side only
    useEffect(() => {
        import("leaflet").then((L) => {
            const svgString = ReactDOMServer.renderToString(
                <TbBusFilled size={26} />

            );
            const divIcon = L.divIcon({
                html: svgString,
                className: "lucide-marker", // keep minimal to avoid Leaflet defaults
                iconSize: [42, 42],
                iconAnchor: [21, 21],
            });
            setMarkerIcon(divIcon);
        });
    }, []);

    useEffect(() => {
        // Avoid hydration mismatches: don't render real-time values during SSR.
        setTime(new Date());
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        tripStartedAtRef.current = tripStartedAt;
    }, [tripStartedAt]);

    useEffect(() => {
        let cancelled = false;

        async function loadBus() {
            if (!busId) {
                setBusInfo(null);
                return;
            }

            try {
                const snap = await getDoc(doc(db, "buses", String(busId)));
                if (cancelled) return;
                setBusInfo(snap.exists() ? (snap.data() as BusInfo) : null);
            } catch {
                if (!cancelled) setBusInfo(null);
            }
        }

        loadBus();
        return () => {
            cancelled = true;
        };
    }, [busId]);

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
        const now = new Date();
        tripStartedAtRef.current = now;
        setTripStartedAt(now);
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
        tripStartedAtRef.current = null;
        setTripStartedAt(null);
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

            if (isTripActive) {
                const statusUpdatedAt = (data as (typeof data & { statusUpdatedAt?: unknown }))?.statusUpdatedAt;
                if (!tripStartedAtRef.current && typeof statusUpdatedAt === "number") {
                    const startedAt = new Date(statusUpdatedAt);
                    tripStartedAtRef.current = startedAt;
                    setTripStartedAt(startedAt);
                }
            }

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
                tripStartedAtRef.current = null;
                setTripStartedAt(null);
                if (animationFrameRef.current !== null) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            }
        });

        return () => unsubscribe();
    }, [beginLocationWatch, busId]);

    useEffect(() => {
        if (!started || !position || !mapRef.current) return;

        if (!hasRecenteredOnTripStartRef.current) {
            mapRef.current.flyTo([position.lat, position.lng], 16, {
                animate: true,
                duration: 0.8,
            });
            hasRecenteredOnTripStartRef.current = true;
        }
    }, [position, started]);

    useEffect(() => {
        if (!started) {
            hasRecenteredOnTripStartRef.current = false;
        }
    }, [started]);

    useEffect(() => {
        displayPositionRef.current = displayPosition ? { lat: displayPosition.lat, lng: displayPosition.lng } : null;
    }, [displayPosition]);

    useEffect(() => {
        if (!position || !started) return;

        // Avoid re-render loops / excessive updates: only update when the GPS payload changes.
        setDisplayPosition((prev) => {
            if (!prev) return position;
            if (
                prev.lat === position.lat &&
                prev.lng === position.lng &&
                prev.timestamp === position.timestamp &&
                prev.accuracy === position.accuracy
            ) {
                return prev;
            }
            return position;
        });
    }, [position, started]);

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
        const seen = new Map<string, Coordinate>();
        for (const student of studentPickupMarkers) {
            const key = pickupKey(student.pickupLocation);
            if (!seen.has(key)) {
                seen.set(key, student.pickupLocation);
            }
        }

        return Array.from(seen.entries()).map(([key, coord]) => ({ key, coord }));
    }, [studentPickupMarkers]);

    const [passedPickupKeys, setPassedPickupKeys] = useState<Set<string>>(() => new Set());

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

    const tripActive = started;
    const isLocating = trackingPhase === "locating";
    const actionLoading = tripActionLoading || isLocating;

    const checked = passedPickupLocations;
    const total = Math.max(totalPickupLocations, 0);
    const pct = total > 0 ? Math.round((checked / total) * 100) : 0;

    const canRecenter = Boolean(position || displayPosition);
    const recenterMap = useCallback(() => {
        const map = mapRef.current;
        const target = displayPosition ?? position;
        if (!map || !target) return;

        map.flyTo([target.lat, target.lng], 16, {
            animate: true,
            duration: 0.8,
        });
    }, [displayPosition, position]);


    return (
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}>
            {/* Top Bar */}
            <header className="flex items-center justify-between px-5 py-5 border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center ">
                        <BusFrontIcon size={24} className="" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-gray-900 leading-none">Bus Tracker</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">School Transport System</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <GpsDot />
                        {tripActive ? "GPS Active" : "GPS Standby"}
                    </span>
                    <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open profile menu"
                                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                            >
                                {driverPhotoUrl ? (
                                    <img
                                        src={driverPhotoUrl}
                                        alt="Profile"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                        {driverAvatar}
                                    </div>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent
                            align="start"
                            side="bottom"
                            sideOffset={8}
                            className="w-60 p-2"
                        >
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileMenuOpen(false);
                                    setDetailsOpen(true);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                <span>Details</span>
                                <ChevronRight size={16} className="text-slate-400" />
                            </button>
                            <div className="my-2 h-px bg-slate-200" />
                            <LogoutButton
                                onBeforeLogout={() => {
                                    setProfileMenuOpen(false);
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-68px)]">
                {/* ── LEFT: Map ── */}
                <div className="flex-1 min-h-[120vw] lg:min-h-0 relative flex flex-col p-4 gap-4">
                    {/* Route breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Route size={12} className="text-blue-600" />
                        <span className="text-gray-500">Active Route</span>
                        <ChevronRight size={12} />
                        <span className="text-gray-900 font-semibold">{routeLabel}</span>
                        {tripActive ? (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-emerald-600 font-semibold">Trip #{busLabel}</span>
                            </>
                        ) : null}
                    </div>

                    {/* Map Card */}
                    <CardShell className="relative h-full z-0 flex-1 overflow-hidden rounded-3xl! group">
                        <DriverMapClient
                            mapRef={mapRef}
                            markerIcon={markerIcon}
                            studentPickupMarkers={studentPickupMarkers}
                            displayPosition={displayPosition}
                            position={position}
                            started={started}
                            trackingPhase={trackingPhase}
                            showStatusOverlay={false}
                        />

                        {/* Overlays */}
                        <div className="absolute z-1000 top-3 left-4 flex flex-col gap-2">
                            <MapPill>
                                <GpsDot />
                                {tripActive ? "Live GPS Active" : "GPS Inactive"}
                            </MapPill>
                            <MapPill className={tripActive ? "border-emerald-300/50" : "border-amber-300/50"}>
                                <span className={cn("w-2 h-2 rounded-full", tripActive ? "bg-emerald-500" : "bg-amber-500")} />
                                {tripActive && trackingPhase === "tracking" ? "Bus Moving" : "Bus Stopped"}
                            </MapPill>
                        </div>

                        <div className="absolute top-4 right-4 z-1000">
                            <MapPill>
                                <Clock size={11} className="text-blue-600" />
                                {time === null
                                    ? "—"
                                    : time.toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                            </MapPill>
                        </div>

                        {/* Recenter button (bottom-right) */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                recenterMap();
                            }}
                            disabled={!canRecenter}
                            aria-label="Recenter map"
                            className={cn(
                                "absolute bottom-8 right-4 z-1000 inline-flex size-11 items-center justify-center rounded-full border bg-white/95 shadow-lg backdrop-blur transition active:scale-[0.98]",
                                canRecenter
                                    ? "border-gray-200 text-blue-700 hover:bg-white"
                                    : "cursor-not-allowed border-gray-200 text-gray-300 opacity-70"
                            )}
                        >
                            <LocateFixed className="size-6" />
                        </button>
                    </CardShell>
                </div>

                <div className="w-full lg:w-[300px] xl:w-[400px] flex-shrink-0 flex flex-col sm:mt-8 gap-3 p-4 pt-0 lg:pt-4 lg:pl-0 overflow-y-auto">
                    {/* 1. Trip Control */}
                    <CardShell className="overflow-hidden border-slate-200/80 bg-white shadow-sm">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-4">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium text-slate-800">Trip control</p>
                                <p className="text-xs text-slate-500">
                                    {tripActive ? `Trip #${busLabel} · Active` : "No active trip"}
                                </p>
                            </div>

                            <PillBadge
                                className={cn(
                                    "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                                    tripActive
                                        ? "border-green-200 bg-green-50 text-green-800"
                                        : "border-slate-200 bg-slate-100 text-slate-500"
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        tripActive ? "animate-pulse bg-green-500" : "bg-slate-400"
                                    )}
                                />
                                {tripActive ? "Active" : "Standby"}
                            </PillBadge>
                        </div>

                        {/* Body */}
                        <div className="px-4 pb-4 pt-3.5">
                            <button
                                onClick={async () => {
                                    if (actionLoading) return;
                                    setTripActionLoading(true);
                                    try {
                                        if (tripActive) {
                                            await stopTrip();
                                        } else {
                                            await startTrip();
                                        }
                                    } finally {
                                        setTripActionLoading(false);
                                    }
                                }}
                                disabled={actionLoading}
                                className={cn(
                                    "flex w-full items-center justify-center gap-2 rounded-[10px] py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                                    tripActive
                                        ? "border border-red-100 bg-red-50 text-red-800 hover:bg-red-100"
                                        : "bg-green-600 text-white hover:bg-green-700"
                                )}
                            >
                                {actionLoading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : tripActive ? (
                                    <Square size={14} fill="currentColor" />
                                ) : (
                                    <Play size={14} fill="currentColor" />
                                )}
                                {actionLoading ? "Processing…" : tripActive ? "Stop trip" : "Start trip"}
                            </button>

                            {error && !actionLoading ? (
                                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-red-500">
                                    <AlertCircle size={11} />
                                    <span>{error}</span>
                                </div>
                            ) : tripActive && !actionLoading ? (
                                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                                    <Clock size={11} />
                                    <span>Started at {formatTime(tripStartedAt)} · Trip #{busLabel}</span>
                                </div>
                            ) : null}
                        </div>
                    </CardShell>

                    {/* 2. Driver & Bus Info */}
                    <CardShell className="overflow-hidden border border-slate-200/80 bg-white shadow-sm">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-[11px]">
                                Driver &amp; bus
                            </p>
                        </div>

                        {/* Driver details dialog */}
                        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                            <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Driver details</DialogTitle>
                                    <DialogDescription>
                                        Profile and assigned bus information
                                    </DialogDescription>
                                </DialogHeader>

                                {/* Top section */}
                                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                                    <div className="size-24 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-blue-100">
                                        {driverPhotoUrl ? (
                                            <img
                                                src={driverPhotoUrl}
                                                alt={driverName}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-blue-600 text-2xl font-bold text-white">
                                                {driverAvatar}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-lg font-semibold text-slate-900 sm:text-xl">
                                            {driverName}
                                        </p>

                                        <p className="mt-1 wrap-break-word text-sm text-slate-500">
                                            {busLabel} · {routeLabel}
                                        </p>

                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {busModelLabel}
                                        </p>
                                    </div>
                                </div>

                                {/* Info cards */}
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                            Driver ID
                                        </p>
                                        <p className="mt-1 break-all text-sm font-medium text-slate-800">
                                            {driverId || "--"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                            Bus
                                        </p>
                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                            {busLabel}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                            Phone
                                        </p>

                                        <p className="mt-1 flex items-center gap-2 break-all text-sm font-medium text-slate-800">
                                            <Phone size={14} className="shrink-0 text-slate-500" />
                                            {driverPhone ? String(driverPhone) : "--"}
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                        <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                                            Email
                                        </p>

                                        <p className="mt-1 flex items-start gap-2 break-all text-sm font-medium text-slate-800">
                                            <Mail size={14} className="mt-0.5 shrink-0 text-slate-500" />
                                            {driverEmail ?? "--"}
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter showCloseButton />
                            </DialogContent>
                        </Dialog>

                        {/* Driver row */}
                        <div className="flex items-center gap-3 px-4 py-3">
                            <button
                                type="button"
                                aria-label="Open profile menu"
                                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                            >
                                {driverPhotoUrl ? (
                                    <img
                                        src={driverPhotoUrl}
                                        alt="Profile"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                        {driverAvatar}
                                    </div>
                                )}
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">
                                    {driverName}
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                    {driverId}
                                </p>
                            </div>

                            <span className="flex shrink-0 items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-800 sm:px-2.5 sm:text-[11px]">
                                <ShieldCheck size={11} />
                                Verified
                            </span>
                        </div>

                        {/* Bus row */}
                        <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div className="flex size-8.5 shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600">
                                <Bus size={16} />
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-xs font-medium text-slate-800">
                                    {busLabel}
                                </p>

                                <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                    {busModelLabel}
                                </p>
                            </div>
                        </div>
                    </CardShell>
                    {/* 3. Student Stats */}
                    <CardShell>
                        <CardHeader
                            title="Students"
                            subtitle={"Pickup progress"}
                            action={
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <div className="flex items-center cursor-pointer hover:underline gap-1 text-[11px] text-gray-500">
                                            <Calendar size={10} />
                                            View all Students
                                        </div>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-2xl">
                                        <DialogHeader>
                                            <DialogTitle>Students</DialogTitle>
                                            <DialogDescription>
                                                {students.length} assigned to this bus
                                            </DialogDescription>
                                        </DialogHeader>

                                        <ScrollArea className="h-[60vh] pr-4">
                                            <div className="space-y-3">
                                                {students.length === 0 ? (
                                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                                        No students assigned.
                                                    </div>
                                                ) : (
                                                    students.map((student, index) => {
                                                        const name = student.name ?? `Student ${index + 1}`;
                                                        const id = student.studentId ?? "--";
                                                        const lat = student.pickupLocation?.lat;
                                                        const lng = student.pickupLocation?.lng;
                                                        const hasPickup = typeof lat === "number" && typeof lng === "number";

                                                        return (
                                                            <div
                                                                key={student.studentId ?? `${name}-${index}`}
                                                                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3"
                                                            >
                                                                <div className="flex items-center gap-3 min-w-0">
                                                                    <div className="size-11 shrink-0 overflow-hidden rounded-xl bg-slate-100 ring-2 ring-blue-100">
                                                                        {student.photo ? (
                                                                            <img
                                                                                src={student.photo}
                                                                                alt={name}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : (
                                                                            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                                                                                {name[0]?.toUpperCase() ?? "S"}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                                            {name}
                                                                        </p>
                                                                        <p className="mt-0.5 text-xs text-slate-500">{id}</p>
                                                                    </div>
                                                                </div>

                                                                <div className="shrink-0 text-right">
                                                                    <p className="text-xs font-medium text-slate-500">Pickup</p>
                                                                    <p className="mt-0.5 text-xs font-mono text-slate-800">
                                                                        {hasPickup
                                                                            ? `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`
                                                                            : "Not set"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        </ScrollArea>

                                        <div className="flex justify-end gap-2">
                                            <DialogClose asChild>
                                                <button className="rounded-lg border cursor-pointer border-slate-500 hover:text-slate-50  bg-white px-8 py-2 text-sm font-medium text-slate-700 hover:bg-red-500">
                                                    Close
                                                </button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            }
                        />
                        <div className="px-4 pb-1">
                            {/* Progress bar */}
                            <div className="flex items-end justify-between mb-1.5">
                                <span className="text-3xl font-black text-gray-900 leading-none">{checked}</span>
                                <span className="text-xs text-gray-500 mb-1">of {total} pickup points</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full bg-linear-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700 shadow-sm"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-emerald-600 font-semibold mb-3">{pct}% covered</p>
                        </div>
                        <div className="px-4 pb-4">
                            <StatRow icon={UserCheck} label="Pickup Points Passed" value={checked} accent="text-emerald-600" />
                            <StatRow icon={Users} label="Total Students" value={students.length} />
                            <StatRow icon={AlertCircle} label="Pickup Points Remaining" value={remainingPickupLocations} accent="text-amber-600" />
                        </div>
                    </CardShell>

                    {/* 4. Trip Info */}
                    <CardShell>
                        <CardHeader title="Trip Details" />
                        <div className="px-4 pb-4">
                            <StatRow icon={Clock} label="Started" value={tripActive ? formatTime(tripStartedAt) : "--"} />
                            <StatRow
                                icon={Gauge}
                                label="Trip State"
                                value={tripActive ? (trackingPhase === "locating" ? "Locating" : "In progress") : "Stopped"}
                                accent={tripActive ? "text-emerald-600" : "text-gray-500"}
                            />
                            <StatRow icon={Signal} label="Trip Active" value={tripActive ? "Yes" : "No"} accent={tripActive ? "text-emerald-600" : "text-amber-600"} />
                        </div>
                    </CardShell>
                </div>
            </div>
        </div>
    );
};

export default DriverPage;