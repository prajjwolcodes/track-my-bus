"use client"

import { useAuth } from '@/app/context/authContext'
import LogoutButton from '@/components/LogoutButton'
import { BusLocationPayload, listenBusLocation } from '@/firebase/rtdb'
import React, { useEffect, useState } from 'react'

const page = () => {
    const { user, loading: authLoading } = useAuth()
    const [position, setPosition] = useState<BusLocationPayload | null>(null)
    const [locationLoading, setLocationLoading] = useState<boolean>(true)
    const [now, setNow] = useState<number>(Date.now())
    const busId = user?.busId

    useEffect(() => {
        if (!busId) {
            setLocationLoading(false)
            return
        }

        setLocationLoading(true)

        const unsubscribe = listenBusLocation(busId, (data) => {
            setPosition(data)
            setLocationLoading(false)
        })

        return () => unsubscribe()
    }, [busId])

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(Date.now())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    const isTripActive = position?.tripActive === true
    const hasLocation = typeof position?.lat === 'number' && typeof position?.lng === 'number'

    const getLastUpdatedLabel = (timestamp: number) => {
        const diffMs = Math.max(0, now - timestamp)
        const diffSec = Math.floor(diffMs / 1000)

        if (diffSec < 5) return "just now"
        if (diffSec < 60) return `${diffSec}s ago`

        const diffMin = Math.floor(diffSec / 60)
        if (diffMin < 60) return `${diffMin}m ago`

        const diffHr = Math.floor(diffMin / 60)
        return `${diffHr}h ago`
    }


    return (
        <div className='flex flex-col gap-4'>
            <LogoutButton />

            <p>Assigned Bus: {authLoading ? "Loading assigned bus..." : (busId ?? "Not assigned")}</p>

            {locationLoading ? (
                <p>Loading location...</p>
            ) : hasLocation ? (
                <div>
                    <p>{isTripActive ? "Trip is active (live)" : "Trip is not active. Showing last known location."}</p>
                    <p>Latitude: {position.lat}</p>
                    <p>Longitude: {position.lng}</p>
                    <p>Accuracy: {position.accuracy} meters</p>
                    <p>Timestamp: {new Date(position.timestamp).toLocaleString()}</p>
                    {!isTripActive && (
                        <p>Last Updated: {getLastUpdatedLabel(position.timestamp)}</p>
                    )}
                </div>
            ) : (
                <p>No location available yet.</p>
            )}
        </div>
    )
}

export default page