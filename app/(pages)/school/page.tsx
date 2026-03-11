"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AddBus from "./AddBus";
import AddDriver from "./AddDriver";
import BusAssignment from "./BusAssignment";

import { Bus, UserPlus, Users, Map, BusFront } from "lucide-react";

interface BusType {
  busId: string;
  busNo: string;
  plateNo: string;
  driverId?: string | null;
}

interface Driver {
  driverId: string;
  name: string;
  busId?: string | null;
}

const School = () => {
  const router = useRouter();

  const [openDriverModal, setOpenDriverModal] = useState(false);
  const [openBusModal, setOpenBusModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);

  const { user, loading: schoolLoading } = useAuth();
  const schoolId = user?.schoolId ?? null;
  const schoolName = user?.name ?? "My School";

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);

  const [driversLoading, setDriversLoading] = useState(true);
  const [busesLoading, setBusesLoading] = useState(true);

  const isBlur = openDriverModal || openBusModal || openAssignModal;

  // Fetch drivers
  useEffect(() => {
    if (!schoolId) return;

    const q = query(collection(db, "drivers"), where("schoolId", "==", schoolId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        driverId: doc.id,
        ...(doc.data() as Omit<Driver, "driverId">),
      }));
      setDrivers(list);
      setDriversLoading(false);
    });

    return () => unsubscribe();
  }, [schoolId]);

  // Fetch buses
  useEffect(() => {
    if (!schoolId) return;

    const q = query(collection(db, "buses"), where("schoolId", "==", schoolId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        busId: doc.id,
        ...(doc.data() as Omit<BusType, "busId">),
      }));
      setBuses(list);
      setBusesLoading(false);
    });

    return () => unsubscribe();
  }, [schoolId]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 bg-linear-to-r bg-gray-400 text-black p-8 rounded-2xl shadow-xl">

        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-blue-950">{schoolName}</span>
          </h1>

          <p className="text-blue-900 text-sm mt-2">
            Manage your school buses, drivers, and students in one place
          </p>
        </div>
          <LogoutButton />
      </div>


      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <button
          onClick={() => setOpenDriverModal(true)}
          className="bg-linear-to-r from-green-800 to-green-950 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <UserPlus size={28} />
          <span>Add Driver</span>
        </button>

        <button
          onClick={() => setOpenBusModal(true)}
          className="bg-linear-to-r from-gray-700 to-gray-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <BusFront size={28} />
          <span>Add Bus</span>
        </button>

        <Link
          href="/student"
          className="bg-linear-to-r from-cyan-800 to-cyan-950 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <Users size={28} />
          <span>Add Student</span>
        </Link>

        <button
          onClick={() => setOpenAssignModal(true)}
          className="bg-linear-to-r from-indigo-800 to-indigo-950 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <Map size={28} />
          <span>Assign Driver</span>
        </button>

        <button
          onClick={() => router.push("/test")}
          className="bg-linear-to-r from-blue-800 to-blue-950 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <Bus size={28} />
          <span>View Data</span>
        </button>

      </div>


      {/* SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Drivers</p>
          <p className="text-3xl font-bold">{drivers.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Buses</p>
          <p className="text-3xl font-bold">{buses.length}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Assigned Drivers</p>
          <p className="text-3xl font-bold">
            {drivers.filter((d) => d.busId).length}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Unassigned Buses</p>
          <p className="text-3xl font-bold">
            {buses.filter((b) => !b.driverId).length}
          </p>
        </div>

      </div>


      {/* MODALS */}
      {openDriverModal && (
        <AddDriver onClose={() => setOpenDriverModal(false)} />
      )}

      {openBusModal && (
        <AddBus onClose={() => setOpenBusModal(false)} />
      )}

      {openAssignModal && (
        <BusAssignment onClose={() => setOpenAssignModal(false)} />
      )}

      {/* BLUR */}
      {isBlur && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"></div>
      )}

    </div>
  );
};

export default School;