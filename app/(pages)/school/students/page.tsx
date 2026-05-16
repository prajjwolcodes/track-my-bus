"use client";

import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import {
  UserPlus,
  BusFront,
  GraduationCap,
  IdCard,
  X,
  Phone,
  User,
  MapPin,
  Search,
} from "lucide-react";
import AddStudent from "../components/modals/AddStudent";
import { Libre_Baskerville, Nunito } from "next/font/google";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400"],
});


export default function StudentsPage() {
  const { user } = useAuth();

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [busFilter, setBusFilter] = useState("");
  const [buses, setBuses] = useState<string[]>([]);
  const [openStudent, setOpenStudent] = useState(false);


  useEffect(() => {
    if (!user?.schoolId) return;

    let q = query(
      collection(db, "students"),
      where("schoolId", "==", user.schoolId)
    );

    return onSnapshot(q, (snap) => {
      let data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      if (busFilter) {
        data = data.filter((s: any) => s.busNo === busFilter);
      }

      setStudents(data);
    });
  }, [user?.schoolId, busFilter]);

  useEffect(() => {
    if (!user?.schoolId) return;

    const q = query(
      collection(db, "students"),
      where("schoolId", "==", user.schoolId)
    );

    return onSnapshot(q, (snap) => {
      const allStudents = snap.docs.map((doc) => doc.data());

      setBuses([
        ...new Set(allStudents.map((s: any) => s.busNo).filter(Boolean)),
      ]);
    });
  }, [user?.schoolId]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.studentId || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.parentName || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [students, search]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen">

      <div className="flex flex-wrap items-center justify-between gap-4">

        <div>
          <h1 className={`${libreBaskerville.className} text-3xl font-bold text-slate-900`}>
            Students
          </h1>
          <p className={`${nunito.className} text-slate-500`}>
            Total count: {students.length}
          </p>
        </div>

        <button
          onClick={() => setOpenStudent(true)}
          className="
    inline-flex items-center gap-2
    w-auto flex-none
    px-4 py-2.5
    rounded-xl border
    bg-indigo-50 text-indigo-700 border-indigo-100
    hover:bg-indigo-100 transition
    ml-auto
  "
        >
          <UserPlus size={18} />

          <span className={`${nunito.className} hidden sm:inline font-medium`}>
            Add Student
          </span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        <div className="relative w-full sm:w-105 md:w-120">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search students by name, ID, or parent..."
            className={`${nunito.className} w-full pl-10 pr-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56 sm:ml-auto">
          <select
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            className={`${nunito.className} w-full px-4 py-2.5 bg-white border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none`}
          >
            <option value="" >All Students</option>

            {buses.map((bus) => (
              <option key={bus} value={bus}>
                Bus {bus}
              </option>
            ))}
          </select>
        </div>

      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

        {filteredStudents.map((s) => {

          const imageSrc =
            s.photo ||
            s.photoUrl;

          return (
            <button
              key={s.id}
              onClick={() => setSelectedStudent(s)}
              className="bg-white border rounded-2xl p-5 text-left shadow-sm hover:shadow-lg transition hover:-translate-y-1"
            >

              <div className="flex items-center gap-3">

                {imageSrc ? (
                  <img
                    src={imageSrc}
                    className="w-16 h-16 rounded-xl object-cover border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
                    {s.name?.charAt(0)?.toUpperCase() || "S"}
                  </div>
                )}

                <div>
                  <h3 className={`${libreBaskerville.className} text-xl font-bold text-slate-900`}>
                    {s.name}
                  </h3>
                  <p className={`${nunito.className} text-xs text-slate-500`}>
                    Grade: {s.grade || "--"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs text-slate-600">

                <div className="flex items-center gap-2">
                  <IdCard size={14} className="text-slate-400" />
                  <span className={`${nunito.className} font-medium text-slate-700`}>
                    {s.studentId}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <BusFront size={14} className="text-slate-400" />
                  <span className={`${nunito.className} font-medium text-slate-700`}>
                    {s.busNo || "Not Assigned"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-400" />
                  <span className={`${nunito.className} font-medium text-slate-700`} >
                    {s.parentName}
                  </span>
                </div>

              </div>

            </button>
          );
        })}
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative">

            <div className="h-32 bg-linear-to-r from-indigo-50 to-slate-200 relative rounded-t-3xl">

              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute right-4 top-4 p-2 bg-white rounded-full shadow"
              >
                <X size={18} />
              </button>

            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-20 z-20">
              {selectedStudent.photo ? (
                <img
                  src={selectedStudent.photo}
                  className="w-12 h-12 rounded-2xl border-4 border-white  object-cover bg-white"
                />
              ) : (
                <div className={`${nunito.className} w-24 h-24 rounded-3xl bg-indigo-200 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold text-2xl shadow-xl`}>
                  {selectedStudent.name?.charAt(0)}
                </div>
              )}
            </div>

            <div className="text-center mt-16">
              <h2 className={`${libreBaskerville.className} text-2xl font-bold text-slate-900`}>
                {selectedStudent.name}
              </h2>

              <p className={`${nunito.className} text-slate-500 text-sm mt-1`}>
                Student ID:{" "}
                <span className={`${nunito.className} font-medium text-slate-700`}>
                  {selectedStudent.studentId}
                </span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2 p-4">

              <Info icon={GraduationCap} label="Grade" value={selectedStudent.grade} className={`${nunito.className}`} />
              <Info icon={BusFront} label="Bus No" value={selectedStudent.busNo} className={`${nunito.className}`} />
              <Info icon={User} label="Parent" value={selectedStudent.parentName} className={`${nunito.className}`} />
              <Info icon={Phone} label="Phone" value={selectedStudent.parentPhone} className={`${nunito.className}`} />

              <Info
                icon={MapPin}
                label="Pickup Location"
                value={
                  selectedStudent.pickupLocation
                    ? `${selectedStudent.pickupLocation.lat.toFixed(4)}, ${selectedStudent.pickupLocation.lng.toFixed(4)}`
                    : "Not Set"
                }
                className={`${nunito.className}`}
              />
            </div>

          </div>
        </div>
      )}

      {openStudent && (
        <AddStudent onClose={() => setOpenStudent(false)} />
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
        {value || "--"}
      </p>
    </div>
  );
}