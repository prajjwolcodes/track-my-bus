"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { db } from "@/firebase/firebase";
import { BusLocationPayload, listenBusLocation } from "@/firebase/rtdb";
import { haversineDistanceMeters } from "@/lib/haversine";
import { cn } from "@/lib/utils";
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore";
import type { DivIcon, Icon, Marker as LeafletMarker, Map } from "leaflet";
import {
    BusFrontIcon,
    ChevronRight,
    Clock,
    LocateFixed,
    Mail,
    MapPin,
    PhoneCall,
    RulerDimensionLine,
    Signal,
    Users
} from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type JSX, type ReactNode } from "react";
import { toast } from "sonner";
import ReactDOMServer from "react-dom/server";

const ENABLE_BUS_TOWARD_PICKUP_TEST = true;
const SIMULATION_STEP_METERS = 60; // Increased for faster movement
const SIMULATION_INTERVAL_MS = 500; // Reduced from 1000ms for faster updates

const ParentMapClient = dynamic(() => import("./ParentMapClient"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100" />,
});

function getInitials(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "S";
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

function GpsDot(): JSX.Element {
    return (
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
    );
}

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
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold tracking-wide",
                className
            )}
        >
            {children}
        </span>
    );
}

function CardShell({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
    return (
        <div className={cn("overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg", className)}>
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
        <div className="flex items-start justify-between px-4 pb-2 pt-4">
            <div>
                <h3 className="tracking-tight text-sm font-bold text-gray-900">{title}</h3>
                {subtitle ? <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p> : null}
            </div>
            {action}
        </div>
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
        <div className="flex items-center justify-between border-b border-gray-100 py-2.5 last:border-0">
            <div className="flex items-center gap-2.5 text-gray-600">
                <IconComponent size={14} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className={cn("text-xs font-bold", accent || "text-gray-900")}>{value}</span>
        </div>
    );
}

function MapPill({ children, className = "" }: { children: ReactNode; className?: string }): JSX.Element {
    return (
        <div
            className={cn(
                "flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg backdrop-blur-md",
                className
            )}
        >
            {children}
        </div>
    );
}

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
    const [now, setNow] = useState<number | null>(null);
    const [currentDistanceMeters, setCurrentDistanceMeters] = useState<number | null>(null);
    const [markerIcon, setMarkerIcon] = useState<Icon<any> | DivIcon | null>(null);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [tripStartedAt, setTripStartedAt] = useState<Date | null>(null);
    const [busInfo, setBusInfo] = useState<{
        busId?: string;
        name?: string;
        busNo?: string | number | null;
        plateNo?: string | null;
        routeNo?: string | number | null;
        driverId?: string | null;
        students?: unknown;
    } | null>(null);
    const [driverInfo, setDriverInfo] = useState<{
        driverId?: string;
        name?: string;
        phone?: string | null;
        photo?: string | null;
        busId?: string | null;
        routeNo?: string | number | null;
    } | null>(null);
    const [busInfoLoading, setBusInfoLoading] = useState(false);
    const mapRef = useRef<Map | null>(null);
    const markerRef = useRef<LeafletMarker | null>(null);
    const prevPositionRef = useRef<{ lat: number; lng: number } | null>(null);
    const prevTripActiveRef = useRef<boolean | null>(null);
    const hasNearbyToastTriggeredRef = useRef(false);
    const hasRecenteredOnTripStartRef = useRef(false);
    const hasRecenteredOnInitialLoadRef = useRef(false);
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

    const studentName = user?.name ?? "Student";
    const studentId = user?.studentId ?? user?.uid ?? "";
    const studentAvatar = useMemo(() => getInitials(studentName), [studentName]);
    const studentPhotoUrl = user?.photoURL ?? (user as any)?.photo ?? null;
    const studentEmail = user?.email ?? null;

    const assignedBusLabel = useMemo(() => {
        if (busId === null || busId === undefined || String(busId).trim().length === 0) return "Not assigned";
        return String(busId);
    }, [busId]);

    const busStudentsCount = useMemo(() => {
        const students = busInfo?.students;
        return Array.isArray(students) ? students.length : 0;
    }, [busInfo?.students]);

    const driverName = driverInfo?.name?.trim?.() ? driverInfo.name : "Driver";
    const driverAvatar = useMemo(() => getInitials(driverName), [driverName]);
    const driverPhotoUrl = driverInfo?.photo ?? null;
    const driverPhoneRaw = driverInfo?.phone ?? null;
    const driverPhoneHref = useMemo(() => {
        if (!driverPhoneRaw) return null;
        const cleaned = driverPhoneRaw.replace(/[^\d+]/g, "");
        return cleaned.length > 0 ? cleaned : null;
    }, [driverPhoneRaw]);

    const busNumberLabel = useMemo(() => {
        const busNo = busInfo?.busNo;
        if (busNo !== undefined && busNo !== null && String(busNo).trim().length > 0) {
            return String(busNo);
        }
        return assignedBusLabel;        
    }, [assignedBusLabel, busInfo?.busNo]);

    useEffect(() => {
        setMapMounted(true);
    }, []);

    useEffect(() => {
        import("leaflet").then((L) => {
            const svgString = ReactDOMServer.renderToString(
                <BusFrontIcon size={26} />

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
        if (!busId) {
            setLocationLoading(false);
            setPosition(null);
            setSimulatedPosition(null);
            setTripStartedAt(null);
            return;
        }

        setLocationLoading(true);

        const unsubscribe = listenBusLocation(busId, (data) => {
            setPosition(data);
            setLocationLoading(false);

            const nextActive = data?.tripActive === true;
            const prevActive = prevTripActiveRef.current;

            if (nextActive) {
                const statusUpdatedAt = (data as (typeof data & { statusUpdatedAt?: unknown }))?.statusUpdatedAt;
                if (typeof statusUpdatedAt === "number" && Number.isFinite(statusUpdatedAt)) {
                    setTripStartedAt(new Date(statusUpdatedAt));
                } else if (typeof data?.timestamp === "number" && Number.isFinite(data.timestamp)) {
                    setTripStartedAt(new Date(data.timestamp));
                }
            } else {
                setTripStartedAt(null);
            }


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

    function formatTime(value: Date | null) {
        if (!value) return "--";
        return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    useEffect(() => {
        let cancelled = false;

        async function loadBusAndDriver() {
            if (!busId) {
                setBusInfo(null);
                setDriverInfo(null);
                return;
            }

            setBusInfoLoading(true);
            try {
                const busSnap = await getDoc(doc(db, "buses", String(busId)));
                if (cancelled) return;

                const nextBus = busSnap.exists() ? (busSnap.data() as typeof busInfo) : null;
                setBusInfo(nextBus);

                const nextDriverId = (nextBus as any)?.driverId;
                if (!nextDriverId) {
                    setDriverInfo(null);
                    return;
                }

                const driverSnap = await getDoc(doc(db, "drivers", String(nextDriverId)));
                if (cancelled) return;
                setDriverInfo(driverSnap.exists() ? (driverSnap.data() as typeof driverInfo) : null);
            } catch {
                if (!cancelled) {
                    setBusInfo(null);
                    setDriverInfo(null);
                }
            } finally {
                if (!cancelled) setBusInfoLoading(false);
            }
        }

        loadBusAndDriver();
        return () => {
            cancelled = true;
        };
    }, [busId]);

    useEffect(() => {
        hasNearbyToastTriggeredRef.current = false;
        hasRecenteredOnInitialLoadRef.current = false;
        setSimulatedPosition(null);
        setCurrentDistanceMeters(null);
    }, [user?.uid]);

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
        }, SIMULATION_INTERVAL_MS);

        return () => window.clearInterval(interval);
    }, [displayIsTripActive, pickupCoordinates]);

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
        // Avoid hydration mismatches: don't render real-time values during SSR.
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (user?.role !== "parent") return;

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
    }, [displayPosition, displayHasLocation, displayIsTripActive, pickupCoordinates, user?.role]);

    const getLastUpdatedLabel = (timestamp: number) => {
        if (now === null) return "—";
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

    useEffect(() => {
        if (!displayIsTripActive || !displayHasLocation || !mapRef.current) return;

        if (!hasRecenteredOnTripStartRef.current) {
            mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
                animate: true,
                duration: 0.8,
            });
            hasRecenteredOnTripStartRef.current = true;
        }
    }, [displayIsTripActive]);

    useEffect(() => {
        if (!displayIsTripActive) {
            hasRecenteredOnTripStartRef.current = false;
        }
    }, [displayIsTripActive]);

    useEffect(() => {
        if (!displayHasLocation || !mapRef.current) return;

        if (!hasRecenteredOnInitialLoadRef.current) {
            mapRef.current.flyTo([displayPosition.lat, displayPosition.lng], 16, {
                animate: true,
                duration: 0.8,
            });
            hasRecenteredOnInitialLoadRef.current = true;
        }
    }, [displayHasLocation]);

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
        <div className="min-h-screen bg-gray-50 text-gray-900" style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}>
            {/* Top Bar */}
            <header className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/95 px-5 py-5 shadow-sm backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl">
                        <BusFrontIcon size={24} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold leading-none text-gray-900">Bus Tracker</p>
                        <p className="mt-0.5 text-[10px] text-gray-500">Parent dashboard</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-800">
                        <GpsDot />
                        {displayIsTripActive ? "Live" : "Standby"}
                    </span>

                    <Popover open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
                        <PopoverTrigger asChild>
                            <button
                                type="button"
                                aria-label="Open profile menu"
                                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                            >
                                {studentPhotoUrl ? (
                                    <img
                                        src={studentPhotoUrl}
                                        alt="Student"
                                        className="h-full w-full rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                        {studentAvatar}
                                    </div>
                                )}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent align="start" side="bottom" sideOffset={8} className="w-60 p-2">
                            <button
                                type="button"
                                onClick={() => {
                                    setProfileMenuOpen(false);
                                    setDetailsOpen(true);
                                }}
                                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-800 hover:bg-slate-50"
                            >
                                <span>Details</span>
                                <ChevronRight size={16} className="text-slate-500" />
                            </button>
                            <div className="my-2 h-px bg-slate-200" />
                            <LogoutButton
                                onBeforeLogout={async () => {
                                    setProfileMenuOpen(false);
                                    await handleBeforeLogout();
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </header>

            {/* Student details dialog */}
            <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-xl">
                    <DialogHeader>
                        <DialogTitle>Student details</DialogTitle>
                        <DialogDescription>
                            Profile and tracking information
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
                        <div className="size-24 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-2 ring-blue-100">
                            {studentPhotoUrl ? (
                                <img src={studentPhotoUrl} alt={studentName} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-2xl font-bold text-white">
                                    {studentAvatar}
                                </div>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{studentName}</p>
                            <p className="mt-1 wrap-break-word text-sm text-slate-500">Bus {assignedBusLabel}</p>
                            <p className="mt-0.5 text-xs text-slate-500">Student ID: {studentId || "--"}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Email</p>
                            <p className="mt-1 flex items-start gap-2 break-all text-sm font-medium text-slate-800">
                                <Mail size={14} className="mt-0.5 shrink-0 text-slate-500" />
                                {studentEmail ?? "--"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Pickup</p>
                            <p className="mt-1 flex items-start gap-2 text-sm font-medium text-slate-800">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-slate-500" />
                                {pickupCoordinates
                                    ? `${pickupCoordinates.lat.toFixed(5)}, ${pickupCoordinates.lng.toFixed(5)}`
                                    : "--"}
                            </p>
                            {pickupLocation?.address ? (
                                <p className="mt-1 text-xs text-slate-500">{pickupLocation.address}</p>
                            ) : null}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Distance to home</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {typeof currentDistanceMeters === "number" ? `${Math.round(currentDistanceMeters)} m` : "--"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Tracking</p>
                            <p className="mt-1 text-sm font-medium text-slate-800">
                                {displayIsTripActive ? "Live" : "Not started"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Driver</p>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="size-11 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
                                    {driverPhotoUrl ? (
                                        <img
                                            src={driverPhotoUrl}
                                            alt={driverName}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold text-white">
                                            {driverAvatar}
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900">{driverInfo ? driverName : "--"}</p>
                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">{driverPhoneRaw ?? "No phone"}</p>
                                </div>

                                {driverPhoneHref ? (
                                    <a
                                        href={`tel:${driverPhoneHref}`}
                                        aria-label="Call driver"
                                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100"
                                    >
                                        <PhoneCall className="size-5" />
                                    </a>
                                ) : (
                                    <div
                                        aria-hidden="true"
                                        className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-300"
                                    >
                                        <PhoneCall className="size-5" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                            <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500">Bus</p>
                            <div className="mt-2 space-y-1.5 text-sm text-slate-800">
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600">Bus number</span>
                                    <span className="text-xs font-semibold text-slate-900">{busInfoLoading ? "Loading…" : busNumberLabel}</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600">
                                        <Users className="size-4 text-slate-500" />
                                        Students
                                    </span>
                                    <span className="text-xs font-semibold text-slate-900">{busInfo ? busStudentsCount : "--"}</span>
                                </div>
                                {busInfo?.plateNo ? (
                                    <p className="text-[11px] text-slate-500">Plate: {busInfo.plateNo}</p>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <DialogFooter showCloseButton />
                </DialogContent>
            </Dialog>

            {/* Main Layout */}
            <div className="flex h-[calc(100vh-68px)] flex-col gap-0 lg:flex-row">
                {/* LEFT: Map */}
                <div className="relative flex min-h-[120vw] flex-1 flex-col gap-4 p-4 lg:min-h-0">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <MapPin size={12} className="text-blue-600" />
                        <span className="text-gray-500">Tracking</span>
                        <ChevronRight size={12} />
                        <span className="font-semibold text-gray-900">Bus {assignedBusLabel}</span>
                    </div>

                    <CardShell className="group relative z-0 h-full flex-1 overflow-hidden rounded-3xl!">
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

                        {/* Map overlays */}
                        <div className="absolute left-4 top-3 z-1000 flex flex-col gap-2">
                            <MapPill>
                                <GpsDot />
                                {displayIsTripActive ? "Live Tracking" : "Tracking Paused"}
                            </MapPill>
                            <MapPill className={displayIsTripActive ? "border-emerald-300/50" : "border-amber-300/50"}>
                                <span
                                    className={cn(
                                        "h-2 w-2 rounded-full",
                                        displayIsTripActive ? "animate-pulse bg-emerald-500" : "bg-amber-500"
                                    )}
                                />
                                {displayIsTripActive ? "Bus Moving" : "Bus Stopped"}
                            </MapPill>
                        </div>

                        <div className="absolute right-4 top-4 z-1000">
                            <MapPill>
                                <Clock size={11} className="text-blue-600" />
                                {now === null
                                    ? "—"
                                    : new Date(now).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                        second: "2-digit",
                                    })}
                            </MapPill>
                        </div>

                        {/* Recenter button */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                recenterMap();
                            }}
                            disabled={!displayHasLocation}
                            aria-label="Recenter map"
                            className={cn(
                                "absolute bottom-8 right-4 z-1000 inline-flex size-11 items-center justify-center rounded-full border bg-white/95 shadow-lg backdrop-blur transition active:scale-[0.98]",
                                displayHasLocation
                                    ? "border-gray-200 text-blue-700 hover:bg-white"
                                    : "cursor-not-allowed border-gray-200 text-gray-300 opacity-70"
                            )}
                        >
                            <LocateFixed className="size-6" />
                        </button>
                    </CardShell>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-full shrink-0 flex-col gap-3 overflow-y-auto p-4 pt-0 sm:mt-8 lg:w-75 lg:pt-4 lg:pl-0 xl:w-100">
                    {/* Student card */}
                    <CardShell className="border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">Student</p>
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <button
                                type="button"
                                aria-label="Open details"
                                onClick={() => setDetailsOpen(true)}
                                className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600 outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2"
                            >
                                {studentPhotoUrl ? (
                                    <img src={studentPhotoUrl} alt={studentName} className="h-full w-full rounded-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                        {studentAvatar}
                                    </div>
                                )}
                            </button>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{studentName}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-500">{studentId}</p>
                            </div>

                            <span className="flex shrink-0 items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-medium text-blue-800 sm:px-2.5 sm:text-[11px]">
                                {displayIsTripActive ? "Live" : "Standby"}
                            </span>
                        </div>

                        <div className="mx-3 mb-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-800">Assigned bus</p>
                                <p className="text-xs font-semibold text-slate-900">{authLoading ? "Loading…" : assignedBusLabel}</p>
                            </div>
                            {!authLoading && !busId ? (
                                <p className="mt-1 text-[11px] text-amber-700">No bus assigned to this account.</p>
                            ) : null}
                        </div>
                    </CardShell>

                    {/* Driver card */}
                    <CardShell className="border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">Driver</p>
                            {driverPhoneHref ? (
                                <a
                                    href={`tel:${driverPhoneHref}`}
                                    className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <PhoneCall className="size-4" />
                                    Call
                                </a>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3 px-4 py-3">
                            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                                {driverPhotoUrl ? (
                                    <img src={driverPhotoUrl} alt={driverName} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold text-white">
                                        {driverAvatar}
                                    </div>
                                )}
                            </div>

                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium text-slate-800">{driverInfo ? driverName : authLoading ? "Loading…" : "--"}</p>
                                <p className="mt-0.5 truncate text-[11px] text-slate-500">{driverPhoneRaw ?? "No phone"}</p>
                            </div>

                            <span className="flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                Bus {busNumberLabel}
                            </span>
                        </div>
                    </CardShell>

                    {/* Bus card */}
                    <CardShell className="border border-slate-200/80 bg-white shadow-sm">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">Bus</p>

                        </div>

                        <div className="space-y-2 px-4 py-3">
                            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                <span className="text-xs font-medium text-slate-600">Bus number</span>
                                <span className="text-xs font-semibold text-slate-900">{busInfoLoading ? "Loading…" : busNumberLabel}</span>
                            </div>
                            {busInfo?.plateNo ? (
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600">Plate</span>
                                    <span className="text-xs font-semibold text-slate-900">{busInfo.plateNo}</span>
                                </div>
                            ) : null}
                            {busInfo?.routeNo !== undefined && busInfo?.routeNo !== null && String(busInfo.routeNo).trim().length > 0 ? (
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600">Route</span>
                                    <span className="text-xs font-semibold text-slate-900">{String(busInfo.routeNo)}</span>
                                </div>
                            ) : null}
                            {busInfo && busStudentsCount ? (
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                                    <span className="text-xs font-medium text-slate-600">Total Students</span>
                                    <span className="text-xs font-semibold text-slate-900">{busInfo ? `${busStudentsCount}` : "--"}</span>

                                </div>
                            ) : null}
                        </div>
                    </CardShell>

                    {/* Trip / location status */}
                    <CardShell className="border-slate-200/80 bg-white shadow-sm">
                        <CardHeader
                            title="Trip Details"
                            subtitle={displayIsTripActive ? "Live location is updating" : "Waiting for driver to start"}

                            action={
                                <PillBadge
                                    className={cn(
                                        "rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                                        displayIsTripActive
                                            ? "border-green-200 bg-green-50 text-green-800"
                                            : "border-slate-200 bg-slate-100 text-slate-500"
                                    )}
                                >
                                    <span
                                        className={cn(
                                            "size-1.5 rounded-full",
                                            displayIsTripActive ? "animate-pulse bg-green-500" : "bg-slate-400"
                                        )}
                                    />
                                    {displayIsTripActive ? "Active" : "Standby"}
                                </PillBadge>
                            }
                        />


                        <div className="px-4 pb-4">
                            {locationLoading ? (
                                <p className="text-sm text-slate-600">Loading location…</p>
                            ) : displayHasLocation ? (
                                <div className="px-4 pb-4">

                                    <StatRow
                                        icon={MapPin}
                                        label="Bus Coords"
                                        value={displayIsTripActive ? `${displayPosition?.lat.toFixed(5)}, ${displayPosition?.lng.toFixed(5)}` : "--"}
                                    />

                                    <StatRow
                                        icon={RulerDimensionLine}
                                        label="Distance to home"
                                        value={displayIsTripActive ? (typeof currentDistanceMeters === "number" ? `${Math.round(currentDistanceMeters)} m` : "--") : "--"}
                                    />
                                    <StatRow
                                        icon={Clock}
                                        label="Started"
                                        value={displayIsTripActive ? formatTime(tripStartedAt) : "--"}
                                    />
                                    <StatRow
                                        icon={Signal}
                                        label="Trip State"
                                        value={
                                            displayIsTripActive
                                                ? locationLoading
                                                    ? "Locating"
                                                    : displayHasLocation
                                                        ? "In progress"
                                                        : "Locating"
                                                : "Stopped"
                                        }
                                        accent={displayIsTripActive ? "text-emerald-600" : "text-gray-500"}
                                    />
                                    <StatRow
                                        icon={Users}
                                        label="Trip Active"
                                        value={displayIsTripActive ? "Yes" : "No"}
                                        accent={displayIsTripActive ? "text-emerald-600" : "text-amber-600"}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-slate-600">No location available yet.</p>
                            )}
                        </div>
                    </CardShell>

                </div>
            </div>
        </div>
    );
};

export default ParentPage;