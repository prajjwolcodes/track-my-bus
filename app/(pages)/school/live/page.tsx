"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { BusLocationPayload, listenBusLocation } from "@/firebase/rtdb";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import type { DivIcon, Icon } from "leaflet";
import { Activity, BusFront, Clock, Route, User } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOMServer from "react-dom/server";
import { TbBusFilled } from "react-icons/tb";

const SchoolLiveMap = dynamic(() => import("./SchoolLiveMap.tsx"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center text-sm text-gray-500">
      Loading map...
    </div>
  ),
});

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

type MovingBus = {
  bus: BusItem;
  driver: DriverItem | undefined;
  location: BusLocationPayload & { lat: number; lng: number };
};

type FocusTarget = {
  busId: string;
  lat: number;
  lng: number;
  nonce: number;
};

function toFiniteNumber(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

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
  const [markerIcon, setMarkerIcon] = useState<Icon | DivIcon | null>(null);
  const [focusTarget, setFocusTarget] = useState<FocusTarget | null>(null);
  const mapSectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    import("leaflet").then((L) => {
      const svgString = ReactDOMServer.renderToString(<TbBusFilled size={26} />);

      const icon = L.divIcon({
        html: svgString,
        className: "lucide-marker",
        iconSize: [42, 42],
        iconAnchor: [21, 21],
      });

      setMarkerIcon(icon);
    });
  }, []);

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

  const movingBuses = useMemo<MovingBus[]>(() => {
    return buses
      .map((bus) => {
        const location = locations[bus.id];
        if (!location || location.tripActive !== true) return null;

        const lat = toFiniteNumber((location as { lat?: unknown }).lat);
        const lng = toFiniteNumber((location as { lng?: unknown }).lng);

        if (lat === null || lng === null) return null;

        const assignedDriver = drivers.find(
          (driver) => driver.busId === bus.id || driver.driverId === bus.driverId
        );

        return {
          bus,
          driver: assignedDriver,
          location: {
            ...location,
            lat,
            lng,
          },
        };
      })
      .filter((entry): entry is MovingBus => entry !== null);
  }, [buses, drivers, locations]);

  const movingBusById = useMemo(() => {
    return new Map(movingBuses.map((entry) => [entry.bus.id, entry]));
  }, [movingBuses]);

  function handleLocateBus(busId: string) {
    const movingBus = movingBusById.get(busId);
    if (!movingBus) return;

    setFocusTarget({
      busId,
      lat: movingBus.location.lat,
      lng: movingBus.location.lng,
      nonce: Date.now(),
    });

    mapSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8 h-full">


      <div ref={mapSectionRef} className="bg-white relative h-full rounded-3xl border shadow-sm overflow-hidden">
        {/* <div className="p-6 border-b flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">School Live Map</h2>
            <p className="text-sm text-gray-500 mt-1">
              Showing only buses that are currently moving.
            </p>
          </div>
       
        </div> */}
        <span className="text-sm z-1000 absolute top-6 right-6 font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700">
          {movingBuses.length} Moving
        </span>

        <div className="h-full w-full">
          <SchoolLiveMap
            movingBuses={movingBuses}
            markerIcon={markerIcon}
            focusTarget={focusTarget}
            formatTimestamp={formatTimestamp}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {buses.map((bus) => {
          const location = locations[bus.id];
          const assignedDriver = drivers.find(
            (driver) => driver.busId === bus.id || driver.driverId === bus.driverId
          );
          const isMoving = movingBusById.has(bus.id);

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
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${location?.tripActive
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

                <button
                  type="button"
                  onClick={() => handleLocateBus(bus.id)}
                  disabled={!isMoving}
                  className="w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Locate Bus in map
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
