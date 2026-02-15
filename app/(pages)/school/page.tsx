"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import AddDriver from "./AddDriver";
import AddBus from "./AddBus";
import BusAssignment from "./BusAssignment";

interface Bus {
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

  // Modal states
  const [openDriverModal, setOpenDriverModal] = useState(false);
  const [openBusModal, setOpenBusModal] = useState(false);
  const [openAssignModal, setOpenAssignModal] = useState(false);

  // Data states
  const [schoolName, setSchoolName] = useState("My School");
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  // Loading states
  const [schoolLoading, setSchoolLoading] = useState(true);
  const [driversLoading, setDriversLoading] = useState(true);
  const [busesLoading, setBusesLoading] = useState(true);

  const isBlur = openDriverModal || openBusModal || openAssignModal;
  const loading = schoolLoading || driversLoading || busesLoading;

  // Get school info
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setSchoolLoading(false);
        return;
      }

      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const unsubscribeUser = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const data = snapshot.docs[0].data();
          setSchoolId(data.schoolId);
          setSchoolName(data.schoolName || "My School");
        }
        setSchoolLoading(false);
      });

      return () => unsubscribeUser();
    });

    return () => unsubscribeAuth();
  }, []);

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
        ...(doc.data() as Omit<Bus, "busId">),
      }));
      setBuses(list);
      setBusesLoading(false);
    });

    return () => unsubscribe();
  }, [schoolId]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="p-6 space-y-6 relative max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {schoolName}</h1>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-900 text-white rounded-xl hover:bg-red-700 transition"
        >
          Sign Out
        </button>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
        <button
          onClick={() => setOpenDriverModal(true)}
          className="p-6 bg-green-900 text-white rounded-xl shadow hover:scale-105 transition"
        >
          Add Driver
        </button>

        <button
          onClick={() => setOpenBusModal(true)}
          className="p-6 bg-gray-500 text-white rounded-xl shadow hover:scale-105 transition"
        >
          Add Bus
        </button>

        <button
          onClick={() => setOpenAssignModal(true)}
          className="p-6 bg-indigo-900 text-white rounded-xl shadow hover:scale-105 transition"
        >
          Assign Driver/Route
        </button>

        <button
          onClick={() => router.push("/test")}
          className="p-6 bg-blue-900 text-white rounded-xl shadow hover:scale-105 transition"
        >
          View Data
        </button>
      </div>

      {/* Summary Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <p className="text-gray-500">Total Drivers</p>
          <p className="text-2xl font-bold">{drivers.length}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <p className="text-gray-500">Total Buses</p>
          <p className="text-2xl font-bold">{buses.length}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <p className="text-gray-500">Assigned Drivers</p>
          <p className="text-2xl font-bold">{drivers.filter(d => d.busId).length}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-lg shadow">
          <p className="text-gray-500">Unassigned Buses</p>
          <p className="text-2xl font-bold">{buses.filter(b => !b.driverId).length}</p>
        </div>
      </div>

      {/* Modals */}
      {openDriverModal && <AddDriver onClose={() => setOpenDriverModal(false)} />}
      {openBusModal && <AddBus onClose={() => setOpenBusModal(false)} />}
      {openAssignModal && <BusAssignment onClose={() => setOpenAssignModal(false)} />}

      {/* Blur effect */}
      {isBlur && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"></div>}
    </div>
  );
};

export default School;