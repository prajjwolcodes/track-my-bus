"use client"

import { useAuth } from "@/app/context/authContext"
import LogoutButton from "@/components/LogoutButton"
import { setBusTripActive, updateBusLocation } from "@/firebase/rtdb"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { 
  MapPin, 
  Navigation, 
  Clock, 
  ShieldCheck, 
  Play, 
  Square, 
  Activity 
} from "lucide-react"

interface BusPosition {
    lat: number
    lng: number
    accuracy: number
    timestamp: number
}

const DriverPage = () => {
    const { user, loading: authLoading } = useAuth()
    const [position, setPosition] = useState<Position | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [started, setStarted] = useState<boolean>(false)
    const watchIdRef = useRef<number | null>(null);
    const busId = user?.busId ?? null

    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                if (busId) {
                    void setBusTripActive(busId, false)
                }
            }
        }
    }, [busId])

    function startTrip() {
        if (!busId) {
            toast.error("No bus assigned to this driver")
            return
        }
        const activeBusId = busId

        try {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser")
                setLoading(false)
                return
            }

            if (watchIdRef.current !== null) return;

            setStarted(true);
            setLoading(true)
            void setBusTripActive(activeBusId, true)

            function successCallback(pos: SuccessPosition): void {
                const { coords, timestamp } = pos
                const newPos = {
                    lat: coords.latitude,
                    lng: coords.longitude,
                    accuracy: coords.accuracy,
                    timestamp: timestamp,
                    tripActive: true,
                }
                updateBusLocation(activeBusId, newPos)

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
        if (!busId) {
            setStarted(false)
            return
        }
        const activeBusId = busId

        setStarted(false);
        setLoading(true)
        try {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
                void setBusTripActive(activeBusId, false)
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
        <main className="flex flex-col gap-6">

            <LogoutButton />

            <button onClick={startTrip}>START Trip</button>
            <button onClick={stopTrip}>STOP Trip</button>

            <p>
                Assigned Bus: {authLoading ? "Loading assigned bus..." : (busId ?? "Not assigned")}
            </p>

            {loading && <p>Loading...</p>}
            {started && position ? (
                <div>
                    <p>Trip in progress</p>
                    <p>Latitude: {position.lat}</p>
                    <p>Longitude: {position.lng}</p>
                    <p>Accuracy: {position.accuracy} meters</p>
                    <p>Timestamp: {new Date(position.timestamp).toLocaleString()}</p>
                </div>
            ): (
                <p>No active trip</p>
            )
            }

                {/* LOCATION STATS */}
                {started && position && (
                    <div className="grid grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <StatCard icon={<MapPin className="text-blue-500" size={18} />} label="Latitude" value={position.lat.toFixed(6)} />
                        <StatCard icon={<MapPin className="text-blue-500" size={18} />} label="Longitude" value={position.lng.toFixed(6)} />
                        <StatCard icon={<ShieldCheck className="text-emerald-500" size={18} />} label="Accuracy" value={`${position.accuracy} m`} />
                        <StatCard icon={<Clock className="text-orange-500" size={18} />} label="Last Update" value={new Date(position.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} />
                    </div>
                )}

                {!started && !loading && (
                    <div className="p-8 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400">
                        <Navigation size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">No active tracking data</p>
                    </div>
                )}

                {loading && (
                    <div className="flex justify-center items-center py-4 gap-3 text-indigo-600">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                        <span className="font-medium">Initializing GPS...</span>
                    </div>
                )}
            </main>
        </div>
    )
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-start">
            <div className="flex items-center gap-2 mb-2">
                {icon}
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-lg font-bold text-slate-800 tracking-tight">{value}</p>
        </div>
    )
}

export default DriverPage