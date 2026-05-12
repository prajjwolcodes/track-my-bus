"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import { UserPlus, Phone, BusFront } from "lucide-react";

import AddDriver from "../components/modals/AddDriver";

export default function DriversPage() {
  const { user } = useAuth();

  const schoolId = user?.schoolId;

  const [drivers, setDrivers] = useState<any[]>([]);
  const [openDriver, setOpenDriver] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    const q = query(
      collection(db, "drivers"),
      where("schoolId", "==", schoolId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setDrivers(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [schoolId]);

  return (
    <div className="space-y-8">

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        {/* LEFT */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Driver Details
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all school drivers and assigned buses.
          </p>
        </div>

        {/* RIGHT */}
        <button
          onClick={() => setOpenDriver(true)}
          className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl shadow-md transition"
        >
          <UserPlus size={20} />

          <span className="font-medium">
            Add Driver
          </span>
        </button>

      </div>

      {/* DRIVER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

        {drivers.map((driver) => (
          <div
            key={driver.id}
            className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-lg transition"
          >

            {/* TOP IMAGE */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 h-28 relative">

              <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">

                <img
                  src={
                    driver.photoUrl ||
                    "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  }
                  alt="Driver"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                />

              </div>

            </div>

            {/* CONTENT */}
            <div className="pt-16 pb-6 px-6 text-center">

              {/* NAME */}
              <h2 className="text-xl font-bold text-gray-900">
                {driver.name || "Unknown Driver"}
              </h2>

              {/* PHONE */}
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-3">

                <Phone size={16} />

                <span className="text-sm">
                  {driver.phone || "No phone"}
                </span>

              </div>

              {/* BUS DETAILS */}
              <div className="mt-5 space-y-3">

                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">

                  <span className="text-sm text-gray-500">
                    Assigned Bus
                  </span>

                  <span className="font-semibold text-gray-800">
                    {driver.busCode || "--"}
                  </span>

                </div>

                <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">

                  <div className="flex items-center gap-2 text-gray-500">
                    <BusFront size={16} />

                    <span className="text-sm">
                      Bus Number
                    </span>
                  </div>

                  <span className="font-semibold text-gray-800">
                    {driver.busNumber || "--"}
                  </span>

                </div>

              </div>

            </div>
          </div>
        ))}

      </div>

      {/* EMPTY STATE */}
      {drivers.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">

          <h3 className="text-xl font-semibold text-gray-800">
            No Drivers Added
          </h3>

          <p className="text-gray-500 mt-2">
            Add your first driver to start managing transportation.
          </p>

        </div>
      )}

      {/* MODAL */}
      {openDriver && (
        <AddDriver onClose={() => setOpenDriver(false)} />
      )}

    </div>
  );
}