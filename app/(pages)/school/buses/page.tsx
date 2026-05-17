"use client";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  BusFront,
  Plus,
  User,
  Route as RouteIcon,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AddBus from "../components/modals/AddBus";
import BusAssignment from "../components/modals/BusAssignment";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
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
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editBusData, setEditBusData] = useState<any>({});

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
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BusItem, "id">),
        }))
      );
    });

    const unsubDrivers = onSnapshot(driversQuery, (snap) => {
      setDrivers(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<DriverItem, "id">),
        }))
      );
    });

    return () => {
      unsubBuses();
      unsubDrivers();
    };
  }, [schoolId]);

  const handleUpdateBus = async () => {
    if (!selectedBus?.id) return;

    try {
      await updateDoc(doc(db, "buses", selectedBus.id), {
        busNo: editBusData.busNo || "",
        plateNo: editBusData.plateNo || "",
        routeNo: editBusData.routeNo || "",
        driverId: editBusData.driverId || null,
      });

      setIsEditing(false);
      setSelectedBus(null);
      setEditBusData({});

    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteBus = async (id: string) => {
    const confirmDelete = window.confirm("Delete this bus?");

    if (!confirmDelete) return;

    await deleteDoc(doc(db, "buses", id));
  };

  const driverMap = useMemo(() => {
    const map = new Map<string, DriverItem>();
    drivers.forEach((d) => map.set(d.busId || "", d));
    return map;
  }, [drivers]);

  const assignedCount = useMemo(
    () => buses.filter((b) => !!b.driverId).length,
    [buses]
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">

      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`${libreBaskerville.className} text-3xl font-bold text-slate-900`}>
            Buses
          </h1>
          <p className={`${nunito.className} text-slate-500`}>
            Manage fleet and driver assignments
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setOpenAssignModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-violet-50 text-violet-700 border border-violet-100 hover:bg-violet-100 transition"
          >
            <RouteIcon size={18} />
            <span className={`${nunito.className} font-semibold`}>
              Assign
            </span>
          </button>

          <button
            onClick={() => setOpenBusModal(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition"
          >
            <Plus size={18} />
            <span className={`${nunito.className} font-semibold`}>
              Add Bus
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-blue-200/30 rounded-2xl p-4 md:p-5 border shadow-sm">          <p className={`${nunito.className} text-slate-500 text-sm`}>
          Total Buses
        </p>
          <h2 className={`${libreBaskerville.className} text-3xl md:text-3xl font-bold mt-2 text-slate-900`}>
            {buses.length}
          </h2>
        </div>

        <div className=" bg-emerald-200/30 rounded-2xl p-4 md:p-5 border shadow-sm">
          <p className={`${nunito.className} text-slate-500 text-sm`}>
            Assigned
          </p>
          <h2 className={`${libreBaskerville.className} text-3xl md:text-3xl font-bold mt-2 text-emerald-600`}>
            {assignedCount}
          </h2>
        </div>

        <div className=" bg-rose-200/30 rounded-2xl p-4 md:p-5 border shadow-sm">
          <p className={`${nunito.className} text-slate-500 text-sm`}>
            Unassigned
          </p>
          <h2 className={`${libreBaskerville.className} text-3xl md:text-3xl font-bold mt-2 text-rose-600`}>
            {buses.length - assignedCount}
          </h2>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {buses.map((bus) => {
          const assignedDriver = drivers.find(
            (d) => d.busId === bus.id || d.driverId === bus.driverId
          );

          return (
            <div
              key={bus.id}
              className="relative bg-white border rounded-3xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="absolute top-4 right-4">
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === bus.id ? null : bus.id)
                  }
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen === bus.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">

                    <button
                      onClick={() => {
                        setSelectedBus(bus);
                        setEditBusData(bus);
                        setIsEditing(true);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        handleDeleteBus(bus.id);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>

                  </div>
                )}
              </div>

              <div className="flex items-start justify-between">
                <div>
                  <h3 className={`${libreBaskerville.className} text-xl font-bold text-slate-900`}>
                    Bus {bus.busNo || "--"}
                  </h3>
                  <p className={`${nunito.className} text-xs text-slate-500`}>
                    Route {bus.routeNo || "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">

                <div className="flex justify-between bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500">Plate</span>
                  <span className="font-medium text-slate-700">
                    {bus.plateNo || "--"}
                  </span>
                </div>

                <div className="flex justify-between bg-slate-50 p-3 rounded-xl">
                  <span className="text-slate-500">Driver</span>
                  <span className="font-medium text-slate-700 flex items-center gap-1">
                    <User size={14} />
                    {assignedDriver?.name || "Unassigned"}
                  </span>
                </div>

              </div>
            </div>
          );
        })}

      </div>

      {buses.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">
          <h3 className={`${nunito.className} text-lg font-semibold text-slate-700`}>
            No Buses Found
          </h3>
          <p className={`${nunito.className} text-slate-500 mt-2`}>
            Start by adding buses to your system
          </p>
        </div>
      )}

      {openBusModal && <AddBus onClose={() => setOpenBusModal(false)} />}
      {openAssignModal && <BusAssignment onClose={() => setOpenAssignModal(false)} />}

      {selectedBus && isEditing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 space-y-4">

            <h2 className="text-xl font-bold">Edit Bus</h2>

            {/* Bus No */}
            <input
              value={editBusData.busNo || ""}
              onChange={(e) =>
                setEditBusData({ ...editBusData, busNo: e.target.value })
              }
              placeholder="Bus No"
              className="w-full p-2 border rounded-lg"
            />

            {/* Plate No */}
            <input
              value={editBusData.plateNo || ""}
              onChange={(e) =>
                setEditBusData({ ...editBusData, plateNo: e.target.value })
              }
              placeholder="Plate No"
              className="w-full p-2 border rounded-lg"
            />

            <input
              value={editBusData.routeNo || ""}
              onChange={(e) =>
                setEditBusData({ ...editBusData, routeNo: e.target.value })
              }
              placeholder="Route No"
              className="w-full p-2 border rounded-lg"
            />

            <select
              value={editBusData.driverId || ""}
              onChange={(e) =>
                setEditBusData({ ...editBusData, driverId: e.target.value })
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Unassigned</option>

              {drivers.map((d) => {
                const isAssignedToOtherBus =
                  buses.some(
                    (b) => b.driverId === d.id && b.id !== selectedBus.id
                  );

                return (
                  <option
                    key={d.id}
                    value={d.id}
                    disabled={isAssignedToOtherBus}
                  >
                    {d.name}
                    {isAssignedToOtherBus ? " (Assigned)" : ""}
                  </option>
                );
              })}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setSelectedBus(null);
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleUpdateBus}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}