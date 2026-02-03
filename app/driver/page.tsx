"use client"

import { listenBusLocation } from "@/firebase/rtdb"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface SuccessPosition extends GeolocationPosition {
}

interface GeolocationError extends GeolocationPositionError {
}

const DriverPage = () => {
    const [position, setPosition] = useState<Position | null>(null)

    useEffect(() => {
        toast("Event has been created")

        if (typeof navigator === "undefined" || !navigator.geolocation) {
            console.log("Navigation is not supported by your browser")
            return
        }
        function successCallback(pos: SuccessPosition): void {
            const { coords, timestamp } = pos
            setPosition({
                lat: coords.latitude,
                lng: coords.longitude,
                accuracy: coords.accuracy,
                timestamp: timestamp
            })
        }

        function errorCallback(err: GeolocationError): void {
            console.log(`ERROR(${err.code}): ${err.message}`);

        }

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 1000,
        }

        const watchId = navigator.geolocation.watchPosition(successCallback, errorCallback, options);
        return () => navigator.geolocation.clearWatch(watchId);

    }, [])

    function sendLiveLocation() {
        listenBusLocation(position, 1)
    }


    return (
        <div>DriverPage

            <button onClick={sendLiveLocation}>Send location</button>
        </div>
    )
}

export default DriverPage