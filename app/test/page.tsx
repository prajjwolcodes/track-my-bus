"use client"

import { firebaseApp } from '@/firebase/firebase'
import { generateToken } from '@/firebase/firebase-messaging'
import { listenBusLocation } from '@/firebase/rtdb'
import { getMessaging, onMessage } from 'firebase/messaging'
import { useEffect, useState } from 'react'

const LocationTestPage = () => {
    const [position, setPosition] = useState<Position | null>(null)


    useEffect(() => {
        generateToken()
        const messaging = getMessaging(firebaseApp)
        onMessage(messaging, (payload) => {
            console.log("Message received. ", payload);
        })
    }, [])

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