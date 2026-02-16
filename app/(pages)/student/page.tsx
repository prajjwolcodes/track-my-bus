"use client"

import { useAuth } from '@/app/context/authContext'
import { db } from '@/firebase/firebase'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import dynamic from 'next/dynamic'
import { useState } from "react"

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

const AddStudentPage: React.FC = () => {

    const [name, setName] = useState('')
    const [grade, setGrade] = useState('')
    const [busNumber, setBusNumber] = useState('')
    const [parentName, setParentName] = useState('')
    const [parentPhone, setParentPhone] = useState('')
    const [pickupLocation, setPickupLocation] = useState({ lat: null as number | null, lng: null as number | null, address: '' });


    const { user } = useAuth()

    // IMPLEMENT BUS DATA ONCE BUS FUNC IMPLEMENTED IN DRIVER SIDE

    // useEffect(() => {
    //     async function fetchDriverData() {
    //         if (!user) return;
    //         const q = query(collection(db, "drivers"), where("schoolId", "==", user.schoolId));
    //         const querySnapshot = await getDocs(q);
    //         querySnapshot.forEach((doc) => {
    //             // doc.data() is never undefined for query doc snapshots
    //             console.log(doc.id, " => ", doc.data());
    //         });

    //     }

    //     fetchDriverData()

    // }, [user])

    async function handleSubmit(e: React.FormEvent) {
        if (!user) return;
        e.preventDefault()
        // console.log({ name, grade, busNumber, parentName, parentPhone, pickupLocation })

        await addDoc(collection(db, 'students'), {
            schoolId: user.schoolId,
            busId: `bus${busNumber}`,
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
        <div className="flex flex-col w-full bg-gray-100 text-black items-center justify-center min-h-screen " >

            <form className="border border-gray-800 max-w-3xl p-5" onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold mb-4">Add Student</h1>
                <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                    <input type="text" name="name" id="name" className="border p-2 rounded w-full" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mb-4">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-700">Grade</label>

                    <select name="grade" id="gradeSelect" className="border p-2 rounded w-full" value={grade} onChange={(e) => setGrade(e.target.value)}>
                        <option value="">Select a grade</option>
                        <option value="1">Grade 1</option>
                        <option value="2">Grade 2</option>
                        <option value="3">Grade 3</option>
                        <option value="4">Grade 4</option>
                        <option value="5">Grade 5</option>
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                    </select>
                </div>
                <div className="mb-4">
                    <label htmlFor="busNumber" className="block text-sm font-medium text-gray-700">Bus Number</label>

                    <select name="busNumber" id="busNumberSelect" className="border p-2 rounded w-full" value={busNumber} onChange={(e) => setBusNumber(e.target.value)}>
                        <option value="">Select a bus</option>
                        <option value="1">Bus 1</option>
                        <option value="2">Bus 2</option>
                        <option value="3">Bus 3</option>
                    </select>

                </div>

                <div className="mb-4">
                    <label htmlFor="parentName" className="block text-sm font-medium text-gray-700">Parent's Name</label>
                    <input type="text" name="parentName" id="parentName" className="border p-2 rounded w-full" value={parentName} onChange={(e) => setParentName(e.target.value)} />
                </div>

                <div className="mb-4">
                    <label htmlFor="parentPhone" className="block text-sm font-medium text-gray-700">Parent's Phone</label>
                    <input type="text" name="parentPhone" id="parentPhone" className="border p-2 rounded w-full" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
                </div>


                {/* Pick Up location */}
                <LocationPicker setPickupLocation={(location) => {
                    console.log(location)
                    if (location) {
                        setPickupLocation({ lat: location.lat, lng: location.lng, address: `${location.lat}, ${location.lng}` });
                    } else {
                        setPickupLocation({ lat: null, lng: null, address: '' });
                    }
                }} />

                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Add Student</button>
            </form>
        </div>
    );

}

export default AddStudentPage






