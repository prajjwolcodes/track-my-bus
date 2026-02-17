"use client"

import { firebaseApp } from '@/firebase/firebase'
import { generateToken } from '@/firebase/firebase-messaging'
import { listenBusLocation } from '@/firebase/rtdb'
import { getMessaging, onMessage } from 'firebase/messaging'
import { useEffect, useState } from 'react'
import {
    collection,
    query,
    where,
    onSnapshot
} from "firebase/firestore";
import { db } from '@/firebase/firebase'
import { useAuth } from '@/app/context/authContext'

// const LocationTestPage = () => {
//     const [position, setPosition] = useState<Position | null>(null)

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

// useEffect(() => {
//     const unsubscribe = listenBusLocation(1, (data) => {
//         setPosition(data)
//     })
//     return () => unsubscribe()
// }, [])
//     return (
//         <div className='flex flex-col gap-4'>LocationTestPage
//             <h1>Display data
//                 {position ? (
//                     <div>
//                         <p>Latitude: {position.lat}</p>
//                         <p>Longitude: {position.lng}</p>
//                         <p>Accuracy: {position.accuracy} meters</p>
//                         <p>Timestamp: {new Date(position.timestamp).toLocaleString()}</p>
//                     </div>
//                 ) : (
//                     <p>No position data available.</p>
//                 )}
//             </h1>
//         </div>
//     )
// }

// export default LocationTestPage


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



// For testing  bus and driver data fetching for logged-in school

interface Driver {
    driverId: string;
    busId: string;
    name: string;
    phone: string;
    schoolId: string;
    bus?: {
        busId: string;
        busNo: string;
        route?: string;
    } | string;
}

interface Bus {
    busId: string;
    driverId: string;
    busNo: string;
    plateNo: string;
    route: string;
    schoolId: string;
}

const TestDriversAndBusesPage = () => {
    const { user, loading: authLoading } = useAuth();
    const schoolId = user?.schoolId ?? null;
    const userEmail = user?.email ?? null;

    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [buses, setBuses] = useState<Bus[]>([]);

    // Fetch drivers
    useEffect(() => {
        if (!schoolId) return;

        const q = query(
            collection(db, "drivers"),
            where("schoolId", "==", schoolId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const driverList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Driver, "id">),
            }));
            setDrivers(driverList);
        });

        return () => unsubscribe();
    }, [schoolId]);

    // Fetch buses
    useEffect(() => {
        if (!schoolId) return;

        const q = query(
            collection(db, "buses"),
            where("schoolId", "==", schoolId)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const busList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Bus, "id">),
            }));
            setBuses(busList);
        });

        return () => unsubscribe();
    }, [schoolId]);

    return (
        <div className="p-6 flex flex-col gap-6">
            <h1 className="text-2xl font-bold">Logged-in School Data</h1>

            {/* Logged-in Info */}
            <div className="p-4 border rounded-lg bg-gray-50 shadow-sm">
                {authLoading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <p><strong>Email:</strong> {userEmail}</p>
                        <p><strong>School ID:</strong> {schoolId || "Not found"}</p>
                    </>
                )}
            </div>

            {/* Drivers */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Drivers</h2>
                {drivers.length === 0 ? (
                    <p>No drivers found.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {drivers.map(driver => (
                            <div key={driver.driverId} className="p-4 border rounded shadow">
                                <p><strong>Name:</strong> {driver.name}</p>
                                <p><strong>Phone:</strong> {driver.phone || "N/A"}</p>
                                <p>
                                    <strong>Bus:</strong>{" "}
                                    {driver.busId ? buses.find(b => b.busId === driver.busId)?.busNo || "N/A" : "No bus assigned"}
                                </p>
                                <p>
                                    <strong>Route:</strong>{" "}
                                    {driver.busId ? buses.find(b => b.busId === driver.busId)?.route || "N/A" : "N/A"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Buses */}
            <div>
                <h2 className="text-xl font-semibold mb-2">Buses</h2>
                {buses.length === 0 ? (
                    <p>No buses found.</p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {buses.map(bus => (
                            <div key={bus.busId} className="p-4 border rounded shadow">
                                <p><strong>Bus:</strong> {bus.busNo}</p>
                                <p><strong>Plate No:</strong> {bus.plateNo || "N/A"}</p>
                                <p><strong>Driver:</strong> {bus.driverId ? drivers.find(d => d.driverId === bus.driverId)?.name || "N/A" : "No driver assigned"}</p>
                                <p><strong>Route:</strong> {bus.route || "N/A"}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};


export default TestDriversAndBusesPage;