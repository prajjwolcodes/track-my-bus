"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { BusFront, Plus, User, Route as RouteIcon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddBus from "../components/modals/AddBus";
import BusAssignment from "../components/modals/BusAssignment";

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
  driverId?: string | null;
  routeNo?: string | null;
};

type DriverItem = {
  id: string;
  name?: string;
  driverId?: string;
  busId?: string | null;
};

export default function BusesPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [buses, setBuses] = useState<BusItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);

  const [openBusModal, setOpenBusModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    const busesQuery = query(
      collection(db, "buses"),
      where("schoolId", "==", schoolId)
    );

    const driversQuery = query(
      collection(db, "drivers"),
      where("schoolId", "==", schoolId)
    );

    const unsubBuses = onSnapshot(busesQuery, (snap) => {
      setBuses(
        snap.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<BusItem, "id">),
        }))
      );
    });

    const unsubDrivers = onSnapshot(driversQuery, (snap) => {
      setDrivers(
        snap.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<DriverItem, "id">),
        }))
      );
    });

    return () => {
      unsubBuses();
      unsubDrivers();
    };
  }, [schoolId]);

  const assignedCount = useMemo(
    () => buses.filter((bus) => !!bus.driverId).length,
    [buses]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-500 mt-1">
            Add buses and manage driver-route assignment.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenAssignModal(true)}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-2xl shadow-md transition"
          >
            <RouteIcon size={18} />
            <span className="font-medium">Assign Bus</span>
          </button>

          <button
            onClick={() => setOpenBusModal(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl shadow-md transition"
          >
            <Plus size={18} />
            <span className="font-medium">Add Bus</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Total Buses</p>
          <h2 className="text-3xl font-bold mt-2">{buses.length}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Assigned Buses</p>
          <h2 className="text-3xl font-bold mt-2">{assignedCount}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Unassigned Buses</p>
          <h2 className="text-3xl font-bold mt-2">{buses.length - assignedCount}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buses.map((bus) => {
          const assignedDriver = drivers.find(
            (driver) => driver.busId === bus.id || driver.driverId === bus.driverId
          );

          return (
            <div key={bus.id} className="bg-white rounded-3xl border shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Bus Number</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {bus.busNo || "--"}
                  </h2>
                </div>
                <BusFront className="text-blue-600" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between rounded-xl bg-gray-50 p-3 text-sm">
                  <span className="text-gray-500">Plate</span>
                  <span className="font-medium text-gray-800">{bus.plateNo || "--"}</span>
                </div>

                <div className="flex justify-between rounded-xl bg-gray-50 p-3 text-sm">
                  <span className="text-gray-500">Driver</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <User size={14} />
                    {assignedDriver?.name || "Unassigned"}
                  </span>
                </div>

                <div className="flex justify-between rounded-xl bg-gray-50 p-3 text-sm">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium text-gray-800">{bus.routeNo || "--"}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {buses.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800">No Buses Added</h3>
          <p className="text-gray-500 mt-2">
            Add buses to start building your transport network.
          </p>
        </div>
      )}

      {openBusModal && <AddBus onClose={() => setOpenBusModal(false)} />}
      {openAssignModal && <BusAssignment onClose={() => setOpenAssignModal(false)} />}
    </div>
  );
}
