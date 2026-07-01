"use client";

import type { BusLocationPayload } from "@/firebase/rtdb";
import type { DivIcon, Icon } from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type BusItem = {
    id: string;
    busNo?: string;
    plateNo?: string;
    routeNo?: string | null;
};

type DriverItem = {
    id: string;
    name?: string;
};

type MovingBus = {
    bus: BusItem;
    driver: DriverItem | undefined;
    location: BusLocationPayload & { lat: number; lng: number };
};

type FocusTarget = {
    busId: string;
    lat: number;
    lng: number;
    nonce: number;
};

type SchoolLiveMapProps = {
    movingBuses: MovingBus[];
    markerIcon: Icon | DivIcon | null;
    focusTarget: FocusTarget | null;
    formatTimestamp: (value?: number) => string;
};

function FitToMovingBuses({ buses }: { buses: MovingBus[] }) {
    const map = useMap();

    useEffect(() => {
        if (buses.length === 0) return;

        if (buses.length === 1) {
            map.setView([buses[0].location.lat, buses[0].location.lng], 15);
            return;
        }

        const bounds: [number, number][] = buses.map((entry) => [
            entry.location.lat,
            entry.location.lng,
        ]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }, [buses, map]);

    return null;
}

function FocusOnBus({ target }: { target: FocusTarget | null }) {
    const map = useMap();

    useEffect(() => {
        if (!target) return;
        map.setView([target.lat, target.lng], 17, { animate: true });
    }, [map, target]);

    return null;
}

export default function SchoolLiveMap({
    movingBuses,
    markerIcon,
    focusTarget,
    formatTimestamp,
}: SchoolLiveMapProps) {
    return (
        <MapContainer
            center={[27.7172, 85.324]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            <FitToMovingBuses buses={movingBuses} />
            <FocusOnBus target={focusTarget} />

            {movingBuses.map((entry) => (
                <Marker
                    key={entry.bus.id}
                    position={[entry.location.lat, entry.location.lng]}
                    icon={markerIcon ?? undefined}
                >
                    <Popup>
                        <div className="text-sm space-y-1">
                            <p>
                                <strong>{entry.bus.busNo || entry.bus.plateNo || entry.bus.id}</strong>
                            </p>
                            <p>Driver: {entry.driver?.name || "--"}</p>
                            <p>Route: {entry.bus.routeNo || "--"}</p>
                            <p>
                                Lat: {entry.location.lat.toFixed(5)}, Lng: {entry.location.lng.toFixed(5)}
                            </p>
                            <p>Updated: {formatTimestamp(entry.location.timestamp)}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
