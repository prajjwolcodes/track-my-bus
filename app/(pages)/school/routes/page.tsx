"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { Plus, Route, BusFront, MapPin } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

type RouteItem = {
  id: string;
  routeId?: string;
  routeNo?: string;
  routeName?: string;
  stops?: string[];
  busId?: string | null;
};

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
  routeNo?: string | null;
};

function generateRouteId(schoolId: string) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${schoolId}-ROUTE-${yy}${mm}${dd}-${random}`;
}

export default function RoutesPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);

  const [openAdd, setOpenAdd] = useState(false);
  const [loading, setLoading] = useState(false);

  const [routeNo, setRouteNo] = useState("");
  const [routeName, setRouteName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [stopsText, setStopsText] = useState("");

  useEffect(() => {
    if (!schoolId) return;

    const routesQuery = query(
      collection(db, "routes"),
      where("schoolId", "==", schoolId)
    );

    const busesQuery = query(
      collection(db, "buses"),
      where("schoolId", "==", schoolId)
    );

    const unsubRoutes = onSnapshot(routesQuery, (snap) => {
      setRoutes(
        snap.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<RouteItem, "id">),
        }))
      );
    });

    const unsubBuses = onSnapshot(busesQuery, (snap) => {
      setBuses(
        snap.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<BusItem, "id">),
        }))
      );
    });

    return () => {
      unsubRoutes();
      unsubBuses();
    };
  }, [schoolId]);

  const handleCreateRoute = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!schoolId) return;

    const normalizedRouteNo = routeNo.trim();
    if (!normalizedRouteNo) {
      alert("Route number is required");
      return;
    }

    const stops = stopsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    try {
      setLoading(true);

      const routeId = generateRouteId(schoolId);

      await setDoc(doc(db, "routes", routeId), {
        routeId,
        routeNo: normalizedRouteNo,
        routeName: routeName.trim() || `Route ${normalizedRouteNo}`,
        schoolId,
        busId: selectedBusId || null,
        stops,
        createdAt: serverTimestamp(),
      });

      if (selectedBusId) {
        await updateDoc(doc(db, "buses", selectedBusId), {
          routeNo: normalizedRouteNo,
        });
      }

      setRouteNo("");
      setRouteName("");
      setSelectedBusId("");
      setStopsText("");
      setOpenAdd(false);
    } catch (error) {
      console.error(error);
      alert("Failed to create route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Routes</h1>
          <p className="text-gray-500 mt-1">
            Create routes, add stops, and assign a bus.
          </p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-2xl shadow-md transition"
        >
          <Plus size={20} />
          <span className="font-medium">Add Route</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {routes.map((routeItem) => {
          const bus = buses.find((entry) => entry.id === routeItem.busId);
          const stops = routeItem.stops ?? [];

          return (
            <div
              key={routeItem.id}
              className="bg-white rounded-3xl border shadow-sm p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-500">Route Number</p>
                  <h2 className="text-xl font-bold text-gray-900 mt-1">
                    {routeItem.routeNo || "--"}
                  </h2>
                </div>
                <Route className="text-rose-600" size={22} />
              </div>

              <p className="mt-3 text-sm text-gray-700 font-medium">
                {routeItem.routeName || "Untitled Route"}
              </p>

              <div className="mt-5 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <BusFront size={16} />
                  <span>
                    {bus ? `Bus ${bus.busNo || bus.plateNo || bus.id}` : "No bus assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span>{stops.length} stops</span>
                </div>
              </div>

              {stops.length > 0 && (
                <div className="mt-4 rounded-xl bg-gray-50 border p-3">
                  <p className="text-xs text-gray-500 mb-2">Stops</p>
                  <div className="space-y-1">
                    {stops.slice(0, 4).map((stop, index) => (
                      <p key={`${routeItem.id}-${index}`} className="text-sm text-gray-700">
                        {index + 1}. {stop}
                      </p>
                    ))}
                    {stops.length > 4 && (
                      <p className="text-xs text-gray-500">+{stops.length - 4} more</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {routes.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <h3 className="text-xl font-semibold text-gray-800">No Routes Added</h3>
          <p className="text-gray-500 mt-2">
            Create your first route to organize bus movement.
          </p>
        </div>
      )}

      {openAdd && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 pt-16">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6">
            <h3 className="text-2xl font-bold text-gray-900">Add Route</h3>
            <p className="text-sm text-gray-500 mt-1">
              Define route details and optionally assign a bus.
            </p>

            <form onSubmit={handleCreateRoute} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Route Number
                  </label>
                  <input
                    type="text"
                    value={routeNo}
                    onChange={(e) => setRouteNo(e.target.value)}
                    placeholder="e.g. R-12"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Route Name
                  </label>
                  <input
                    type="text"
                    value={routeName}
                    onChange={(e) => setRouteName(e.target.value)}
                    placeholder="e.g. North Zone Morning"
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Assign Bus (Optional)
                </label>
                <select
                  value={selectedBusId}
                  onChange={(e) => setSelectedBusId(e.target.value)}
                  className="w-full border p-2 rounded focus:ring-2 focus:ring-rose-400 focus:outline-none"
                >
                  <option value="">Choose Bus</option>
                  {buses.map((bus) => (
                    <option key={bus.id} value={bus.id}>
                      Bus {bus.busNo || "--"} ({bus.plateNo || "No Plate"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Stops (One per line)
                </label>
                <textarea
                  rows={6}
                  value={stopsText}
                  onChange={(e) => setStopsText(e.target.value)}
                  placeholder="Stop 1\nStop 2\nStop 3"
                  className="w-full border p-3 rounded focus:ring-2 focus:ring-rose-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpenAdd(false)}
                  className="px-6 py-2 bg-gray-300 rounded-xl hover:bg-gray-400 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Route"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}