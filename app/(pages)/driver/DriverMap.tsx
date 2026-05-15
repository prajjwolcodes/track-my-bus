"use client";

import type { DivIcon, Icon, Map } from "leaflet";
import type { LeafletEventHandlerFnMap } from "leaflet";
import { haversineDistanceMeters } from "@/lib/haversine";
import { MapPin, Ruler } from "lucide-react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect, type MutableRefObject } from "react";

type Coordinate = {
    lat: number;
    lng: number;
};

type Position = {
    lat: number;
    lng: number;
    accuracy: number;
    timestamp: number;
};

type StudentPickup = {
    studentId?: string;
    name?: string;
    photo?: string | null;
    pickupLocation?: Coordinate | null;
};

function BindMapRef({ mapRef }: { mapRef: MutableRefObject<Map | null> }) {
    const map = useMap();

    useEffect(() => {
        mapRef.current = map;

        return () => {
            if (mapRef.current === map) {
                mapRef.current = null;
            }
        };
    }, [map, mapRef]);

    return null;
}

type DriverMapProps = {
    mapRef: MutableRefObject<Map | null>;
    markerIcon: Icon | null | DivIcon;
    studentPickupMarkers: Array<StudentPickup & { pickupLocation: Coordinate }>;
    displayPosition: Position | null;
    position: Position | null;
    showStatusOverlay?: boolean;
};

export default function DriverMap({
    mapRef,
    markerIcon,
    studentPickupMarkers,
    displayPosition,
    position,
    started,
    trackingPhase,
    showStatusOverlay = true,
}: DriverMapProps & { started?: boolean; trackingPhase?: string }) {
    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[27.7172, 85.324]}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
            >
                <BindMapRef mapRef={mapRef} />
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                />

                {studentPickupMarkers.map((student) => {
                    const pickup = student.pickupLocation;
                    const busLat = displayPosition?.lat;
                    const busLng = displayPosition?.lng;
                    const hasBusLocation =
                        typeof busLat === "number" &&
                        Number.isFinite(busLat) &&
                        typeof busLng === "number" &&
                        Number.isFinite(busLng);
                    const distanceMeters = hasBusLocation
                        ? haversineDistanceMeters({ lat: busLat, lng: busLng }, pickup)
                        : null;
                    const distanceLabel =
                        typeof distanceMeters === "number" && Number.isFinite(distanceMeters)
                            ? distanceMeters >= 1000
                                ? `${(distanceMeters / 1000).toFixed(2)} km`
                                : `${Math.round(distanceMeters)} m`
                            : "--";

                    const markerEventHandlers: LeafletEventHandlerFnMap = {
                        mouseover: (event) => {
                            event.target.openPopup();
                        },
                        mouseout: (event) => {
                            event.target.closePopup();
                        },
                    };

                    return (
                        <Marker
                            key={student.studentId ?? `${student.name}-${pickup.lat}-${pickup.lng}`}
                            position={[pickup.lat, pickup.lng]}
                            eventHandlers={markerEventHandlers}
                        >
                            <Popup closeButton={false} autoClose={false} closeOnClick={false}>
                                <div className="">
                                    <div className="flex items-center gap-3">
                                        <div className="size-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 ring-2 ring-blue-100">
                                            {student.photo ? (
                                                <img
                                                    src={student.photo}
                                                    alt={student.name ?? "Student photo"}
                                                    className="h-full w-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-sm font-bold text-white">
                                                    {(student.name?.[0] ?? "S").toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-[15px] font-semibold text-slate-900">
                                                {student.name ?? "Student"}
                                            </p>
                                        </div>

                                        <span className="shrink-0 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
                                            Pickup
                                        </span>
                                    </div>

                                    <div className="mt-3 grid gap-2">
                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                                            <div className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
                                                <MapPin size={14} className="text-slate-500" />
                                                Pickup coords
                                            </div>
                                            <div className="text-[12px] font-semibold text-slate-800">
                                                <span className="font-mono">{pickup.lat.toFixed(5)}</span>
                                                <span className="mx-1 text-slate-400">,</span>
                                                <span className="font-mono">{pickup.lng.toFixed(5)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                                            <div className="flex items-center gap-2 text-[12px] font-medium text-slate-700">
                                                <Ruler size={14} className="text-slate-500" />
                                                Distance to bus
                                            </div>
                                            <div className="text-[12px] font-semibold text-slate-800">{distanceLabel}</div>
                                        </div>
                                    </div>

                                    {!hasBusLocation ? (
                                        <p className="mt-2 text-[11px] text-slate-400">
                                            Bus location not available yet.
                                        </p>
                                    ) : null}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

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

            {/* Floating status indicator */}
            {showStatusOverlay ? (
                <div className="pointer-events-none absolute left-3 top-3 z-40 flex flex-col gap-2">
                    <div className="flex items-center gap-2 rounded-lg border border-white/70 bg-white/90 px-3 py-2 text-sm shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${started ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                            {started ? (trackingPhase === "locating" ? "Locating GPS..." : "Live GPS Active") : "GPS Inactive"}
                        </span>
                    </div>
                    <div className="w-fit rounded-lg border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80 dark:text-slate-200">
                        {started && trackingPhase === "tracking" ? "Bus Moving" : "Bus Stopped"}
                    </div>
                </div>
            ) : null}
        </div>
    );
}