"use client";

import { useState, useEffect, JSX } from "react";
import {
    Bus,
    MapPin,
    Users,
    Wifi,
    Navigation,
    Clock,
    CheckCircle2,
    XCircle,
    Play,
    Square,
    Gauge,
    Signal,
    UserCheck,
    AlertCircle,
    ChevronRight,
    Zap,
    Calendar,
    Route,
    ShieldCheck,
    Radio,
    Loader2,
} from "lucide-react";
import BusMap from "./BusMap";
import { cn } from "@/lib/utils";
import { CardContent } from "@/components/ui/card";

// --- Type Definitions ---
interface Driver {
    name: string;
    id: string;
    bus: string;
    busModel: string;
    route: string;
    avatar: string;
}

interface Trip {
    id: string;
    date: string;
    scheduledStart: string;
    estimatedArrival: string;
    totalStudents: number;
    checkedIn: number;
    currentStop: string;
    nextStop: string;
    speed: number;
    lastUpdated: string;
}

interface StopMarker {
    top: string;
    left: string;
    label: string;
    active: boolean;
}

interface StatusItem {
    icon: React.ElementType;
    label: string;
    ok: boolean;
}

interface BadgeProps {
    children: React.ReactNode;
    color?: "green" | "red" | "blue" | "yellow" | "gray";
    className?: string;
}

interface StatRowProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    accent?: string;
}

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

interface CardHeaderProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;
}

interface MapPillProps {
    children: React.ReactNode;
    className?: string;
}

// --- Static Data ---
const DRIVER: Driver = {
    name: "Rajan Shrestha",
    id: "DRV-2041",
    bus: "KA-01-BA-4892",
    busModel: "Tata Starbus 2023",
    route: "Route 7 — Lalitpur North",
    avatar: "RS",
};

interface TripControlCardProps {
    tripActive: boolean
    loading: boolean
    onToggle: () => void
    trip: { id: string | number; scheduledStart: string }
}

const TRIP: Trip = {
    id: "TRP-20419",
    date: "May 7, 2026",
    scheduledStart: "06:30 AM",
    estimatedArrival: "07:45 AM",
    totalStudents: 42,
    checkedIn: 38,
    currentStop: "Patan Dhoka",
    nextStop: "Jawalakhel",
    speed: 34,
    lastUpdated: "Just now",
};

// --- Animated GPS dot ---
function GpsDot(): JSX.Element {
    return (
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
    );
}

// --- Badge ---
function Badge({ children, color = "gray", className = "" }: BadgeProps): JSX.Element {
    const colors: Record<string, string> = {
        green: "bg-emerald-100 text-emerald-800 border border-emerald-200",
        red: "bg-red-100 text-red-800 border border-red-200",
        blue: "bg-blue-100 text-blue-800 border border-blue-200",
        yellow: "bg-amber-100 text-amber-800 border border-amber-200",
        gray: "bg-gray-100 text-gray-700 border border-gray-200",
    };
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${colors[color]} ${className}`}>
            {children}
        </span>
    );
}

// --- Stat Row ---
function StatRow({ icon: Icon, label, value, accent }: StatRowProps): JSX.Element {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-0">
            <div className="flex items-center gap-2.5 text-gray-600">
                <Icon size={14} />
                <span className="text-xs font-medium">{label}</span>
            </div>
            <span className={`text-xs font-bold ${accent || "text-gray-900"}`}>{value}</span>
        </div>
    );
}

// --- Section Card ---
function Card({ children, className = "" }: CardProps): JSX.Element {
    return (
        <div className={`bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg ${className}`}>
            {children}
        </div>
    );
}

function CardHeader({ title, subtitle, action }: CardHeaderProps): JSX.Element {
    return (
        <div className="flex items-start justify-between px-4 pt-4 pb-2">
            <div>
                <h3 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h3>
                {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

// --- Map Overlay Pill ---
function MapPill({ children, className = "" }: MapPillProps): JSX.Element {
    return (
        <div className={`flex items-center gap-2 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-lg ${className}`}>
            {children}
        </div>
    );
}

// --- Main Dashboard ---
export default function DriverDashboard(): JSX.Element {
    const [tripActive, setTripActive] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [time, setTime] = useState<Date>(new Date());

    useEffect(() => {
        const interval = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(interval);
    }, []);

    const handleTripToggle = (): void => {
        setLoading(true);
        setTimeout(() => {
            setTripActive((prev) => !prev);
            setLoading(false);
        }, 1200);
    };

    const checked: number = TRIP.checkedIn;
    const total: number = TRIP.totalStudents;
    const pct: number = Math.round((checked / total) * 100);

    const stopMarkers: StopMarker[] = [
        { top: "30%", left: "32%", label: "Patan Dhoka", active: true },
        { top: "62%", left: "64%", label: "Jawalakhel", active: false },
        { top: "20%", left: "55%", label: "Mangal Bazar", active: false },
    ];

    const statusItems: StatusItem[] = [
        { icon: Navigation, label: "GPS Signal", ok: true },
        { icon: Wifi, label: "Internet", ok: true },
        { icon: Radio, label: "Driver Online", ok: true },
        { icon: Signal, label: "Trip Active", ok: tripActive },
        { icon: Zap, label: "Vehicle Power", ok: true },
    ];

    return (
        <div
            className="min-h-screen bg-gray-50 text-gray-900"
            style={{ fontFamily: "'DM Sans', 'Geist', sans-serif" }}
        >
            {/* Top Bar */}
            <header className="flex items-center justify-between px-5 py-5 border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Bus size={16} className="text-white" />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-gray-900 leading-none">Bus Tracker</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">School Transport System</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge color="green">
                        <GpsDot />
                        GPS Active
                    </Badge>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold shadow text-white">
                        {DRIVER.avatar}
                    </div>
                </div>
            </header>

            {/* Main Layout */}
            <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-68px)]">
                {/* ── LEFT: Map ── */}
                <div className="flex-1 min-h-[55vw] lg:min-h-0 relative flex flex-col p-4 gap-4">
                    {/* Route breadcrumb */}
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Route size={12} className="text-blue-600" />
                        <span className="text-gray-500">Active Route</span>
                        <ChevronRight size={12} />
                        <span className="text-gray-900 font-semibold">{DRIVER.route}</span>
                        {tripActive && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-emerald-600 font-semibold">Trip #{TRIP.id}</span>
                            </>
                        )}
                    </div>

                    {/* Map Card */}
                    <Card className="relative z-0 flex-1 overflow-hidden !rounded-3xl group">
                        {/* Map image placeholder — swap with actual map component */}


                        <BusMap busId={1} />

                        {/* Overlays */}
                        <div className="absolute z-[1000] top-4 left-4 flex flex-col gap-2 z-10">
                            <MapPill>
                                <GpsDot />
                                Live GPS Active
                            </MapPill>
                            <MapPill className={tripActive ? "border-emerald-300/50" : "border-amber-300/50"}>
                                <span className={`w-2 h-2 rounded-full ${tripActive ? "bg-emerald-500" : "bg-amber-500"}`} />
                                {tripActive ? "Bus Moving — 34 km/h" : "Bus Stopped"}
                            </MapPill>
                        </div>

                        <div className="absolute top-4 right-4 z-[1000]">
                            <MapPill>
                                <Clock size={11} className="text-blue-600" />
                                {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                            </MapPill>
                        </div>

                    </Card>
                </div>

                {/* ── RIGHT PANEL ── */}
                <div className="w-full lg:w-[300px] xl:w-[400px] flex-shrink-0 flex flex-col mt-8 gap-3 p-4 pt-0 lg:pt-4 lg:pl-0 overflow-y-auto">
                    {/* 1. Trip Control */}
                    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70">
                        {/* Header */}
                        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-4 dark:border-slate-800">
                            <div className="flex flex-col gap-0.5">
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Trip control</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    {tripActive ? `Trip #${TRIP.id} · Active` : "No active trip"}
                                </p>
                            </div>

                            <Badge
                                // variant="outline"
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                                    tripActive
                                        ? "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                                        : "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                                )}
                            >
                                <span
                                    className={cn(
                                        "size-1.5 rounded-full",
                                        tripActive
                                            ? "animate-pulse bg-green-500"
                                            : "bg-slate-400 dark:bg-slate-500"
                                    )}
                                />
                                {tripActive ? "Active" : "Standby"}
                            </Badge>
                        </div>

                        {/* Body */}
                        <CardContent className="px-4 pb-4 pt-3.5">
                            <button
                                onClick={handleTripToggle}
                                disabled={loading}
                                className={cn(
                                    "flex w-full items-center justify-center gap-2 rounded-[10px] py-2 text-[13px] font-medium tracking-[0.01em] transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
                                    tripActive
                                        ? "border border-red-100 bg-red-50 text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900"
                                        : "bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                )}
                            >
                                {loading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : tripActive ? (
                                    <Square size={14} fill="currentColor" />
                                ) : (
                                    <Play size={14} fill="currentColor" />
                                )}
                                {loading ? "Processing…" : tripActive ? "Stop trip" : "Start trip"}
                            </button>

                            {tripActive && !loading && (
                                <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                                    <Clock size={11} />
                                    <span>Started at {TRIP.scheduledStart} · Trip #{TRIP.id}</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    {/* 2. Driver & Bus Info */}
                    <Card className="overflow-hidden border-slate-200/80 bg-white shadow-sm dark:border-slate-800/80 dark:bg-slate-900/70">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 dark:border-slate-800">
                            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
                                Driver &amp; bus
                            </p>
                        </div>

                        {/* Driver row */}
                        <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] border border-indigo-100 bg-indigo-50 text-sm font-medium text-indigo-600 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-400">
                                {DRIVER.avatar}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-[13px] font-medium text-slate-800 dark:text-slate-100">
                                    {DRIVER.name}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                    {DRIVER.id}
                                </p>
                            </div>
                            <span className="flex shrink-0 items-center gap-1 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
                                <ShieldCheck size={11} />
                                Verified
                            </span>
                        </div>

                        {/* Bus row */}
                        <div className="mx-3 mb-3 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="flex size-[34px] shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-400">
                                <Bus size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-800 dark:text-slate-100">
                                    {DRIVER.bus}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
                                    {DRIVER.busModel}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* 3. Student Stats */}
                    <Card>
                        <CardHeader
                            title="Students"
                            subtitle={TRIP.date}
                            action={
                                <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                    <Calendar size={10} />
                                    {TRIP.date}
                                </div>
                            }
                        />
                        <div className="px-4 pb-1">
                            {/* Progress bar */}
                            <div className="flex items-end justify-between mb-1.5">
                                <span className="text-3xl font-black text-gray-900 leading-none">{checked}</span>
                                <span className="text-xs text-gray-500 mb-1">of {total} students</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full transition-all duration-700 shadow-sm"
                                    style={{ width: `${pct}%` }}
                                />
                            </div>
                            <p className="text-[11px] text-emerald-600 font-semibold mb-3">{pct}% checked in</p>
                        </div>
                        <div className="px-4 pb-4">
                            <StatRow icon={UserCheck} label="Checked In" value={checked} accent="text-emerald-600" />
                            <StatRow icon={Users} label="Total Students" value={total} />
                            <StatRow icon={AlertCircle} label="Not Boarded" value={total - checked} accent="text-amber-600" />
                        </div>
                    </Card>

                    {/* 4. Trip Info */}
                    <Card>
                        <CardHeader title="Trip Details" />
                        <div className="px-4 pb-4">
                            <StatRow icon={Route} label="Route" value={DRIVER.route.split("—")[1]?.trim() || DRIVER.route} />
                            <StatRow icon={Clock} label="Scheduled Start" value={TRIP.scheduledStart} />
                            <StatRow icon={MapPin} label="ETA" value={TRIP.estimatedArrival} accent="text-blue-600" />
                            <StatRow
                                icon={Gauge}
                                label="Current Speed"
                                value={tripActive ? `${TRIP.speed} km/h` : "0 km/h"}
                                accent={tripActive ? "text-emerald-600" : "text-gray-500"}
                            />
                        </div>
                    </Card>

                </div>
            </div>
        </div>
    );
}