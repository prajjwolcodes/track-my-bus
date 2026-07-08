"use client";

import { listenBusLocation } from "@/firebase/rtdb";
import type { BusLocationPayload } from "@/firebase/rtdb";
import "leaflet/dist/leaflet.css";
import { Marker as LeafletMarker } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { animateMarker } from "./utils";

interface BusMapProps {
    busId?: string | number | null
}

const BusMap = ({ busId }: BusMapProps) => {
    const [draggable, setDraggable] = useState(false)
    const [position, setPosition] = useState<BusLocationPayload | null>(null)
    const markerRef = useRef<LeafletMarker>(null);
    const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);

    const center = useMemo((): [number, number] => {
        const lat = position?.lat;
        const lng = position?.lng;
        if (typeof lat === "number" && Number.isFinite(lat) && typeof lng === "number" && Number.isFinite(lng)) {
            return [lat, lng];
        }
        return [27.66499, 85.3698];
    }, [position?.lat, position?.lng]);


    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    const newPos = {
                        lat: marker.getLatLng().lat,
                        lng: marker.getLatLng().lng,
                        accuracy: position ? position.accuracy : 0,
                        timestamp: Date.now()
                    }
                    setPosition(newPos)
                }
            },
        }),
        [],
    )
    const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d)
    }, [])

    useEffect(() => {
        if (!busId) return

        const unsubscribe = listenBusLocation(busId, (data) => {
            if (!data) {
                setPosition(null);
                prevPosRef.current = null;
                return;
            }

            // RTDB can contain trip status updates without lat/lng.
            const rawLat = (data as any)?.lat;
            const rawLng = (data as any)?.lng;
            const lat = typeof rawLat === "number" ? rawLat : Number(rawLat);
            const lng = typeof rawLng === "number" ? rawLng : Number(rawLng);
            if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                return;
            }

            const nextPayload: BusLocationPayload = {
                ...data,
                lat,
                lng,
                accuracy: typeof (data as any)?.accuracy === "number" ? (data as any).accuracy : Number((data as any)?.accuracy ?? 0),
                timestamp: typeof (data as any)?.timestamp === "number" ? (data as any).timestamp : Number((data as any)?.timestamp ?? Date.now()),
            };

            setPosition(nextPayload)

            const marker = markerRef.current;
            if (!marker) return;

            const newPos = { lat, lng };

            // FIRST TIME → just place marker
            if (!prevPosRef.current) {
                marker.setLatLng([newPos.lat, newPos.lng]);
                prevPosRef.current = newPos;
                return;
            }

            // NEXT TIMES → animate
            animateMarker(marker, prevPosRef.current, newPos);

            prevPosRef.current = newPos;
        });

        return () => unsubscribe();
    }, [busId]);




    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom
            style={{ height: "100vh", width: "100%" }}
        >
            <TileLayer
                attribution='Track-my-bus'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker
                draggable={draggable}
                eventHandlers={eventHandlers}
                ref={markerRef}
                position={[0, 0]}

            >
                <Popup minWidth={90}>
                    <span onClick={toggleDraggable}>
                        {draggable
                            ? 'Marker is draggable, Click here to disable dragging'
                            : 'Click here to make marker draggable'}
                    </span>
                </Popup>
                {/* <Popup>Bus Location</Popup> */}
            </Marker>
        </MapContainer>
    );
};

export default BusMap;
