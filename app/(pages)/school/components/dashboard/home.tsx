"use client";

import { useAuth } from "@/app/context/authContext";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  UserPlus,
  BusFront,
  Users,
  Map,
} from "lucide-react";

import AddBus from "../modals/AddBus";
import AddDriver from "../modals/AddDriver";
import BusAssignment from "../modals/BusAssignment";

import Link from "next/link";

export default function DashboardHome() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [openDriver, setOpenDriver] = useState(false);
  const [openBus, setOpenBus] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    if (!schoolId) return;

    const q1 = query(
      collection(db, "drivers"),
      where("schoolId", "==", schoolId)
    );

    const q2 = query(
      collection(db, "buses"),
      where("schoolId", "==", schoolId)
    );

    const unsub1 = onSnapshot(q1, (snap) =>
      setDrivers(snap.docs.map((d) => d.data()))
    );

    const unsub2 = onSnapshot(q2, (snap) =>
      setBuses(snap.docs.map((d) => d.data()))
    );

    return () => {
      unsub1();
      unsub2();
    };
  }, [schoolId]);

  return (
    <div className="space-y-6 pb-10">

      {/* HERO SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

        {/* LEFT IMAGE SECTION */}
        <div className="xl:col-span-3 h-[380px] rounded-3xl overflow-hidden relative bg-gradient-to-r from-blue-900 to-cyan-700">

          <img
            src="https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop"
            alt="School Bus"
            className="w-full h-full object-cover opacity-40"
          />

          <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">

            <h1 className="text-4xl font-bold mb-3">
              Welcome Back 👋
            </h1>

            <p className="max-w-xl text-white/90 text-lg">
              Manage buses, students, drivers, and live routes
              efficiently from one unified dashboard.
            </p>

          </div>
        </div>

        {/* RIGHT ACTION PANEL */}
        <div className="flex flex-col gap-4">

          <button
            onClick={() => setOpenDriver(true)}
            className="flex items-center gap-3 rounded-2xl bg-green-600 p-5 text-white shadow-md hover:scale-[1.02] transition"
          >
            <UserPlus size={22} />
            <span className="font-semibold">Add Driver</span>
          </button>

          <button
            onClick={() => setOpenBus(true)}
            className="flex items-center gap-3 rounded-2xl bg-blue-600 p-5 text-white shadow-md hover:scale-[1.02] transition"
          >
            <BusFront size={22} />
            <span className="font-semibold">Add Bus</span>
          </button>

          <Link
            href="/school/students"
            className="flex items-center gap-3 rounded-2xl bg-cyan-600 p-5 text-white shadow-md hover:scale-[1.02] transition"
          >
            <Users size={22} />
            <span className="font-semibold">Students</span>
          </Link>

          <button
            onClick={() => setOpenAssign(true)}
            className="flex items-center gap-3 rounded-2xl bg-indigo-600 p-5 text-white shadow-md hover:scale-[1.02] transition"
          >
            <Map size={22} />
            <span className="font-semibold">Assign Bus</span>
          </button>

        </div>
      </div>

      {/* ANALYTICS + MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ANALYTICS */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">
              Total Buses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {buses.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">
              Total Drivers
            </p>

            <h2 className="text-3xl font-bold mt-2">
              {drivers.length}
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">
              Assigned Buses
            </p>

            <h2 className="text-3xl font-bold mt-2">
              12
            </h2>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border">
            <p className="text-sm text-gray-500">
              Active Routes
            </p>

            <h2 className="text-3xl font-bold mt-2">
              8
            </h2>
          </div>

        </div>

        {/* LIVE MAP */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border">

          <div className="flex items-center justify-between mb-4">

            <h3 className="font-semibold text-lg">
              Live Bus Tracking
            </h3>

            <span className="text-sm text-green-600 font-medium">
              Live
            </span>

          </div>

          <div className="h-[260px] rounded-xl overflow-hidden bg-gray-100">

            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2070&auto=format&fit=crop"
              alt="Map"
              className="w-full h-full object-cover"
            />

          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* DRIVER TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-5 border-b">
            <h3 className="font-semibold text-lg">
              Driver Details
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">

                <tr>
                  <th className="text-left p-4">Driver</th>
                  <th className="text-left p-4">Bus</th>
                  <th className="text-left p-4">Route</th>
                </tr>

              </thead>

              <tbody>

                {drivers.slice(0, 5).map((driver, idx) => (
                  <tr
                    key={idx}
                    className="border-t hover:bg-gray-50"
                  >

                    <td className="p-4 font-medium">
                      {driver.name || "N/A"}
                    </td>

                    <td className="p-4">
                      {driver.busNumber || "--"}
                    </td>

                    <td className="p-4">
                      {driver.route || "--"}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          </div>
        </div>

        {/* STUDENT TABLE */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-5 border-b">
            <h3 className="font-semibold text-lg">
              Student Details
            </h3>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-600">

                <tr>
                  <th className="text-left p-4">Student</th>
                  <th className="text-left p-4">Parent</th>
                  <th className="text-left p-4">Bus</th>
                </tr>

              </thead>

              <tbody>

                <tr className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    Ram Sharma
                  </td>

                  <td className="p-4">
                    Shyam Sharma
                  </td>

                  <td className="p-4">
                    12A
                  </td>
                </tr>

                <tr className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    Sita Karki
                  </td>

                  <td className="p-4">
                    Hari Karki
                  </td>

                  <td className="p-4">
                    14B
                  </td>
                </tr>

              </tbody>

            </table>
          </div>
        </div>
      </div>

      {/* MODALS */}
      {openDriver && (
        <AddDriver onClose={() => setOpenDriver(false)} />
      )}

      {openBus && (
        <AddBus onClose={() => setOpenBus(false)} />
      )}

      {openAssign && (
        <BusAssignment onClose={() => setOpenAssign(false)} />
      )}

    </div>
  );
}