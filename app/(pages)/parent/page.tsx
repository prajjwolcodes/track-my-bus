"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Map, BusFront, Users } from "lucide-react";

interface Child {
  studentId: string;
  name: string;
  grade: number;
  busNo: string;
  busId: string;
  photo?: string;
  pickupLocation: { lat: number; lng: number };
}

interface BusType {
  busId: string;
  busNo: string;
  location: { lat: number; lng: number };
  status: "On Time" | "Delayed" | "Arrived";
}

const ParentPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const parentId = user?.uid ?? null;

  const [children, setChildren] = useState<Child[]>([]);
  const [buses, setBuses] = useState<BusType[]>([]);
  const [loadingChildren, setLoadingChildren] = useState(true);
  const [loadingBuses, setLoadingBuses] = useState(true);

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // Fetch children assigned to this parent
  useEffect(() => {
    if (!parentId) return;

    const q = query(collection(db, "children"), where("parentId", "==", parentId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        studentId: doc.id,
        ...(doc.data() as Omit<Child, "studentId">),
      }));
      setChildren(list);
      setSelectedChild(list[0] ?? null); // select first child by default
      setLoadingChildren(false);
    });

    return () => unsubscribe();
  }, [parentId]);

  // Fetch buses assigned to selected child
  useEffect(() => {
    if (!selectedChild) return;

    const q = query(collection(db, "buses"), where("busId", "==", selectedChild.busId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({
        busId: doc.id,
        ...(doc.data() as Omit<BusType, "busId">),
      }));
      setBuses(list);
      setLoadingBuses(false);
    });

    return () => unsubscribe();
  }, [selectedChild]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 relative">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 bg-gray-400 text-black p-8 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, <span className="text-blue-950">{user?.name ?? "Parent"}</span>
          </h1>
          <p className="text-blue-900 text-sm mt-2">
            Track your child’s bus and view their details
          </p>
        </div>
        <LogoutButton />
      </div>

      {/* CHILD SELECTOR */}
      {children.length > 1 && (
        <div className="mb-6">
          <p className="text-gray-600 mb-2">Select Child:</p>
          <select
            value={selectedChild?.studentId}
            onChange={(e) => setSelectedChild(children.find(c => c.studentId === e.target.value) ?? null)}
            className="p-2 rounded border border-gray-300"
          >
            {children.map((child) => (
              <option key={child.studentId} value={child.studentId}>
                {child.name} - Grade {child.grade}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* CHILD INFO */}
      {selectedChild && (
        <div className="flex items-center gap-4 mb-6">
          {selectedChild.photo && (
            <img
              src={selectedChild.photo}
              alt={selectedChild.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold">{selectedChild.name}</h2>
            <p className="text-gray-600">Grade: {selectedChild.grade}</p>
            <p className="text-gray-600">Bus No: {selectedChild.busNo}</p>
          </div>
        </div>
      )}

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <button
          onClick={() => router.push(`/parent/bus/${selectedChild?.busId}`)}
          className="bg-blue-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <BusFront size={28} />
          <span>Track Bus</span>
        </button>

        <Link
          href="/parent/child-details"
          className="bg-cyan-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <Users size={28} />
          <span>View Details</span>
        </Link>

        <button
          onClick={() => router.push("/parent/alerts")}
          className="bg-indigo-800 text-white p-6 rounded-xl shadow-lg flex flex-col items-center gap-3 hover:scale-105 transition"
        >
          <Map size={28} />
          <span>Bus Alerts</span>
        </button>
      </div>

      {/* BUS STATUS */}
      {loadingBuses ? (
        <div>Loading bus info...</div>
      ) : (
        buses.map((bus) => (
          <div key={bus.busId} className="p-4 bg-white rounded-xl shadow mb-4">
            <p className="font-semibold">Bus {bus.busNo}</p>
            <p>Status: 
              <span className={`ml-1 ${
                bus.status === "On Time"
                  ? "text-green-600"
                  : bus.status === "Delayed"
                  ? "text-yellow-600"
                  : "text-blue-600"
              }`}>
                {bus.status}
              </span>
            </p>
            <p>
              Location: Lat {bus.location.lat.toFixed(5)}, Lng {bus.location.lng.toFixed(5)}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default ParentPage;