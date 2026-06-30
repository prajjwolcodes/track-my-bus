'use client'

import React, { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { useAuth } from '@/app/context/authContext'
import { uploadSignedImage } from '@/utils/uploadSigned'
import { UserPlus, Plus, Trash2, X, Upload } from 'lucide-react'
import { Libre_Baskerville, Nunito } from 'next/font/google'

const libreBaskerville = Libre_Baskerville({
  subsets: ['latin'],
  weight: ['400', '700'],
})

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
})

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

  const [drivers, setDrivers] = useState<DriverForm[]>([
    {
      name: '',
      phone: '',
      photo: null,
    },
  ])

  const [loading, setLoading] = useState(false)

  // Add new driver
  const addNewDriver = () => {
    setDrivers([
      ...drivers,
      {
        name: '',
        phone: '',
        photo: null,
      },
    ])
  }

  // Remove driver
  const removeDriver = (index: number) => {
    setDrivers(drivers.filter((_, i) => i !== index))
  }

  // Handle change
  const handleDriverChange = (
    index: number,
    field: 'name' | 'phone' | 'photo',
    value: any
  ) => {
    const updated = [...drivers]
    updated[index][field] = value
    setDrivers(updated)
  }

  // Generate ID
  const generateId = (prefix: 'BUS' | 'DR', schoolId: string) => {
    const date = new Date()

    const yy = String(date.getFullYear()).slice(2)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')

    const datePart = yy + mm + dd

    const randomSuffix = Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase()

    return `${schoolId}-${prefix}-${datePart}-${randomSuffix}`
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!schoolId) {
      return alert('School ID not loaded yet')
    }

    setLoading(true)

    let hasError = false

    const validated = drivers.map((d) => {
      if (!d.name.trim() || !d.phone.trim()) {
        hasError = true

        return {
          ...d,
          error: 'Please fill all fields',
        }
      }

      return {
        ...d,
        error: undefined,
      }
    })

    setDrivers(validated)

    if (hasError) {
      setLoading(false)
      return
    }

    try {
      const uploadPromises = validated.map(async (d) => {
        const driverId = generateId('DR', schoolId)

        const photoUrl = d.photo
          ? await uploadSignedImage(d.photo, 'drivers')
          : null

        return setDoc(doc(db, 'drivers', driverId), {
          driverId,
          role: 'driver',
          name: d.name,
          phone: d.phone,
          photo: photoUrl,
          busId: null,
          routeNo: null,
          schoolId,
          createdAt: Timestamp.now(),
        })
      })

      await Promise.all(uploadPromises)

      alert('Drivers added successfully!')
      onClose()
    } catch (err) {
      console.error(err)
      alert('Failed to save drivers.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center px-4 py-10 overflow-y-auto">

      {/* Modal */}
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-linear-to-r from-emerald-50 to-green-50">

          <div>
            <div className="flex items-center gap-4">

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-emerald-700" />
              </div>

              {/* Text */}
              <div>
                <h2
                  className={`text-3xl font-bold text-slate-900 ${libreBaskerville.className}`}
                >
                  Add Drivers
                </h2>

                <p
                  className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                >
                  Manage and register transportation staff
                </p>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
           className="w-10 h-10 rounded-2xl hover:bg-emerald-200 transition flex items-center justify-center"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-4 space-y-4"
        >

          {/* Add More */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={addNewDriver}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-900 hover:bg-emerald-700 text-white text-sm font-semibold transition ${nunito.className}`}
            >
              <Plus className="w-4 h-4" />
              Add More
            </button>
          </div>

          {/* Driver Cards */}
          <div className="space-y-6">

            {drivers.map((driver, index) => (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 relative"
              >

                {/* Remove */}
                {drivers.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDriver(index)}
                    className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                {/* Driver Label */}
                <div className="mb-5">
                  <h3
                    className={`text-lg font-bold text-slate-800 ${libreBaskerville.className}`}
                  >
                    Driver {index + 1}
                  </h3>

                  <p
                    className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                  >
                    Enter driver details.
                  </p>
                </div>

                {/* Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Name */}
                  <div>
                    <label
                      className={`block text-sm font-semibold text-slate-700 mb-2 ${nunito.className}`}
                    >
                      Driver Name
                    </label>

                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={driver.name}
                      onChange={(e) =>
                        handleDriverChange(
                          index,
                          'name',
                          e.target.value
                        )
                      }
                      className={`w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition ${nunito.className}`}
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      className={`block text-sm font-semibold text-slate-700 mb-2 ${nunito.className}`}
                    >
                      Phone Number
                    </label>

                    <input
                      type="text"
                      placeholder="Enter phone number"
                      value={driver.phone}
                      onChange={(e) =>
                        handleDriverChange(
                          index,
                          'phone',
                          e.target.value
                        )
                      }
                      className={`w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 outline-none transition ${nunito.className}`}
                    />
                  </div>

                  {/* Photo */}
                  <div className="md:col-span-2">
                    <label
                      className={`block text-sm font-semibold text-slate-700 mb-2 ${nunito.className}`}
                    >
                      Driver Photo
                    </label>

                    <label className="flex items-center justify-center gap-3 border-2 border-dashed border-slate-300 rounded-2xl p-6 bg-white hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer">

                      <Upload className="w-5 h-5 text-emerald-600" />

                      <span
                        className={`text-sm text-slate-600 ${nunito.className}`}
                      >
                        {driver.photo
                          ? driver.photo.name
                          : 'Upload driver image'}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          handleDriverChange(
                            index,
                            'photo',
                            e.target.files?.[0] || null
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                {/* Error */}
                {driver.error && (
                  <p
                    className={`text-sm text-red-500 mt-3 ${nunito.className}`}
                  >
                    {driver.error}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-100">

            <button
              type="button"
              onClick={onClose}
              className={`px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition ${nunito.className}`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-xl bg-emerald-900 hover:bg-emerald-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${nunito.className}`}
            >
              {loading
                ? 'Saving...'
                : drivers.length === 1
                ? 'Save Driver'
                : 'Save Drivers'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddDriver