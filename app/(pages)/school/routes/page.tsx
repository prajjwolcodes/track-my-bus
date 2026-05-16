"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { Route, BusFront, MapPin, Plus } from "lucide-react";

import AddRoute from "../components/modals/AddRoute";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});

type RouteItem = {
  id: string;
  routeNo?: string;
  routeName?: string;
  busId?: string | null;
  stops?: string[];
};

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
};

export default function RoutesPage() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);

  const [openRoute, setOpenRoute] = useState(false);

  useEffect(() => {
    if (!schoolId) return;

    const qRoutes = query(
      collection(db, "routes"),
      where("schoolId", "==", schoolId)
    );

    const qBuses = query(
      collection(db, "buses"),
      where("schoolId", "==", schoolId)
    );

    const unsubRoutes = onSnapshot(qRoutes, (snap) => {
      setRoutes(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<RouteItem, "id">),
        }))
      );
    });

    const unsubBuses = onSnapshot(qBuses, (snap) => {
      setBuses(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BusItem, "id">),
        }))
      );
    });

    return () => {
      unsubRoutes();
      unsubBuses();
    };
  }, [schoolId]);

  const totalStops = useMemo(
    () => routes.reduce((acc, r) => acc + (r.stops?.length || 0), 0),
    [routes]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold text-slate-900 ${libreBaskerville.className}`}>
            Routes
          </h1>
          <p className={`text-slate-500 ${nunito.className}`}>
            Total Routes: {routes.length} 
          </p>
        </div>

        <button
          onClick={() => setOpenRoute(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
          bg-rose-50 text-rose-700 border border-rose-100
          hover:bg-rose-100 transition"
        >
          <Plus size={18} />
          <span className={nunito.className + " font-medium"}>
            Add Route
          </span>
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Routes",
            val: routes.length,
            color: "text-rose-700 bg-rose-50",
          },
          {
            label: "Assigned Routes",
            val: routes.filter((r) => r.busId).length,
            color: "text-emerald-700 bg-emerald-50",
          },
          {
            label: "Unassigned Routes",
            val: routes.filter((r) => !r.busId).length,
            color: "text-slate-700 bg-slate-100",
          },
        ].map((s, i) => (
          <div key={i} className={`p-6 rounded-2xl border ${s.color}`}>
            <p className={nunito.className + " text-sm"}>{s.label}</p>
            <p className={libreBaskerville.className + " text-3xl font-bold mt-2"}>
              {s.val}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => {
          const bus = buses.find((b) => b.id === route.busId);

          return (
            <div
              key={route.id}
              className="bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className={`${nunito.className} text-sm text-slate-500`}>Route No</p>
                  <h2 className={`${libreBaskerville.className} text-xl font-bold text-slate-900`}>
                    {route.routeNo || "N/A"}
                  </h2>
                </div>
                <Route className="text-rose-800" />
              </div>

              <p className={`mt-2 font-medium ${nunito.className}`}>
                {route.routeName || "Untitled Route"}
              </p>

              <div className={`${nunito.className} mt-4 space-y-2 text-sm text-slate-600`}>
                <div className="flex items-center gap-2">
                  <BusFront size={14} />
                  <span>
                    {bus?.busNo || "No bus assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin size={14} />
                  <span>{route.stops?.length || 0} stops</span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {routes.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <h3 className={`${libreBaskerville.className} text-xl font-semibold text-slate-800`}>
            No Routes Found
          </h3>
          <p className={`${nunito.className} text-slate-500 mt-2`}>
            Create your first route to organize transport system.
          </p>
        </div>
      )}

      {openRoute && schoolId && (
        <AddRoute
          onClose={() => setOpenRoute(false)}
          buses={buses}
          schoolId={schoolId}
        />
      )}
    </div>
  );
}