"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { BusLocationPayload, listenBusLocation } from "@/firebase/rtdb";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Activity, BusFront, Clock, Route, User } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
  driverId?: string | null;
  routeNo?: string | null;
};

type DriverItem = {
  id: string;
  driverId?: string;
  busId?: string | null;
  name?: string;
};

function formatTimestamp(value?: number) {
  if (!value || Number.isNaN(value)) return "--";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function SchoolLivePage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [buses, setBuses] = useState<BusItem[]>([]);
  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [locations, setLocations] = useState<Record<string, BusLocationPayload | null>>({});

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

  useEffect(() => {
    if (buses.length === 0) {
      setLocations({});
      return;
    }

    const unsubs = buses.map((bus) =>
      listenBusLocation(bus.id, (payload) => {
        setLocations((prev) => ({
          ...prev,
          [bus.id]: payload,
        }));
      })
    );

    return () => {
      unsubs.forEach((unsubscribe) => unsubscribe());
    };
  }, [buses]);

  const activeTrips = useMemo(
    () => Object.values(locations).filter((entry) => entry?.tripActive === true).length,
    [locations]
  );

  const reportingBuses = useMemo(
    () => Object.values(locations).filter((entry) => !!entry).length,
    [locations]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Bus Tracking</h1>
          <p className="text-gray-500 mt-1">
            Monitor trip activity and latest GPS updates for each bus.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-sm font-semibold">
          <Activity size={16} />
          Real-time
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Fleet Size</p>
          <h2 className="text-3xl font-bold mt-2">{buses.length}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">Active Trips</p>
          <h2 className="text-3xl font-bold mt-2">{activeTrips}</h2>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border">
          <p className="text-sm text-gray-500">GPS Reporting</p>
          <h2 className="text-3xl font-bold mt-2">{reportingBuses}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buses.map((bus) => {
          const location = locations[bus.id];
          const assignedDriver = drivers.find(
            (driver) => driver.busId === bus.id || driver.driverId === bus.driverId
          );

          return (
            <div key={bus.id} className="bg-white rounded-3xl border shadow-sm p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">Bus</p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    {bus.busNo || bus.plateNo || bus.id}
                  </h2>
                </div>

                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    location?.tripActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {location?.tripActive ? "In Trip" : "Idle"}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="rounded-xl bg-gray-50 p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <User size={14} /> Driver
                  </span>
                  <span className="font-medium text-gray-800">{assignedDriver?.name || "--"}</span>
                </div>

                <div className="rounded-xl bg-gray-50 p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Route size={14} /> Route
                  </span>
                  <span className="font-medium text-gray-800">{bus.routeNo || "--"}</span>
                </div>

                <div className="rounded-xl bg-gray-50 p-3 text-sm space-y-1.5">
                  <p className="text-gray-500 flex items-center gap-1">
                    <BusFront size={14} /> Last Coordinates
                  </p>
                  <p className="font-medium text-gray-800">
                    {typeof location?.lat === "number" ? location.lat.toFixed(5) : "--"},{" "}
                    {typeof location?.lng === "number" ? location.lng.toFixed(5) : "--"}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-3 flex items-center justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-1">
                    <Clock size={14} /> Updated
                  </span>
                  <span className="font-medium text-gray-800">
                    {formatTimestamp(location?.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {buses.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800">No Buses Found</h3>
          <p className="text-gray-500 mt-2">
            Add buses first to monitor live movements.
          </p>
        </div>
      )}
    </div>
  );
}
