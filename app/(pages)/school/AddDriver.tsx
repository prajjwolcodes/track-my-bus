'use client'

import React, { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { useAuth } from '@/app/context/authContext'
import { uploadSignedImage } from '@/utils/uploadSigned'

interface DriverForm {
  name: string
  phone: string
  photo?: File | null
  error?: string
}

interface Props {
  onClose: () => void
}

const AddDriver: React.FC<Props> = ({ onClose }) => {
  const { user } = useAuth()
  const schoolId = user?.schoolId ?? null
  const [drivers, setDrivers] = useState<DriverForm[]>([{ name: '', phone: '', photo: null }])
  const [loading, setLoading] = useState(false)

  // Add/remove driver row
  const addNewDriver = () => setDrivers([...drivers, { name: '', phone: '', photo: null }])
  const removeDriver = (index: number) => setDrivers(drivers.filter((_, i) => i !== index))

  // Update input
  const handleDriverChange = (index: number, field: 'name' | 'phone' | 'photo', value: any) => {
    const updated = [...drivers]
    updated[index][field] = value
    setDrivers(updated)
  }

  // Generate unique ID: SCH123-DR-240623-AB
  const generateId = (prefix: 'BUS' | 'DR', schoolId: string) => {
    const date = new Date()
    const yy = String(date.getFullYear()).slice(2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    const datePart = yy + mm + dd

    const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()

    return `${schoolId}-${prefix}-${datePart}-${randomSuffix}`
  }

  // Save all drivers at once
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!schoolId) return alert('School ID not loaded yet')
    setLoading(true)

    let hasError = false
    const validated = drivers.map(d => {
      if (!d.name.trim() || !d.phone.trim()) {
        hasError = true
        return { ...d, error: 'At least one driver is required' }
      }
      return { ...d, error: undefined }
    })
    setDrivers(validated)
    if (hasError) return setLoading(false)

    try {
      for (const d of validated) {
        const driverId = generateId('DR', schoolId!)
        await setDoc(doc(db, 'drivers', driverId), {
          driverId: driverId,
          name: d.name,
          phone: d.phone,
          photo: d.photo ? await uploadSignedImage(d.photo) : null,
          busId: null,
          routeNo: null,
          schoolId,
          createdAt: Timestamp.now()
        })
      }
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to save drivers.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start pt-16 z-50 overflow-auto">
      <div className="bg-white w-full max-w-2xl p-6 rounded-3xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">Add Drivers</h2>
          <button
            type="button"
            onClick={addNewDriver}
            className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-700 transition-all"
          >
            +
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {drivers.map((driver, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl p-4 relative shadow-sm hover:shadow-md transition"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-600 font-medium mb-1 block">Driver Name</label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    value={driver.name}
                    onChange={(e) => handleDriverChange(index, 'name', e.target.value)}
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-gray-600 font-medium mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    placeholder="Enter Phone"
                    value={driver.phone}
                    onChange={(e) => handleDriverChange(index, 'phone', e.target.value)}
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-gray-600 font-medium mb-1 block">Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleDriverChange(index, 'photo', e.target.files?.[0] || null)}
                    className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  />
                </div>
              </div>

              {driver.error && <p className="text-red-500 text-sm mt-1">{driver.error}</p>}

              {drivers.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDriver(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDriver