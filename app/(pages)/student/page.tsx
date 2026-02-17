"use client"

import { useAuth } from '@/app/context/authContext'
import { db } from '@/firebase/firebase'
import { addDoc, collection, Timestamp, getDocs } from 'firebase/firestore'
import dynamic from 'next/dynamic'
import { useEffect, useState } from "react"

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

const AddStudentPage: React.FC = () => {

    const [name, setName] = useState('')
    const [grade, setGrade] = useState('')
    const [busNumber, setBusNumber] = useState('')
    const [parentName, setParentName] = useState('')
    const [parentPhone, setParentPhone] = useState('')
    const [buses, setBuses] = useState<any[]>([])
    const [pickupLocation, setPickupLocation] = useState({
        lat: null as number | null,
        lng: null as number | null,
        address: ''
    });

    const { user } = useAuth()

    // ✅ FETCH BUSES
    useEffect(() => {
        async function fetchBuses() {
            const snapshot = await getDocs(collection(db, "buses"))
            const busList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setBuses(busList)
        }

        fetchBuses()
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user) return;

        await addDoc(collection(db, 'students'), {
            schoolId: user.schoolId,
            busId: busNumber, // use selected bus id
            name,
            grade,
            busNumber,
            parentName,
            parentPhone,
            pickupLocation,
            createdAt: Timestamp.now(),
        })

        alert('Student added successfully!')
    }

    return (
        <div className="flex flex-col w-full bg-gray-100 text-black items-center justify-center min-h-screen">

            <form className="border border-gray-800 max-w-3xl p-5" onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold mb-4">Add Student</h1>

                {/* Name */}
                <input
                    type="text"
                    placeholder="Student Name"
                    className="border p-2 rounded w-full mb-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                {/* Grade */}
                <select
                    className="border p-2 rounded w-full mb-4"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    <option value="">Select Grade</option>
                    {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                            Grade {i + 1}
                        </option>
                    ))}
                </select>

                {/* ✅ Dynamic Bus Dropdown */}
                <select
                    className="border p-2 rounded w-full mb-4"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                >
                    <option value="">Select a bus</option>

                    {buses.map(bus => (
                        <option key={bus.busId} value={bus.busId}>
                            {bus.busNo} ({bus.plateNo})
                        </option>
                    ))}
                </select>

                {/* Parent Info */}
                <input
                    type="text"
                    placeholder="Parent Name"
                    className="border p-2 rounded w-full mb-4"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                />

                <input
                    type="text"
                    placeholder="Parent Phone"
                    className="border p-2 rounded w-full mb-4"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                />

                {/* Location Picker */}
                <LocationPicker
                    setPickupLocation={(location) => {
                        if (location) {
                            setPickupLocation({
                                lat: location.lat,
                                lng: location.lng,
                                address: `${location.lat}, ${location.lng}`
                            });
                        }
                    }}
                />

                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Add Student
                </button>
            </form>
        </div>
    );
}

export default AddStudentPage
