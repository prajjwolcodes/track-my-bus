"use client";

import { useAuth } from "@/app/context/authContext";
import { useState, useEffect } from "react";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { UserPlus, BusFront, Users, Map, Route, Activity, CheckCircle2 } from "lucide-react";
import AddBus from "../modals/AddBus";
import AddDriver from "../modals/AddDriver";
import BusAssignment from "../modals/BusAssignment";
import Link from "next/link";
import { Libre_Baskerville, Nunito } from "next/font/google";
import AddStudent from "../modals/AddStudent";
import AddRoute from "../modals/AddRoute";


const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});

export default function DashboardHome() {
  const { user } = useAuth();
  const schoolId = user?.schoolId;
  const [openDriver, setOpenDriver] = useState(false);
  const [openBus, setOpenBus] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [openRoute, setOpenRoute] = useState(false);
  const [openStudent, setOpenStudent] = useState(false);

  const [drivers, setDrivers] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    if (!schoolId) return;
    const qDrivers = query(collection(db, "drivers"), where("schoolId", "==", schoolId));
    const qBuses = query(collection(db, "buses"), where("schoolId", "==", schoolId));
    const qStudents = query(collection(db, "students"), where("schoolId", "==", schoolId));

    const unsubDrivers = onSnapshot(qDrivers, (snap) => setDrivers(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
    const unsubBuses = onSnapshot(qBuses, (snap) => setBuses(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));
    const unsubStudents = onSnapshot(qStudents, (snap) => setStudents(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))));

    return () => { unsubDrivers(); unsubBuses(); unsubStudents(); };
  }, [schoolId]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 space-y-8">
      <header>
        <h1 className={`text-2xl md:text-3xl font-bold text-slate-900 ${libreBaskerville.className}`}>
          Good to see you, {user?.name || "Administrator"}👋
        </h1>

        <p className={`text-slate-500 ${nunito.className}`}>
          Here’s what’s happening across your dashboard today.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Buses",
            val: buses.length,
            bg: "bg-blue-50",
            text: "text-blue-900",
            sub: "text-blue-600",
          },
          {
            label: "Total Drivers",
            val: drivers.length,
            bg: "bg-emerald-50",
            text: "text-emerald-900",
            sub: "text-emerald-600",
          },
          {
            label: "Total Students",
            val: students.length,
            bg: "bg-indigo-50",
            text: "text-indigo-900",
            sub: "text-indigo-600",
          },
          {
            label: "Active Routes",
            val: buses.filter((b) => b.routeNo).length,
            bg: "bg-rose-50",
            text: "text-rose-900",
            sub: "text-rose-600",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`${stat.bg} p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition`}
          >
            <p
              className={`text-sm font-semibold tracking-wide ${stat.sub} ${nunito.className}`}
            >
              {stat.label}
            </p>

            <p
              className={`text-3xl mt-3 font-semibold ${stat.text} ${libreBaskerville.className}`}
            >
              {stat.val}
            </p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Add Driver",
            icon: UserPlus,
            action: () => setOpenDriver(true),
            color:
              "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100",
          },
          {
            label: "Add Student",
            icon: Users,
            action: () => setOpenStudent(true),
            color: "bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100",
          },
          {
            label: "Assign Bus",
            icon: Map,
            action: () => setOpenAssign(true),
            color:
              "bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100",
          },
          {
            label: "Add Route",
            icon: Route,
            action: () => setOpenRoute(true),
            color:
              "bg-rose-50 text-rose-700 border-rose-100 hover:bg-rose-100",
          },
          {
            label: "Live Map",
            icon: Activity,
            href: "/school/live",
            color:
              "bg-slate-900 text-white border-slate-800 hover:bg-slate-800",
          },
        ].map((item, idx) =>
          item.href ? (
            <Link
              key={idx}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${item.color}`}
            >
              <item.icon size={24} />

              <span
                className={`text-xs font-bold tracking-wide ${nunito.className}`}
              >
                {item.label}
              </span>
            </Link>
          ) : (
            <button
              key={idx}
              onClick={item.action}
              className={`flex flex-col items-center justify-center gap-3 p-5 rounded-2xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${item.color}`}
            >
              <item.icon size={24} />

              <span
                className={`text-xs font-bold tracking-wide ${nunito.className}`}
              >
                {item.label}
              </span>
            </button>
          )
        )}
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Live Vehicle Status */}
        <div className="lg:col-span-8 bg-linear-to-br from-white to-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />

                <h3
                  className={`text-xl font-bold text-slate-900 ${libreBaskerville.className}`}
                >
                  Live Vehicle Status
                </h3>
              </div>

              <p
                className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
              >
                Real-time monitoring of active school transportation
              </p>
            </div>

            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-xs font-bold">
              {buses.length} Active
            </div>
          </div>

          {/* Bus Cards */}
          {buses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <BusFront className="w-12 h-12 text-slate-300 mb-4" />

              <h4
                className={`text-lg font-bold text-slate-700 ${libreBaskerville.className}`}
              >
                No buses available
              </h4>

              <p
                className={`text-sm text-slate-500 mt-2 ${nunito.className}`}
              >
                Add buses to start monitoring live transportation activity.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {buses.slice(0, 4).map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Top */}
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <h4
                        className={`text-xl font-bold text-slate-800 ${libreBaskerville.className}`}
                      >
                        Bus {bus.busNo || "N/A"}
                      </h4>

                      <p
                        className={`text-xs text-slate-500 mt-1 ${nunito.className}`}
                      >
                        Route {bus.routeNo || "Unassigned"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>

                      <span className="text-[10px] font-bold uppercase">
                        Moving
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="space-y-3">

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm text-slate-500 ${nunito.className}`}
                      >
                        Driver
                      </span>

                      <span
                        className={`text-sm font-semibold text-slate-700 ${nunito.className}`}
                      >
                        {drivers.find((d) => d.busId === bus.id)?.name ||
                          "Unassigned"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm text-slate-500 ${nunito.className}`}
                      >
                        Status
                      </span>

                      <span
                        className={`text-sm font-semibold text-emerald-600 ${nunito.className}`}
                      >
                        On Route
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm text-slate-500 ${nunito.className}`}
                      >
                        Students
                      </span>

                      <span
                        className={`text-sm font-semibold text-slate-700 ${nunito.className}`}
                      >
                        {
                          students.filter(
                            (s) =>
                              s.busNumber === bus.busNo ||
                              s.busNo === bus.busNo
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-4 bg-linear-to-br from-white to-slate-50 p-6 rounded-3xl border border-slate-200 shadow-sm min-h-125">

          <div className="mb-8">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-violet-600" />

              <h3
                className={`text-xl font-bold text-slate-900 ${libreBaskerville.className}`}
              >
                Recent Activity
              </h3>
            </div>

            <p
              className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
            >
              Latest updates across your transport system
            </p>
          </div>

          {/* Timeline */}
          <div className="relative space-y-8 before:absolute before:left-3.5 before:top-2 before:h-full before:w-0.5 before:bg-slate-200">

            {[
              {
                text: "New driver added to system",
                time: "2m ago",
                color: "bg-emerald-500",
              },
              {
                text: "Bus 102 route updated",
                time: "1h ago",
                color: "bg-blue-500",
              },
              {
                text: "Maintenance alert: Bus 05",
                time: "3h ago",
                color: "bg-rose-500",
              },
              {
                text: "Student registration verified",
                time: "5h ago",
                color: "bg-violet-500",
              },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 relative z-10">

                {/* Dot */}
                <div
                  className={`w-4 h-4 rounded-full ${log.color} mt-1 border-4 border-white shadow-sm`}
                ></div>

                {/* Content */}
                <div className="flex-1">
                  <p
                    className={`text-sm font-semibold text-slate-700 leading-relaxed ${nunito.className}`}
                  >
                    {log.text}
                  </p>

                  <span
                    className={`text-xs text-slate-400 mt-1 inline-block ${nunito.className}`}
                  >
                    {log.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Drivers Section */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">

            <div>
              <h3
                className={`text-xl font-bold text-slate-900 ${libreBaskerville.className}`}
              >
                Drivers
              </h3>

              <p
                className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
              >
                Assigned drivers and active routes
              </p>
            </div>

            {/* View All */}
            <Link
              href="/school/drivers"
              className={`text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition ${nunito.className}`}
            >
              View All →
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Driver
                  </th>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Bus
                  </th>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Route
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">

                      <div className="flex flex-col items-center">
                        <UserPlus className="w-10 h-10 text-slate-300 mb-3" />

                        <h4
                          className={`font-bold text-slate-700 ${libreBaskerville.className}`}
                        >
                          No drivers available
                        </h4>

                        <p
                          className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                        >
                          Add drivers to manage transportation staff.
                        </p>
                      </div>

                    </td>
                  </tr>
                ) : (
                  drivers.slice(0, 3).map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50 transition-colors duration-200"
                    >

                      {/* Driver */}
                      <td className="px-6 py-5">
                        <div>
                          <p
                            className={`font-semibold text-slate-800 ${nunito.className}`}
                          >
                            {d.name || "N/A"}
                          </p>
                        </div>
                      </td>

                      {/* Bus */}
                      <td className="px-6 py-5">
                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">
                          {buses.find((b) => b.id === d.busId)?.busNo || "--"}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="px-6 py-5">
                        <span
                          className={`font-medium text-slate-700 ${nunito.className}`}
                        >
                          {d.routeNo || "--"}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>

        {/* Students Section */}
        <div className="bg-linear-to-br from-white to-slate-50 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">

            <div>
              <h3
                className={`text-xl font-bold text-slate-900 ${libreBaskerville.className}`}
              >
                Students
              </h3>

              <p
                className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
              >
                Registered students and assigned buses
              </p>
            </div>

            {/* View All */}
            <Link
              href="/school/students"
              className={`text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition ${nunito.className}`}
            >
              View All →
            </Link>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Student
                  </th>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Parent
                  </th>

                  <th
                    className={`text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 ${nunito.className}`}
                  >
                    Bus
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {students.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center">

                      <div className="flex flex-col items-center">
                        <Users className="w-10 h-10 text-slate-300 mb-3" />

                        <h4
                          className={`font-bold text-slate-700 ${libreBaskerville.className}`}
                        >
                          No students available
                        </h4>

                        <p
                          className={`text-sm text-slate-500 mt-1 ${nunito.className}`}
                        >
                          Student records will appear here once added.
                        </p>
                      </div>

                    </td>
                  </tr>
                ) : (
                  students.slice(0, 3).map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors duration-200"
                    >

                      <td className="px-6 py-5">
                        <div>
                          <p
                            className={`font-semibold text-slate-800 ${nunito.className}`}
                          >
                            {s.studentName || s.name || "N/A"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`text-sm text-slate-700 ${nunito.className}`}
                        >
                          {s.parentName || "--"}
                        </span>
                      </td>

                      {/* Bus */}
                      <td className="px-6 py-5">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
                          {s.busNumber || s.busNo || "--"}
                        </span>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </div>
      </div>

      {openDriver && <AddDriver onClose={() => setOpenDriver(false)} />}
      {openBus && <AddBus onClose={() => setOpenBus(false)} />}
      {openStudent && (<AddStudent onClose={() => setOpenStudent(false)} />)}
      {openAssign && <BusAssignment onClose={() => setOpenAssign(false)} />}
      {openRoute && (<AddRoute onClose={() => setOpenRoute(false)} schoolId={schoolId ?? ""} buses={buses}
      />
      )}
    </div>
  );
}