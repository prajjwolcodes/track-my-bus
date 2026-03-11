"use client"

import LogoutButton from "@/components/LogoutButton"
import { updateBusLocation } from "@/firebase/rtdb"
import { useRef, useState } from "react"
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
    const [position, setPosition] = useState<BusPosition | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [started, setStarted] = useState<boolean>(false)
    const watchIdRef = useRef<number | null>(null)

    const startTrip = () => {
        setLoading(true)
        try {
            if (typeof navigator === "undefined" || !navigator.geolocation) {
                toast.error("Geolocation is not supported by your browser")
                setLoading(false)
                return
            }

            if (watchIdRef.current !== null) return

            const watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const newPos = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: Math.round(pos.coords.accuracy),
                        timestamp: pos.timestamp
                    }
                    updateBusLocation(1, newPos)
                    setPosition(newPos)
                    setStarted(true)
                    setLoading(false)
                },
                (err) => {
                    toast.error(`Location Error: ${err.message}`)
                    setLoading(false)
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            )

            watchIdRef.current = watchId
            toast.success("Trip started successfully")
        } catch {
            toast.error("Failed to start trip")
            setLoading(false)
        }
    }

    const stopTrip = () => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current)
            watchIdRef.current = null
        }
        setStarted(false)
        setPosition(null)
        toast.info("Trip stopped")
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans antialiased">
            {/* HEADER */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-3 rounded-lg text-white shadow">
                            <Navigation size={28} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-tight">
                                Smart Bus Tracker
                            </h1>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                                Driver Portal
                            </p>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </header>

            <main className="max-w-xl mx-auto p-6 space-y-6">

                {/* STATUS CARD */}
                <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 shadow-lg border ${
                    started 
                        ? "bg-emerald-50 border-emerald-200" 
                        : "bg-white border-slate-200"
                }`}>
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className={`mb-4 p-4 rounded-full ${
                            started 
                                ? "bg-emerald-500 text-white animate-pulse shadow-lg" 
                                : "bg-slate-100 text-slate-400"
                        }`}>
                            <Activity size={36} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">
                            {started ? "Trip is Live 🚍" : "Ready to Start?"}
                        </h2>
                        <p className={`mt-2 text-sm ${started ? "text-emerald-700" : "text-slate-500"}`}>
                            {started 
                                ? "Your location is being shared in real-time with passengers." 
                                : "Start your shift to transmit location data."}
                        </p>
                        
                        {started && (
                            <div className="mt-4 flex items-center gap-2 px-4 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-widest">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                Transmitting
                            </div>
                        )}
                    </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex justify-center gap-6 mt-2">
                    <button
                        onClick={startTrip}
                        disabled={started || loading}
                        className={`group flex flex-col items-center justify-center gap-2 px-8 py-6 rounded-2xl font-semibold shadow-lg transition-all
                            ${started || loading 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700"}`
                        }
                    >
                        <Play className="w-6 h-6" />
                        Start Trip
                    </button>

                    <button
                        onClick={stopTrip}
                        disabled={!started}
                        className={`group flex flex-col items-center justify-center gap-2 px-8 py-6 rounded-2xl font-semibold shadow-lg transition-all
                            ${!started 
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                                : "bg-rose-50 border-2 border-rose-500 text-rose-600 hover:bg-rose-100"}`
                        }
                    >
                        <Square className="w-6 h-6" />
                        Stop Trip
                    </button>
                </div>

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