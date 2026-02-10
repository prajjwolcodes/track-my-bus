"use client"

import { firebaseApp } from '@/firebase/firebase'
import { generateToken } from '@/firebase/firebase-messaging'
import { listenBusLocation } from '@/firebase/rtdb'
import { getMessaging, onMessage } from 'firebase/messaging'
import { useEffect, useState } from 'react'

const LocationTestPage = () => {
    const [position, setPosition] = useState<Position | null>(null)

    // useEffect(() => {
    //     const messaging = getMessaging(firebaseApp);
    //     const unsubscribe = onMessage(messaging, (payload) => {
    //         if (Notification.permission === "granted" && payload.data) {
    //             new Notification(payload.data.tabOpenTitle, {
    //                 body: payload.data.tabOpenBody,
    //                 icon: payload.data.icon,
    //             });
    //         }
    //     })

    //     return () => unsubscribe();
    // }, []);

    // useEffect(() => {
    //     generateToken()
    //     const messaging = getMessaging(firebaseApp)
    //     onMessage(messaging, (payload) => {
    //         const title =
    //             payload.notification?.title || payload.data?.title;

    //         const body =
    //             payload.notification?.body || payload.data?.body;

    //         new Notification(title!, {
    //             body,
    //             icon: payload.notification?.icon || payload.data?.icon,
    //         });
    //     });

    // }, [])

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


// import React from 'react'

// const page = () => {
//     return (
//         <form action="https://formsubmit.co/pratibhaa625@gmail.com" method="POST">
//             <input type="text" name="name" required />
//             <input type="email" name="email" required />
//             <button type="submit">Send</button>
//         </form>
//     )
// }

// export default page