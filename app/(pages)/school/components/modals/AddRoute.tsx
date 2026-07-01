"use client";

import { FormEvent, useState } from "react";
import { db } from "@/firebase/firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "sonner";

type BusItem = {
  id: string;
  busNo?: string;
  plateNo?: string;
};

type Props = {
  schoolId: string;
  buses: BusItem[];
  onClose: () => void;
};

function generateRouteId(schoolId: string) {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${schoolId}-ROUTE-${yy}${mm}${dd}-${random}`;
}

export default function AddRoute({ schoolId, buses, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const [routeNo, setRouteNo] = useState("");
  const [routeName, setRouteName] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [stopsText, setStopsText] = useState("");

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!schoolId) {
      toast.error("School ID not loaded yet");
      return;
    }

    const normalizedRouteNo = routeNo.trim();
    if (!normalizedRouteNo) {
      toast.error("Route number is required");
      return;
    }

    const stops = stopsText
      .split("\n")
      .map((s) => s.trim())
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

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-start justify-center p-4 pt-16">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-6">
        <h2 className="text-2xl font-bold">Add Route</h2>
        <p className="text-sm text-gray-500 mt-1">
          Create route and assign a bus (optional)
        </p>

        <form onSubmit={handleCreate} className="mt-6 space-y-4">
          <input
            value={routeNo}
            onChange={(e) => setRouteNo(e.target.value)}
            placeholder="Route Number"
            className="w-full border p-2 rounded"
          />

          <input
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
            placeholder="Route Name"
            className="w-full border p-2 rounded"
          />

          <select
            value={selectedBusId}
            onChange={(e) => setSelectedBusId(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select Bus</option>
            {buses.map((b) => (
              <option key={b.id} value={b.id}>
                Bus {b.busNo || "--"} ({b.plateNo || "--"})
              </option>
            ))}
          </select>

          <textarea
            value={stopsText}
            onChange={(e) => setStopsText(e.target.value)}
            placeholder="Stops (one per line)"
            className="w-full border p-3 rounded"
            rows={6}
          />

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-gray-300 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-rose-800 hover:bg-rose-700 text-white rounded-xl"
            >
              {loading ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}