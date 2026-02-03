"use client"

import { getBusLocation } from '@/firebase/rtdb'
import { useState } from 'react'

const LocationTestPage = () => {
    const [position, setPosition] = useState<Position | null>(null)
    function getLiveBusLocation() {
        getBusLocation(1, (data) => {
            setPosition(data)
            console.log(data)
        })

    }
    return (
        <div className='flex flex-col gap-4'>LocationTestPage

            <button onClick={getLiveBusLocation}>Get live location</button>

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