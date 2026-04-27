"use client";

import type { BusLocationPayload } from "@/firebase/rtdb";
import type { Icon, Map, Marker as LeafletMarker } from "leaflet";
import type { MutableRefObject } from "react";
import { useEffect } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

type ParentMapClientProps = {
    mapRef: MutableRefObject<Map | null>;
    markerRef: MutableRefObject<LeafletMarker | null>;
    markerIcon: Icon | null;
    isTripActive: boolean;
    hasLocation: boolean;
    position: BusLocationPayload | null;
    pickupLocation: { lat: number; lng: number } | null;
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

const ParentMapClient = ({
    mapRef,
    markerRef,
    markerIcon,
    isTripActive,
    hasLocation,
    position,
    pickupLocation,
}: ParentMapClientProps) => {
    return (
        <MapContainer
            center={[27.7172, 85.324]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
        >
            <BindMapRef mapRef={mapRef} />
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
            />

            {pickupLocation && (
                <>
                    <Marker position={[pickupLocation.lat, pickupLocation.lng]}>
                        <Popup>
                            <div className="text-sm">
                                <p><strong>Home Pickup Location</strong></p>
                                <p>Lat: {pickupLocation.lat.toFixed(4)}</p>
                                <p>Lng: {pickupLocation.lng.toFixed(4)}</p>
                            </div>
                        </Popup>
                    </Marker>
                    {/* <Circle
                        center={[pickupLocation.lat, pickupLocation.lng]}
                        radius={200}
                    pathOptions={{ color: "#2563eb", fillColor: "#93c5fd", fillOpacity: 0.2 }}
                    /> */}
                </>
            )}

            {isTripActive && hasLocation && markerIcon && position && (
                <Marker ref={markerRef} position={[position.lat, position.lng]} icon={markerIcon}>
                    <Popup>
                        <div className="text-sm">
                            <p><strong>Bus Live Location</strong></p>
                            <p>Lat: {position.lat.toFixed(4)}</p>
                            <p>Lng: {position.lng.toFixed(4)}</p>
                            <p>Accuracy: +/-{position.accuracy?.toFixed?.(0) ?? 0}m</p>
                        </div>
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default ParentMapClient;
