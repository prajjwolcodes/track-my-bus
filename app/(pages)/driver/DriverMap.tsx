"use client";

import type { Icon, Map } from "leaflet";
import type { LeafletEventHandlerFnMap } from "leaflet";
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
    markerIcon: Icon | null;
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
                                <div className="min-w-45 rounded-xl bg-white p-3 shadow-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-2 ring-blue-100">
                                            {student.photo ? (
                                                <img
                                                    src={student.photo}
                                                    alt={student.name ?? "Student photo"}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-500">
                                                    {student.name?.[0]?.toUpperCase() ?? "S"}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-900">
                                                {student.name ?? "Student"}
                                            </p>
                                            <p className="text-xs text-slate-500">Pickup location</p>
                                            <p className="mt-1 text-xs text-slate-600">
                                                {pickup.lat.toFixed(5)}, {pickup.lng.toFixed(5)}
                                            </p>
                                        </div>
                                    </div>
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