"use client"

import { updateBusLocation } from "@/firebase/rtdb"
import { useRef, useState } from "react"
import { toast } from "sonner"

interface SuccessPosition extends GeolocationPosition {
}

interface GeolocationError extends GeolocationPositionError {
}

const DriverPage = () => {
    const [position, setPosition] = useState<Position | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [started, setStarted] = useState<boolean>(false)
    const watchIdRef = useRef<number | null>(null);

    function startTrip() {
        setStarted(true);
        setLoading(true)

        try {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
                console.log("Navigation is not supported by your browser")
                return
            }

            if (watchIdRef.current !== null) return;

            function successCallback(pos: SuccessPosition): void {
                const { coords, timestamp } = pos
                const newPos = {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    accuracy: coords.accuracy,
                    timestamp: timestamp
                }
                updateBusLocation(1, newPos)

                setPosition(newPos)
                console.log(newPos)
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
            watchIdRef.current = watchId;
            console.log("Trip started");

        } catch (error) {
            toast.error("Error starting trip")
        }
        finally {
            setLoading(false)
        }
    }

    const stopTrip = () => {

        setStarted(false);
        setLoading(true)
        try {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                console.log("Trip stopped");
            }
        } catch (error) {
            console.log(error)
        }
        finally {
            setLoading(false)
        }
    };

    return (
        <div className="flex flex-col gap-4 text-center">DriverPage

            <button onClick={startTrip}>START Trip</button>
            <button onClick={stopTrip}>STOP Trip</button>

            {loading && <p>Loading...</p>}
            {started && position ? (
                <div>
                    <p>Trip in progress</p>
                    <p>Latitude: {position.lat}</p>
                    <p>Longitude: {position.lng}</p>
                    <p>Accuracy: {position.accuracy} meters</p>
                    <p>Timestamp: {new Date(position.timestamp).toLocaleString()}</p>
                </div>
            ) : (
                <p>You are not currently on a trip.</p>
            )}
        </div>
    )
}

export default DriverPage