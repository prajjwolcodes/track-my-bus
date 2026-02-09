"use client";

import { listenBusLocation } from "@/firebase/rtdb";
import "leaflet/dist/leaflet.css";
import { Marker as LeafletMarker } from "leaflet";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { accumulateMetadata } from "next/dist/lib/metadata/resolve-metadata";
import { animateMarker } from "./utils";

const BusMap = () => {
    const [draggable, setDraggable] = useState(false)
    const [position, setPosition] = useState<Position | null>(null)
    const markerRef = useRef<LeafletMarker>(null);
    const prevPosRef = useRef<{ lat: number; lng: number } | null>(null);


    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    console.log(marker)
                    const newPos = {
                        lat: marker.getLatLng().lat,
                        lng: marker.getLatLng().lng,
                        accuracy: position ? position.accuracy : 0,
                        timestamp: Date.now()
                    }
                    setPosition(newPos)
                    console.log("Marker dragged to: ", newPos)
                }
            },
        }),
        [],
    )
    const toggleDraggable = useCallback(() => {
        setDraggable((d) => !d)
    }, [])

    useEffect(() => {
        const unsubscribe = listenBusLocation(1, (data) => {
            if (!data || !markerRef.current) return;

            const newPos = { lat: data.lat, lng: data.lng };

            // FIRST TIME → just place marker
            if (!prevPosRef.current) {
                markerRef.current.setLatLng([newPos.lat, newPos.lng]);
                prevPosRef.current = newPos;
                return;
            }

            // NEXT TIMES → animate
            animateMarker(markerRef.current, prevPosRef.current, newPos);

            prevPosRef.current = newPos;
        });

        return () => unsubscribe();
    }, []);




    return (
        <MapContainer
            center={[position ? position.lat : 27.66499, position ? position.lng : 85.36980]}
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
