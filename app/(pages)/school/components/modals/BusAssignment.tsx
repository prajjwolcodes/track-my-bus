"use client"

import { useEffect, useState } from "react"
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  runTransaction,
  Transaction
} from "firebase/firestore"

import { db } from "@/firebase/firebase"
import { useAuth } from "@/app/context/authContext"
import { MapPin, X, CheckCircle2 } from "lucide-react"
import { Libre_Baskerville, Nunito } from "next/font/google"

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
})

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

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
  const { user, loading: dataLoading } = useAuth()
  const schoolId = user?.schoolId ?? null

  const [buses, setBuses] = useState<Bus[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [selectedBus, setSelectedBus] = useState("")
  const [selectedDriver, setSelectedDriver] = useState("")
  const [routeNo, setRouteNo] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Fetch buses
  useEffect(() => {
    if (!schoolId) return

    const q = query(collection(db, "buses"), where("schoolId", "==", schoolId))
    const unsub = onSnapshot(q, (snap) => {
      setBuses(snap.docs.map(d => d.data() as Bus))
    })

    return () => unsub()
  }, [schoolId])

  // Fetch drivers
  useEffect(() => {
    if (!schoolId) return

    const q = query(collection(db, "drivers"), where("schoolId", "==", schoolId))
    const unsub = onSnapshot(q, (snap) => {
      setDrivers(snap.docs.map(d => d.data() as Driver))
    })

    return () => unsub()
  }, [schoolId])

  // Auto route fill
  useEffect(() => {
    const bus = buses.find(b => b.busId === selectedBus)
    setRouteNo(bus?.routeNo || "")
  }, [selectedBus, buses])

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!selectedBus) {
      setError("Please select a bus.")
      return
    }

    if (!window.confirm("Confirm assignment?")) return

    try {
      setLoading(true)

      await runTransaction(db, async (tx: Transaction) => {
        const busRef = doc(db, "buses", selectedBus)
        const busSnap = await tx.get(busRef)

        if (!busSnap.exists()) throw new Error("Bus not found")

        const busUpdate: any = {}
        const driverUpdate: any = {}

        if (selectedDriver) {
          const driverRef = doc(db, "drivers", selectedDriver)
          const driverSnap = await tx.get(driverRef)

          if (!driverSnap.exists()) throw new Error("Driver not found")

          busUpdate.driverId = selectedDriver
          driverUpdate.busId = selectedBus
        }

        if (routeNo) {
          busUpdate.routeNo = routeNo
          if (selectedDriver) driverUpdate.routeNo = routeNo
        }

        tx.update(busRef, busUpdate)

        if (selectedDriver) {
          const driverRef = doc(db, "drivers", selectedDriver)
          tx.update(driverRef, driverUpdate)
        }
      })

      onClose()
    } catch (err: any) {
      setError(err.message || "Assignment failed")
    } finally {
      setLoading(false)
    }
  }

  const handleUnassign = async () => {
    if (!selectedBus) return
    if (!window.confirm("Unassign this bus?")) return

    try {
      setLoading(true)

      await runTransaction(db, async (tx) => {
        const busRef = doc(db, "buses", selectedBus)
        const busSnap = await tx.get(busRef)

        if (!busSnap.exists()) return

        const busData = busSnap.data() as Bus

        tx.update(busRef, { driverId: null, routeNo: null })

        if (busData.driverId) {
          const driverRef = doc(db, "drivers", busData.driverId)
          tx.update(driverRef, { busId: null, routeNo: null })
        }
      })

      setSelectedDriver("")
      setRouteNo("")
    } finally {
      setLoading(false)
    }
  }

  if (dataLoading) {
    return (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="w-80 bg-white p-6 rounded-2xl animate-pulse space-y-3">
          <div className="h-6 bg-slate-200 rounded"></div>
          <div className="h-6 bg-slate-200 rounded"></div>
          <div className="h-6 bg-slate-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-start pt-16 z-50">

      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-linear-to-r from-violet-50 to-indigo-50">

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-violet-700" />
            </div>

            <div>
              <h2 className={`text-2xl font-bold text-slate-900 ${libreBaskerville.className}`}>
                Bus Assignment
              </h2>
              <p className={`text-sm text-slate-500 ${nunito.className}`}>
                Assign drivers and routes to buses
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl hover:bg-violet-100 flex items-center justify-center"
          >
            <X className="w-6 h-6 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleAssign} className="p-6 space-y-5">

          {/* Bus */}
          <div>
            <label className={`${libreBaskerville.className} text-sm font-semibold text-slate-700`}>Select Bus</label>
            <select
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full mt-2 border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-violet-100"
            >
              <option value="" className={`${nunito.className}`}>Choose bus</option>
              {buses.map((b) => (
                <option key={b.busId} value={b.busId}>
                  {b.busNo} ({b.plateNo})
                </option>
              ))}
            </select>
          </div>

          {/* Driver */}
          <div>
            <label className={`${libreBaskerville.className} text-sm font-semibold text-slate-700`}>Select Driver</label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full mt-2 border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-violet-100"
            >
              <option value="" className={`${nunito.className}`}>
                Choose driver
                </option>
              {drivers.filter(d => !d.busId).map((d) => (
                <option key={d.driverId} value={d.driverId}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Route */}
          <div>
            <label className={`${libreBaskerville.className} text-sm font-semibold text-slate-700`}>Route No</label>
            <input
              value={routeNo}
              onChange={(e) => setRouteNo(e.target.value)}
              className="w-full mt-2 border border-slate-300 rounded-xl p-3 focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">

            <button
              type="button"
              onClick={handleUnassign}
              className={`${nunito.className} px-5 py-2 rounded-xl bg-red-800 text-white hover:bg-red-700`}
            >
              Unassign
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className={`${nunito.className} px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300`}
              >
                Cancel
              </button>

              <button
                disabled={loading}
                className={`${nunito.className} px-5 py-2 rounded-xl bg-violet-800 text-white hover:bg-violet-700 disabled:opacity-50`}
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