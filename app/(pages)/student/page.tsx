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

  const [selectingLocation, setSelectingLocation] = useState(false)

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
        schoolId: user.schoolId,
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
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 flex items-center justify-center p-6">
      <form
        className="w-full max-w-4xl bg-white rounded-2xl shadow-lg p-8 space-y-8"
        onSubmit={handleSubmit}
      >
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Add Student
        </h1>

        {/* SECTION 1: Student Info */}
        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <p className="text-sm font-semibold text-black uppercase">
            Student Information
          </p>

          {/* Name */}
          <div>
            <input
              placeholder="Student Name"
              className="w-full p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Grade + Bus */}
          <div className="grid grid-cols-2 gap-4">
            <select
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
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
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={busNumber}
              onChange={(e) => setBusNumber(e.target.value)}
            >
              <option value="">Select Bus</option>
              {buses.map((bus) => (
                <option key={bus.id} value={bus.busNo}>
                  Bus {bus.busNo}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* SECTION 2: Parent Info */}
        <div className="bg-gray-50 p-6 rounded-xl space-y-4">
          <p className="text-sm font-semibold text-black uppercase">
            Parent Details
          </p>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Parent Name"
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />

            <input
              placeholder="Phone Number"
              className="p-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl space-y-4">

          <div className="grid grid-cols-2 gap-6 items-start">
            {/* Photo Upload */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Student Photo
              </label>

              <div className="rounded-lg border bg-white p-4 flex flex-col items-center justify-center h-40 space-y-3">

                {/* Preview (optional but looks much better) */}
                {photo ? (
                  <img
                    src={URL.createObjectURL(photo)}
                    alt="preview"
                    className="h-16 w-16 object-cover rounded-full border"
                  />
                ) : (
                  <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 text-sm">
                    No Image
                  </div>
                )}

                {/* Custom Button */}
                <label className="bg-blue-900 text-white px-4 py-2 rounded-md cursor-pointer hover:bg-blue-800 transition text-sm">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Pickup Location
              </label>

              <div className="rounded-lg border bg-white p-4 h-[160px] flex items-center justify-center">

                {/* If map is open */}
                {selectingLocation ? (
                  <div className="w-full h-full rounded-lg overflow-hidden">
                    <LocationPicker
                      setPickupLocation={(location) => {
                        if (location) {
                          setPickupLocation({
                            lat: location.lat,
                            lng: location.lng,
                            address: `${location.lat},${location.lng}`,
                          })
                          setSelectingLocation(false) // close after select
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">

                    {/* Preview / Placeholder */}
                    {pickupLocation.lat ? (
                      <div className="text-sm text-gray-700 text-center">
                        <p className="font-medium">Location Selected</p>
                        <p className="text-xs text-gray-500">
                          {pickupLocation.lat}, {pickupLocation.lng}
                        </p>
                      </div>
                    ) : (
                      <div className="h-16 w-16 flex items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xs">
                        No Location
                      </div>
                    )}

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() => setSelectingLocation(true)}
                      className="bg-blue-900 text-white px-4 py-2 rounded-md hover:bg-blue-800 transition text-sm"
                    >
                      {pickupLocation.lat ? "Change Location" : "Select Location"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-center pt-4">
          <button
            disabled={loading}
            className="px-10 py-3 bg-blue-900 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition"
          >
            {loading ? "Adding..." : "Add Student"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStudentPage