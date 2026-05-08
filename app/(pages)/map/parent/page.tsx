"use client";

import { useState, useEffect, ReactNode, JSX } from "react";
import {
    MapPin,
    Phone,
    MessageSquare,
    Bus,
    User,
    Clock,
    Navigation,
    Wifi,
    CheckCircle2,
    AlertCircle,
    Gauge,
    Shield,
    Star,
    Radio,
    BellRing,
    LocateFixed,
    Milestone,
} from "lucide-react";
import BusMap from "../BusMap";

// ─── Types ────────────────────────────────────────────────────────────────────

type DriverStatus = "online" | "offline";

interface Driver {
    name: string;
    phone: string;
    avatar: string;
    rating: number;
    experience: string;
    status: DriverStatus;
}

interface BusInfo {
    name: string;
    number: string;
    capacity: number;
    currentPassengers: number;
}

type TripStatus =
    | "Bus Not Started Yet"
    | "In Transit"
    | "Boarded"
    | "Arrived at School"
    | "Trip Completed";

interface Trip {
    status: TripStatus;
    childBoarded: boolean;
    eta: string;
    etaMinutes: number;
    distanceRemaining: string;
    distanceToPickup: string;
    speed: number;
    lastUpdate: string;
    nextStop: string;
}

interface Child {
    name: string;
    grade: string;
    boardedAt: string;
}

interface StaticData {
    driver: Driver;
    bus: BusInfo;
    trip: Trip;
    child: Child;
}

interface StatusConfigEntry {
    color: string;
    dot: string;
    bar: string;
    icon: ReactNode;
    cardBorder: string;
    gradient: string;
}


interface StatItem {
    icon: ReactNode;
    label: string;
    value: string;
    sub: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const STATIC: StaticData = {
    driver: {
        name: "Ramesh Kumar Shrestha",
        phone: "+977-9841-234567",
        avatar: "https://i.pravatar.cc/150?img=57",
        rating: 4.8,
        experience: "6 yrs",
        status: "online",
    },
    bus: {
        name: "Sunrise School Bus",
        number: "BA 2 KHA 3456",
        capacity: 35,
        currentPassengers: 22,
    },
    trip: {
        status: "In Transit",
        childBoarded: true,
        eta: "08:42 AM",
        etaMinutes: 12,
        distanceRemaining: "4.2 km",
        distanceToPickup: "0 km",
        speed: 28,
        lastUpdate: "Just now",
        nextStop: "Balaju Chowk",
    },
    child: {
        name: "Aarav Shrestha",
        grade: "Grade 5",
        boardedAt: "07:55 AM",
    },
};

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TripStatus, StatusConfigEntry> = {
    "Bus Not Started Yet": {
        color: "bg-zinc-100 text-zinc-600 border-zinc-200",
        dot: "bg-zinc-400",
        bar: "bg-zinc-300",
        icon: <Bus size={14} />,
        cardBorder: "border-zinc-200",
        gradient: "from-zinc-50 to-white",
    },
    "In Transit": {
        color: "bg-sky-100 text-sky-700 border-sky-200",
        dot: "bg-sky-500 animate-pulse",
        bar: "bg-sky-400",
        icon: <Navigation size={14} />,
        cardBorder: "border-sky-200",
        gradient: "from-sky-50 to-white",
    },
    Boarded: {
        color: "bg-emerald-100 text-emerald-700 border-emerald-200",
        dot: "bg-emerald-500",
        bar: "bg-emerald-400",
        icon: <CheckCircle2 size={14} />,
        cardBorder: "border-emerald-200",
        gradient: "from-emerald-50 to-white",
    },
    "Arrived at School": {
        color: "bg-violet-100 text-violet-700 border-violet-200",
        dot: "bg-violet-500",
        bar: "bg-violet-400",
        icon: <Shield size={14} />,
        cardBorder: "border-violet-200",
        gradient: "from-violet-50 to-white",
    },
    "Trip Completed": {
        color: "bg-gray-100 text-gray-600 border-gray-200",
        dot: "bg-gray-400",
        bar: "bg-gray-300",
        icon: <CheckCircle2 size={14} />,
        cardBorder: "border-gray-200",
        gradient: "from-gray-50 to-white",
    },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function GpsBadge(): JSX.Element {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            GPS Active
        </span>
    );
}

interface MapSectionProps {
    trip: Trip;
}

function MapSection({ trip }: MapSectionProps): JSX.Element {
    const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>): void => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
    };

    return (
        <div className="relative w-full z-0 h-full min-h-[340px] md:min-h-[420px] lg:min-h-0 lg:h-full rounded-2xl overflow-hidden shadow-xl border border-white/60 bg-slate-100">
            {/* Map image (hidden on error; fallback shows underneath) */}
            <BusMap busId={1} />

            {/* Top bar overlay */}
            <div className="absolute z-1000 top-0 left-0 right-0 p-4 flex items-start justify-between pointer-events-none">
                <div className="flex flex-col gap-2">
                    <GpsBadge />
                    <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/80">
                        <Radio size={12} className="text-sky-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-700">
                            Live Tracking
                        </span>
                    </div>
                </div>
                <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-white/80 px-3 py-2 text-right">
                    <p className="text-[10px] text-slate-400 font-medium">Last update</p>
                    <p className="text-xs font-bold text-slate-700">{trip.lastUpdate}</p>
                </div>
            </div>

            {/* Bottom ETA bar */}
            {/* <div className="absolute bottom-0 left-0 right-0 p-3 z-1000">
                <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-white/80 p-3 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-sky-500 flex items-center justify-center shrink-0">
                        <Navigation size={16} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400 font-medium">
                            Bus is heading to
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate">
                            Sunrise Public School, Baneshwor
                        </p>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-xs text-slate-400">ETA</p>
                        <p className="text-base font-black text-sky-600">{trip.eta}</p>
                    </div>
                </div>
            </div> */}
        </div>
    );
}

interface StatusBadgeProps {
    status: TripStatus;
}

function StatusBadge({ status }: StatusBadgeProps): JSX.Element {
    const cfg: StatusConfigEntry =
        STATUS_CONFIG[status] ?? STATUS_CONFIG["In Transit"];
    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${cfg.color}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.icon}
            {status}
        </span>
    );
}

interface TripStatusCardProps {
    trip: Trip;
    child: Child;
}

function TripStatusCard({ trip, child }: TripStatusCardProps): JSX.Element {
    const cfg: StatusConfigEntry =
        STATUS_CONFIG[trip.status] ?? STATUS_CONFIG["In Transit"];
    const progress = 65; // static progress percent

    return (
        <div
            className={`rounded-2xl border ${cfg.cardBorder} bg-gradient-to-br ${cfg.gradient} p-4 shadow-sm`}
        >
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Trip Status
                </span>
                <StatusBadge status={trip.status} />
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mb-1.5">
                    <span className="flex items-center gap-1">
                        <MapPin size={9} /> Pickup
                    </span>
                    <span className="flex items-center gap-1">
                        School <Shield size={9} />
                    </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                        className={`h-full ${cfg.bar} rounded-full transition-all duration-700`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="mt-1 text-[10px] text-slate-400 text-center font-medium">
                    {progress}% of route completed
                </div>
            </div>

            {/* Child status */}
            <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${child.boardedAt
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-amber-50 border-amber-200"
                    }`}
            >
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center ${child.boardedAt ? "bg-emerald-500" : "bg-amber-400"
                        }`}
                >
                    <User size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">
                        {child.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{child.grade}</p>
                </div>
                {child.boardedAt ? (
                    <div className="text-right shrink-0">
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> Boarded
                        </p>
                        <p className="text-[10px] text-slate-400">{child.boardedAt}</p>
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                        <AlertCircle size={11} /> Waiting
                    </span>
                )}
            </div>
        </div>
    );
}

interface StatsRowProps {
    trip: Trip;
}

function StatsRow({ trip }: StatsRowProps): JSX.Element {
    const stats: StatItem[] = [
        {
            icon: <Clock size={14} className="text-sky-500" />,
            label: "ETA",
            value: trip.eta,
            sub: `~${trip.etaMinutes} min`,
        },
        {
            icon: <Milestone size={14} className="text-violet-500" />,
            label: "Distance",
            value: trip.distanceRemaining,
            sub: "remaining",
        },
        {
            icon: <Gauge size={14} className="text-amber-500" />,
            label: "Speed",
            value: `${trip.speed} km/h`,
            sub: "current",
        },
    ];

    return (
        <div className="grid grid-cols-3 gap-2">
            {stats.map((s: StatItem, i: number) => (
                <div
                    key={i}
                    className="rounded-xl bg-white border border-slate-100 shadow-sm p-3 flex flex-col items-center text-center gap-1"
                >
                    <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {s.icon}
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium leading-tight">
                        {s.label}
                    </p>
                    <p className="text-sm font-black text-slate-800 leading-tight">
                        {s.value}
                    </p>
                    <p className="text-[9px] text-slate-400">{s.sub}</p>
                </div>
            ))}
        </div>
    );
}

interface DriverCardProps {
    driver: Driver;
    bus: BusInfo;
}

function DriverCard({ driver, bus }: DriverCardProps): JSX.Element {
    return (
        <div className="rounded-2xl bg-white border border-slate-100 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Driver
                </span>
                <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${driver.status === "online"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                        : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                >
                    <span
                        className={`w-1.5 h-1.5 rounded-full ${driver.status === "online"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400"
                            }`}
                    />
                    {driver.status === "online" ? "On Duty" : "Offline"}
                </span>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                    <img
                        src={driver.avatar}
                        alt={driver.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
                        <Wifi size={9} className="text-white" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 leading-tight truncate">
                        {driver.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{driver.phone}</p>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
                            <Star size={9} fill="currentColor" /> {driver.rating}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                            {driver.experience} exp.
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2">
                <Bus size={13} className="text-slate-400 shrink-0" />
                <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-700 truncate">
                        {bus.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{bus.number}</p>
                </div>
                <div className="ml-auto text-right shrink-0">
                    <p className="text-[10px] text-slate-400">Passengers</p>
                    <p className="text-xs font-bold text-slate-700">
                        {bus.currentPassengers}/{bus.capacity}
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ContactButtonsProps {
    driver: Driver;
}

function ContactButtons({ driver }: ContactButtonsProps): JSX.Element {
    return (
        <div className="grid grid-cols-2 gap-2">
            <a
                href={`tel:${driver.phone}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-sm font-bold py-3 px-4 transition-all duration-150 shadow-md shadow-sky-200"
            >
                <Phone size={16} />
                Call Driver
            </a>
            <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-900 active:scale-95 text-white text-sm font-bold py-3 px-4 transition-all duration-150 shadow-md shadow-slate-200"
            >
                <MessageSquare size={16} />
                Message
            </button>
        </div>
    );
}

interface NextStopCardProps {
    trip: Trip;
}

function NextStopCard({ trip }: NextStopCardProps): JSX.Element {
    return (
        <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 p-4 shadow-lg shadow-sky-200 text-white">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sky-100 text-[10px] font-semibold uppercase tracking-widest mb-0.5">
                        Next Stop
                    </p>
                    <p className="text-base font-black">{trip.nextStop}</p>
                    <p className="text-sky-200 text-xs mt-1 flex items-center gap-1">
                        <LocateFixed size={11} />{" "}
                        {trip.distanceToPickup || "0.8 km away"}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <MapPin size={22} className="text-white" />
                </div>
            </div>
        </div>
    );
}

function AlertBanner(): JSX.Element {
    return (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2.5">
            <BellRing
                size={14}
                className="text-emerald-500 shrink-0 animate-bounce"
            />
            <p className="text-xs font-semibold text-emerald-700">
                Aarav boarded safely at 07:55 AM · All clear
            </p>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function ParentDashboard(): JSX.Element {
    const [time, setTime] = useState<Date>(new Date());

    useEffect(() => {
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const { driver, bus, trip, child } = STATIC;

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* ── Topbar ── */}
            <header className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-30">
                <div className="max-w-full mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500 flex items-center justify-center shadow-sm">
                            <Bus size={16} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-800 leading-none">
                                SchoolTrack
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
                                Parent Portal
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <GpsBadge />
                        <div className="text-right">
                            <p className="text-xs font-bold text-slate-800">
                                {time.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                            <p className="text-[10px] text-slate-400">
                                {time.toLocaleDateString("en-US", {
                                    weekday: "short",
                                    month: "short",
                                    day: "numeric",
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Page Body ── */}
            <main className="max-w-full mx-auto px-4 py-4">
                {/* Alert banner */}
                <div className="mb-4">
                    <AlertBanner />
                </div>

                {/* Main two-column layout */}
                <div className="flex flex-col lg:flex-row gap-4 lg:h-[calc(100vh-9rem)]">
                    {/* ── Map (left / top) ── */}
                    <div className="lg:flex-1 lg:min-w-0 h-[55vw] max-h-[480px] lg:max-h-none lg:h-auto">
                        <MapSection trip={trip} />
                    </div>

                    {/* ── Right panel ── */}
                    <div className="lg:w-80 xl:w-96 flex flex-col gap-3 lg:overflow-y-auto lg:pb-2 shrink-0">
                        <TripStatusCard trip={trip} child={child} />
                        <StatsRow trip={trip} />
                        <NextStopCard trip={trip} />
                        <DriverCard driver={driver} bus={bus} />
                        <ContactButtons driver={driver} />
                        <p className="text-center text-[10px] text-slate-400 font-medium pb-1">
                            Updates every 10 seconds · Secured end-to-end
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}