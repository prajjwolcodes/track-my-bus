"use client"

import { useAuth } from '@/app/context/authContext'
import { db } from '@/firebase/firebase'
import { uploadSignedImage } from '@/utils/uploadSigned'
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    Timestamp,
    writeBatch,
    query,
    where
} from 'firebase/firestore'
import dynamic from 'next/dynamic'
import { useEffect, useState } from "react"

const LocationPicker = dynamic(() => import('./LocationPicker'), { ssr: false });

const AddStudentPage: React.FC = () => {
    const { user } = useAuth()
    const schoolId = user?.schoolId ?? null

    const [name, setName] = useState('')
    const [grade, setGrade] = useState('')
    const [busNumber, setBusNumber] = useState('')
    const [parentName, setParentName] = useState('')
    const [parentPhone, setParentPhone] = useState('')
    const [photo, setPhoto] = useState<File | null>(null)
    const [buses, setBuses] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [pickupLocation, setPickupLocation] = useState({
        lat: null as number | null,
        lng: null as number | null,
        address: ''
    })

    // ID Generator consistent with AddDriver
    const generateId = (prefix: 'STU', schoolId: string) => {
        const date = new Date()
        const yy = String(date.getFullYear()).slice(2)
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        const datePart = yy + mm + dd
        const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()
        return `${schoolId}-${prefix}-${datePart}-${randomSuffix}`
    }

    // Fetch buses (filtered by school)
    useEffect(() => {
        if (!user) return
        async function fetchBuses() {
            const q = query(
                collection(db, "buses"),
                where("schoolId", "==", user?.schoolId)
            )

            const snapshot = await getDocs(q)

            const busList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            setBuses(busList)
        }
        fetchBuses()
    }, [user])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!user || !user.schoolId || loading) return

        // Basic validation
        if (!name || !grade || !busNumber) {
            alert("Fill all required fields")
            return
        }

        const selectedBus = buses.find(b => b.busNo === busNumber)
        if (!selectedBus) {
            alert("Bus not found")
            return
        }

        try {
            setLoading(true)

            // 1. Upload Photo to specific 'students' folder
            const photoUrl = photo ? await uploadSignedImage(photo, 'students') : null

            const batch = writeBatch(db)

            // Create student
            const studentId = generateId('STU', user.schoolId)
            const studentRef = doc(collection(db, "students"), studentId)

            const studentData = {
                studentId: studentId,
                busId: selectedBus.id, 
                name,
                grade: Number(grade),
                parentName,
                busNo: busNumber,
                parentPhone,
                photo: photoUrl,
                pickupLocation,
                createdAt: Timestamp.now(),
            }

            batch.set(studentRef, studentData)

            // Update bus
            const busRef = doc(db, "buses", selectedBus.id)

            batch.update(busRef, {
                students: arrayUnion({
                    studentId: studentId,
                    name,
                    photo: photoUrl,
                    pickupLocation
                })
            })

            await batch.commit()

            alert("Student added!")

            // Reset form
            setName('')
            setGrade('')
            setBusNumber('')
            setParentName('')
            setParentPhone('')
            setPhoto(null)
            setPickupLocation({ lat: null, lng: null, address: '' })

        } catch (err) {
            console.error(err)
            alert("Something went wrong")
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col w-full bg-gray-100 items-center justify-center min-h-screen">
            <form className="border max-w-3xl p-5" onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold mb-4">Add Student</h1>

                <input
                    placeholder="Student Name"
                    className="border p-2 rounded w-full mb-4"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <select
                    className="border p-2 rounded w-full mb-4"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                >
                    <option value="">Select Grade</option>
                    {[...Array(10)].map((_, i) => (
                        <option key={i} value={i + 1}>
                            Grade {i + 1}
                        </option>
                    ))}
                </select>

                <select
                    className="border p-2 rounded w-full mb-4"
                    value={busNumber}
                    onChange={(e) => setBusNumber(e.target.value)}
                >
                    <option value="">Select bus</option>
                    {buses.map(bus => (
                        <option key={bus.id} value={bus.busNo}>
                            Bus {bus.busNo} ({bus.plateNo})
                        </option>
                    ))}
                </select>

                <input
                    placeholder="Parent Name"
                    className="border p-2 rounded w-full mb-4"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                />

                <input
                    placeholder="Parent Phone"
                    className="border p-2 rounded w-full mb-4"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                />

                <div>
                    <label className="text-sm font-medium text-gray-600 ml-1">Student Photo</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="border p-2 rounded-xl w-full mt-1"
                        onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    />
                </div>

                <LocationPicker setPickupLocation={(location) => {
                    if (location) {
                        setPickupLocation({
                            lat: location.lat,
                            lng: location.lng,
                            address: `${location.lat},${location.lng}` || ''
                        })
                    } else {
                        setPickupLocation({ lat: null, lng: null, address: '' })
                    }
                }} />

                <button
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded w-full"
                >
                    {loading ? "Adding..." : "Add Student"}
                </button>
            </form>
        </div>
    )
}

export default AddStudentPage