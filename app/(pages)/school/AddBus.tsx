'use client'

import React, { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { useAuth } from '@/app/context/authContext'

interface BusForm {
    busNo: string
    plateNo: string
    error?: string
}

interface Props {
    onClose: () => void
}

const AddBus: React.FC<Props> = ({ onClose }) => {
    const { user } = useAuth()
    const schoolId = user?.schoolId ?? null
    const [buses, setBuses] = useState<BusForm[]>([{ busNo: '', plateNo: '' }])
    const [loading, setLoading] = useState(false)

    // Add new bus row
    const addNewBus = () => setBuses([...buses, { busNo: '', plateNo: '' }])

    // Remove a bus row
    const removeBus = (index: number) => setBuses(buses.filter((_, i) => i !== index))

    // Handle input change
    const handleBusChange = (index: number, field: 'busNo' | 'plateNo', value: string) => {
        const updated = [...buses]
        updated[index][field] = value
        setBuses(updated)
    }

    // generate unique ID: SCH123-BUS-240623-AB 
    const generateId = (prefix: 'BUS' | 'DR', schoolId: string) => {
        const date = new Date()
        const yy = String(date.getFullYear()).slice(2)
        const mm = String(date.getMonth() + 1).padStart(2, '0')
        const dd = String(date.getDate()).padStart(2, '0')
        const datePart = yy + mm + dd

        const randomSuffix = Math.random().toString(36).substring(2, 4).toUpperCase()

        return `${schoolId}-${prefix}-${datePart}-${randomSuffix}`
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!schoolId) return alert('School ID not loaded yet')
        setLoading(true)

        let hasError = false
        const validated = buses.map(bus => {
            if (!bus.busNo.trim() || !bus.plateNo.trim()) {
                hasError = true
                return { ...bus, error: 'At least one bus is required' }
            }
            return { ...bus, error: undefined }
        })
        setBuses(validated)
        if (hasError) return setLoading(false)

        try {
            for (const bus of validated) {
                const busId = generateId('BUS', schoolId!)
                await setDoc(doc(db, 'buses', busId), {
                    busId: busId,
                    busNo: bus.busNo,
                    plateNo: bus.plateNo,
                    routeNo: null,
                    driverId: null,
                    students: [],
                    schoolId,
                    createdAt: Timestamp.now()
                })
            }
            alert('Buses added successfully!')
            onClose()
        } catch (err) {
            console.error(err)
            alert('Failed to save buses. Check console.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start pt-16 z-50">
            <div className="bg-white w-full max-w-2xl p-6 rounded-3xl shadow-2xl space-y-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Add Buses</h2>
                    <button
                        type="button"
                        onClick={addNewBus}
                        className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-green-700 transition-all"
                    >
                        +
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {buses.map((bus, index) => (
                        <div
                            key={index}
                            className="border border-gray-200 rounded-2xl p-4 relative shadow-sm hover:shadow-md transition"
                        >
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-600 font-medium mb-1 block">Bus Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Bus Number"
                                        value={bus.busNo}
                                        onChange={(e) => handleBusChange(index, 'busNo', e.target.value)}
                                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-600 font-medium mb-1 block">Plate Number</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Plate Number"
                                        value={bus.plateNo}
                                        onChange={(e) => handleBusChange(index, 'plateNo', e.target.value)}
                                        className="border p-2 rounded w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {bus.error && <p className="text-red-500 text-sm mt-1">{bus.error}</p>}

                            {buses.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeBus(index)}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}

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

export default AddBus