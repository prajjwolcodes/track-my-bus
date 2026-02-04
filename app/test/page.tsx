"use client"

import { listenBusLocation } from '@/firebase/rtdb'
import { useEffect, useState } from 'react'

const LocationTestPage = () => {
    const [position, setPosition] = useState<Position | null>(null)

    useEffect(() => {
        const unsubscribe = listenBusLocation(1, (data) => {
            setPosition(data)
        })
        return () => unsubscribe()
    }, [])
    return (
        <div className='flex flex-col gap-4'>LocationTestPage
            <h1>Display data
                {position ? (
                    <div>
                        <p>Latitude: {position.lat}</p>
                        <p>Longitude: {position.lng}</p>
                        <p>Accuracy: {position.accuracy} meters</p>
                        <p>Timestamp: {new Date(position.timestamp).toLocaleString()}</p>
                    </div>
                ) : (
                    <p>No position data available.</p>
                )}
            </h1>
        </div>
    )
}

export default LocationTestPage