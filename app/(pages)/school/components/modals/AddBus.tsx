'use client'

import React, { useState } from 'react'
import { doc, setDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/firebase/firebase'
import { useAuth } from '@/app/context/authContext'
import { toast } from 'sonner'
import { BusFront, Plus, Trash2, X } from 'lucide-react'
import { Libre_Baskerville, Nunito } from 'next/font/google'

const libreBaskerville = Libre_Baskerville({
    subsets: ['latin'],
    weight: ['400', '700'],
})

const nunito = Nunito({
    subsets: ['latin'],
    weight: ['400', '600', '700'],
})

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

    const [buses, setBuses] = useState<BusForm[]>([
        { busNo: '', plateNo: '' },
    ])

    const [loading, setLoading] = useState(false)

    // Add new row
    const addNewBus = () => {
        setBuses([...buses, { busNo: '', plateNo: '' }])
    }

    // Remove row
    const removeBus = (index: number) => {
        setBuses(buses.filter((_, i) => i !== index))
    }

    // Handle input
    const handleBusChange = (
        index: number,
        field: 'busNo' | 'plateNo',
        value: string
    ) => {
        const updated = [...buses]
        updated[index][field] = value
        setBuses(updated)
    }

    // Generate unique ID
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
            return toast.error('School ID not loaded yet')
        }

        setLoading(true)

        let hasError = false

        const validated = buses.map((bus) => {
            if (!bus.busNo.trim() || !bus.plateNo.trim()) {
                hasError = true

                return {
                    ...bus,
                    error: 'Please fill all fields',
                }
            }

            return {
                ...bus,
                error: undefined,
            }
        })

        setBuses(validated)

        if (hasError) {
            setLoading(false)
            return
        }

        try {
            for (const bus of validated) {
                const busId = generateId('BUS', schoolId)

                await setDoc(doc(db, 'buses', busId), {
                    busId,
                    name: `Bus No: ${bus.busNo} - ${busId}`,
                    busNo: bus.busNo,
                    plateNo: bus.plateNo,
                    routeNo: null,
                    driverId: null,
                    students: [],
                    schoolId,
                    createdAt: Timestamp.now(),
                })
            }

            toast.success('Buses added successfully!')
            onClose()
        } catch (err) {
            console.error(err)
            toast.error('Failed to save buses.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center px-4 py-10 overflow-y-auto">

            {/* Modal */}
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-slate-100 bg-linear-to-r from-blue-50 to-indigo-50">

                    <div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                                <BusFront className="w-6 h-6 text-blue-700" />
                            </div>

                            <div>
                                <h2
                                    className={`text-3xl font-bold text-slate-900 ${libreBaskerville.className}`}
                                >
                                    Add Buses
                                </h2>

                                <p
                                    className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                                >
                                    Add and manage school transportation vehicles
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl hover:bg-blue-200 transition flex items-center justify-center"
                    >
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="p-4 space-y-4"
                >

                    {/* Add Button */}
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addNewBus}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-700 text-white text-sm font-semibold transition ${nunito.className}`}
                        >
                            <Plus className="w-4 h-4" />
                            Add More
                        </button>
                    </div>

                    {/* Bus Cards */}
                    <div className="space-y-6">

                        {buses.map((bus, index) => (
                            <div
                                key={index}
                                className="border border-slate-200 rounded-2xl p-5 bg-slate-50 hover:bg-white hover:shadow-md transition-all duration-300 relative"
                            >

                                {/* Remove */}
                                {buses.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeBus(index)}
                                        className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Bus Label */}
                                <div className="mb-5">
                                    <h3
                                        className={`text-lg font-bold text-slate-800 ${libreBaskerville.className}`}
                                    >
                                        Bus {index + 1}
                                    </h3>

                                    <p
                                        className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                                    >
                                        Enter bus details.
                                    </p>
                                </div>

                                {/* Inputs */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                                    {/* Bus Number */}
                                    <div>
                                        <label
                                            className={`block text-sm font-semibold text-slate-700 mb-2 ${nunito.className}`}
                                        >
                                            Bus Number
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Bus number"
                                            value={bus.busNo}
                                            onChange={(e) =>
                                                handleBusChange(
                                                    index,
                                                    'busNo',
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition ${nunito.className}`}
                                        />
                                    </div>

                                    {/* Plate Number */}
                                    <div>
                                        <label
                                            className={`block text-sm font-semibold text-slate-700 mb-2 ${nunito.className}`}
                                        >
                                            Plate Number
                                        </label>

                                        <input
                                            type="text"
                                            placeholder="Ba 2 Kha 1234"
                                            value={bus.plateNo}
                                            onChange={(e) =>
                                                handleBusChange(
                                                    index,
                                                    'plateNo',
                                                    e.target.value
                                                )
                                            }
                                            className={`w-full rounded-xl border border-slate-300 px-4 py-3 bg-white text-slate-700 placeholder:text-slate-400 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition ${nunito.className}`}
                                        />
                                    </div>
                                </div>

                                {/* Error */}
                                {bus.error && (
                                    <p
                                        className={`text-sm text-red-500 mt-3 ${nunito.className}`}
                                    >
                                        {bus.error}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-4 pt-2 border-t border-slate-100">

                        <button
                            type="button"
                            onClick={onClose}
                            className={`px-4 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition ${nunito.className}`}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`px-4 py-3 rounded-xl bg-blue-900 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${nunito.className}`}
                        >
                            {loading
                                ? 'Saving...'
                                : buses.length === 1
                                    ? 'Save Bus'
                                    : 'Save Buses'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default AddBus