"use client"

import { useEffect, useState } from "react"
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    runTransaction,
    getDoc
} from "firebase/firestore"
import { db, auth } from "@/firebase/firebase"
import { onAuthStateChanged } from "firebase/auth"

interface Props {
    onClose: () => void
}

interface Bus {
    busId: string
    busNo: string
    plateNo: string
    driverId?: string | null
    routeNo?: string | null
    schoolId: string
}

interface Driver {
    driverId: string
    name: string
    busId?: string | null
    routeNo?: string | null
    schoolId: string
}

const BusAssignment = ({ onClose }: Props) => {
    const [schoolId, setSchoolId] = useState<string | null>(null)
    const [buses, setBuses] = useState<Bus[]>([])
    const [drivers, setDrivers] = useState<Driver[]>([])
    const [selectedBus, setSelectedBus] = useState("")
    const [selectedDriver, setSelectedDriver] = useState("")
    const [routeNo, setRouteNo] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [dataLoading, setDataLoading] = useState(true)

    // 1️⃣ Get logged-in user's schoolId directly from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return
            try {
                const userRef = doc(db, "users", user.uid)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    setSchoolId(userSnap.data().schoolId)
                }
            } catch (err) {
                console.error("Error fetching schoolId:", err)
            } finally {
                setDataLoading(false)
            }
        })

        return () => unsubscribe()
    }, [])

    // 2️⃣ Fetch buses
    useEffect(() => {
        if (!schoolId) return

        const q = query(collection(db, "buses"), where("schoolId", "==", schoolId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                busId: doc.id,
                ...(doc.data() as Omit<Bus, "busId">)
            }))
            setBuses(list)
        })

        return () => unsubscribe()
    }, [schoolId])

    // 3️⃣ Fetch drivers
    useEffect(() => {
        if (!schoolId) return

        const q = query(collection(db, "drivers"), where("schoolId", "==", schoolId))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const list = snapshot.docs.map((doc) => ({
                driverId: doc.id,
                ...(doc.data() as Omit<Driver, "driverId">)
            }))
            setDrivers(list)
        })

        return () => unsubscribe()
    }, [schoolId])

    // 4️⃣ Auto-fill route if bus has one
    useEffect(() => {
        if (!selectedBus) return
        const bus = buses.find((b) => b.busId === selectedBus)
        setRouteNo(bus?.routeNo || "")
    }, [selectedBus])

    // 5️⃣ Assign driver to bus safely using transaction
    const handleAssign = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!selectedBus) {
            setError("Please select a bus.")
            return
        }

        if (!window.confirm("Are you sure?")) return

        try {
            setLoading(true)
            await runTransaction(db, async (transaction) => {
                const busRef = doc(db, "buses", selectedBus)
                const busSnap = await transaction.get(busRef)
                if (!busSnap.exists()) throw new Error("Bus not found")

                // Prepare fields to update
                const busUpdate: any = {}
                const driverUpdate: any = {}

                if (selectedDriver) {
                    const driverRef = doc(db, "drivers", selectedDriver)
                    const driverSnap = await transaction.get(driverRef)
                    if (!driverSnap.exists()) throw new Error("Driver not found")
                    const driverData = driverSnap.data()
                    if (driverData?.busId && driverData.busId !== selectedBus) {
                        throw new Error("Driver already assigned to another bus")
                    }

                    busUpdate.driverId = selectedDriver
                    driverUpdate.busId = selectedBus
                }

                if (routeNo) {
                    busUpdate.routeNo = routeNo
                    if (selectedDriver) driverUpdate.routeNo = routeNo
                }

                // Update bus
                transaction.update(busRef, busUpdate)

                // Update driver if assigned
                if (selectedDriver) {
                    const driverRef = doc(db, "drivers", selectedDriver)
                    transaction.update(driverRef, driverUpdate)
                }
            })

            onClose()
        } catch (err: any) {
            setError(err.message || "Assignment failed")
        } finally {
            setLoading(false)
        }
    }

    // 6️⃣ Unassign driver from bus
    const handleUnassign = async () => {
        if (!selectedBus) return
        if (!window.confirm("Are you sure you want to unassign this bus?")) return

        try {
            setLoading(true)
            await runTransaction(db, async (transaction) => {
                const busRef = doc(db, "buses", selectedBus)
                const busSnap = await transaction.get(busRef)
                if (!busSnap.exists()) return
                const busData = busSnap.data()
                if (!busData.driverId) return
                const driverRef = doc(db, "drivers", busData.driverId)
                transaction.update(busRef, { driverId: null, routeNo: null })
                transaction.update(driverRef, { busId: null, routeNo: null })
            })
            setSelectedDriver("")
            setRouteNo("")
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (dataLoading) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white w-80 p-6 rounded-xl shadow-lg animate-pulse">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start pt-16 z-50">
            <div className="bg-white w-full max-w-2xl p-6 rounded-3xl shadow-2xl space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold text-gray-800">Manage Bus Assignment</h2>
                </div>

                <form onSubmit={handleAssign} className="space-y-4">
                    {/* Select Bus */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-600">Select Bus</label>
                        <select
                            value={selectedBus}
                            onChange={(e) => setSelectedBus(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="">Choose Bus</option>
                            {buses.map((bus) => (
                                <option key={bus.busId} value={bus.busId}>
                                    {bus.busNo} ({bus.plateNo})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Driver */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-600">Select Driver</label>
                        <select
                            value={selectedDriver}
                            onChange={(e) => setSelectedDriver(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        >
                            <option value="">Choose Driver</option>
                            {drivers.filter((d) => !d.busId).map((driver) => (
                                <option key={driver.driverId} value={driver.driverId}>
                                    {driver.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Route */}
                    <div>
                        <label className="block mb-1 font-medium text-gray-600">Route Number</label>
                        <input
                            type="text"
                            value={routeNo}
                            onChange={(e) => setRouteNo(e.target.value)}
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="flex justify-between pt-2">
                        <button
                            type="button"
                            onClick={handleUnassign}
                            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                        >
                            Unassign
                        </button>

                        <div className="flex gap-3">
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
                                {loading ? "Processing..." : "Assign"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default BusAssignment