"use client";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { listenBusLocation } from "@/firebase/rtdb";
import { useEffect, useState } from "react";

const BusMap = () => {
    const [position, setPosition] = useState<Position | null>(null)

    useEffect(() => {
        const unsubscribe = listenBusLocation(1, (data) => {
            setPosition(data)
        })
        return () => unsubscribe()
    }, [])
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
            <Marker position={[position ? position.lat : 27.66499, position ? position.lng : 85.36980]}>
                <Popup>Bus Location</Popup>
            </Marker>
        </MapContainer>
    );
};

export default BusMap;
