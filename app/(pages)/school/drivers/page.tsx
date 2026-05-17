"use client";

import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  deleteDoc,
} from "firebase/firestore";

import {
  UserPlus,
  Phone,
  BusFront,
  Search,
  User,
  Route,
  X,
  IdCard,
  MoreVertical,
  Pencil,
  Trash2
} from "lucide-react";

import AddDriver from "../components/modals/AddDriver";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});


type DriverItem = {
  id: string;
  name?: string;
  phone?: string;
  photo?: string;
  photoUrl?: string;
  busId?: string | null;
  driverId?: string;
};

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
  driverId?: string | null;
  routeNo?: string | null;
};

export default function DriversPage() {
  const { user } = useAuth();

  const schoolId = user?.schoolId;

  const [drivers, setDrivers] = useState<DriverItem[]>([]);
  const [buses, setBuses] = useState<BusItem[]>([]);
  const [openDriver, setOpenDriver] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [busFilter, setBusFilter] = useState("");
  const [busOptions, setBusOptions] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

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
          ...(doc.data() as Omit<DriverItem, "id">),
        }))
      );
    });

    return () => unsub();
  }, [schoolId]);

  const handleDeleteDriver = async (id: string) => {
    const confirmDelete = window.confirm("Delete this driver?");
    if (!confirmDelete) return;

    await deleteDoc(doc(db, "drivers", id));
  };

  useEffect(() => {
    if (!schoolId) return;

    const q = query(
      collection(db, "buses"),
      where("schoolId", "==", schoolId)
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<BusItem, "id">),
      }));

      setBuses(data);

      setBusOptions(
        [...new Set(data.map((b) => b.busNo).filter(Boolean))] as string[]
      );
    });

    return () => unsub();
  }, [schoolId]);


  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const assignedBus = buses.find(
        (bus) =>
          bus.id === d.busId ||
          bus.driverId === (d.driverId || d.id)
      );

      const matchesSearch =
        (d.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (d.phone || "").includes(search);

      const matchesBus =
        !busFilter ||
        assignedBus?.busNo === busFilter;

      return matchesSearch && matchesBus;
    });
  }, [drivers, buses, search, busFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className={libreBaskerville.className + " text-3xl font-bold text-slate-900"}>
            Drivers
          </h1>

          <p className={nunito.className + " text-slate-500"}>
            Total count: {filteredDrivers.length}
          </p>
        </div>

        <button
          onClick={() => setOpenDriver(true)}
          className="
            inline-flex items-center gap-2
            w-auto flex-none
            px-4 py-2.5
            rounded-xl border
            bg-emerald-50 text-emerald-700 border-emerald-100
            hover:bg-emerald-100 transition
            ml-auto
          "
        >
          <UserPlus size={18} />

          <span className={nunito.className + " hidden sm:inline font-medium"}>
            Add Driver
          </span>
        </button>
      </div>


      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="relative w-full sm:w-105 md:w-120">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={18}
          />

          <input
            type="text"
            placeholder="Search drivers by name or phone..."
            className={nunito.className + " w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56 sm:ml-auto">
          <select
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            className={nunito.className + " w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"}
          >
            <option value="">All Drivers</option>

            {busOptions.map((bus) => (
              <option key={bus} value={bus}>
                Bus {bus}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {filteredDrivers.map((driver) => {

          const assignedBus = buses.find(
            (bus) =>
              bus.id === driver.busId ||
              bus.driverId === (driver.driverId || driver.id)
          );

          const imageSrc =
            driver.photo ||
            driver.photoUrl;

          return (
            <button
              key={driver.id}
              onClick={() => {
                if (menuOpen === driver.id) return;
                setSelectedDriver({ ...driver, assignedBus });
              }}
              className="relative bg-white border rounded-2xl p-5 text-left shadow-sm hover:shadow-lg transition hover:-translate-y-1"
            >
              <div
                className="absolute top-3 right-3"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() =>
                    setMenuOpen(menuOpen === driver.id ? null : driver.id)
                  }
                  className="p-1 rounded-lg hover:bg-slate-100"
                >
                  <MoreVertical size={18} />
                </button>

                {menuOpen === driver.id && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">

                    <button
                      onClick={() => {
                        setSelectedDriver({ ...driver, assignedBus });
                        setMenuOpen(null);

                        // 👉 Later replace this with edit modal
                        console.log("Edit:", driver.id);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-slate-50"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        handleDeleteDriver(driver.id);
                        setMenuOpen(null);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> Delete
                    </button>

                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">

                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold">
                    {driver.name?.charAt(0)?.toUpperCase() || "D"}
                  </div>
                )}

                <div className="flex flex-col">
                  <h3
                    className={`${libreBaskerville.className} text-xl font-bold px-2 text-slate-900`}
                  >
                    {driver.name?.split("(")[0].trim()}
                  </h3>

                  <div className="flex items-center gap-1 mt-1">
                    <IdCard size={12} className="text-slate-400" />

                    <span
                      className={
                        nunito.className + " text-xs font-medium text-slate-500"
                      }
                    >
                      {driver.driverId || driver.id}
                    </span>
                  </div>
                </div>
              </div>

              <div className={nunito.className + " mt-4 space-y-2 text-xs text-slate-600"}>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />

                  <span className={nunito.className + " font-medium text-slate-700"}>
                    {driver.phone || "--"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BusFront size={14} className="text-slate-400" />

                  <span className={nunito.className + " font-medium text-slate-700"}>
                    {assignedBus?.busNo || "Unassigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Route size={14} className="text-slate-400" />

                  <span className={nunito.className + " font-medium text-slate-700"}>
                    {assignedBus?.routeNo || "N/A"}
                  </span>
                </div>
              </div>
            </button>
          );
        })}

      </div>

      {filteredDrivers.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">

          <h3 className={nunito.className + " text-xl font-semibold text-gray-800"}>
            No Drivers Found
          </h3>

          <p className={nunito.className + " text-gray-500 mt-2"}>
            Drivers matching your filters will appear here.
          </p>

        </div>
      )}


      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative">

            <div className="h-32 bg-linear-to-r from-emerald-50 to-slate-200 relative rounded-t-3xl">

              <button
                onClick={() => setSelectedDriver(null)}
                className="absolute right-4 top-4 p-2 bg-white rounded-full shadow"
              >
                <X size={18} />
              </button>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-20 z-20">

              {selectedDriver.photo || selectedDriver.photoUrl ? (
                <img
                  src={selectedDriver.photo || selectedDriver.photoUrl}
                  className="w-24 h-24 rounded-3xl border-4 border-white object-cover bg-white"
                />
              ) : (
                <div className="w-24 h-24 rounded-3xl bg-emerald-200 text-emerald-700 border border-emerald-100 flex items-center justify-center font-bold text-2xl shadow-xl">
                  {selectedDriver.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center mt-16">
              <h2
                className={`${libreBaskerville.className} text-3xl font-bold text-slate-900`}
              >
                {selectedDriver.name?.split("(")[0].trim()}
              </h2>

              <div className="flex items-center justify-center gap-2 mt-2">
                <p className={`${nunito.className} text-slate-500 text-sm mt-1`}>
                  Driver ID:{" "}
                  <span className={`${nunito.className} font-medium text-slate-700`}>
                    {selectedDriver.driverId || selectedDriver.id}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 p-4">
              <Info
                icon={Phone}
                label="Phone"
                value={selectedDriver.phone}
                className={`${nunito.className}`}
              />
              <Info
                icon={BusFront}
                label="Bus No"
                value={selectedDriver.assignedBus?.busNo}
                className={`${nunito.className}`}
              />
              <Info
                icon={Route}
                label="Route"
                value={selectedDriver.assignedBus?.routeNo}
                className={`${nunito.className}`}
              />
              <Info
                icon={IdCard}
                label="Plate No"
                value={selectedDriver.assignedBus?.plateNo}
                className={`${nunito.className}`}
              />
            </div>
          </div>
        </div>
      )}


      {openDriver && (
        <AddDriver onClose={() => setOpenDriver(false)} />
      )}

    </div>
  );
}

function Info({ icon: Icon, label, value, className }: any) {
  return (
    <div className="bg-slate-50 border rounded-xl p-3">

      <div className={`flex items-center gap-2 text-xs text-slate-400 uppercase ${className}`}>
        <Icon size={12} />
        {label}
      </div>

      <p className={`text-sm font-semibold text-slate-700 mt-1 ${className}`}>
        {value || "N/A"}
      </p>

    </div>
  );
}