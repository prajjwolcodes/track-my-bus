"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";

import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";

import {
  UserPlus,
  BusFront,
  GraduationCap,
  IdCard,
  X,
  Phone,
  User,
  MapPin,
} from "lucide-react";

import Link from "next/link";

export default function StudentsPage() {
  const { user } = useAuth();

  const schoolId = user?.schoolId;

  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    if (!schoolId) return;

    const q = query(
      collection(db, "students"),
      where("schoolId", "==", schoolId)
    );

    const unsub = onSnapshot(q, (snap) => {
      setStudents(
        snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => unsub();
  }, [schoolId]);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Details
          </h1>

          <p className="text-gray-500 mt-1">
            Manage all students and transport details.
          </p>
        </div>

        <Link
          href="/school/students/add"
          className="flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-3 rounded-2xl shadow-md transition"
        >
          <UserPlus size={20} />

          <span className="font-medium">
            Add Student
          </span>
        </Link>

      </div>

      {/* STUDENT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">

        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className="bg-white rounded-3xl border shadow-sm overflow-hidden hover:shadow-xl hover:-translate-y-1 transition text-left"
          >

            {/* TOP */}
            <div className="bg-gradient-to-r from-cyan-600 to-blue-600 h-28 relative">

              <div className="absolute left-1/2 -bottom-12 -translate-x-1/2">

                <img
                  src={
                    student.photoUrl ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="Student"
                  className="w-24 h-24 rounded-full border-4 border-white object-cover shadow-md"
                />

              </div>

            </div>

            {/* CONTENT */}
            <div className="pt-16 pb-6 px-6 text-center">

              {/* NAME */}
              <h2 className="text-xl font-bold text-gray-900">
                {student.studentName || "Unknown Student"}
              </h2>

              {/* STUDENT ID */}
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-3">

                <IdCard size={16} />

                <span className="text-sm">
                  {student.studentId || "--"}
                </span>

              </div>

              {/* CLASS */}
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-2">

                <GraduationCap size={16} />

                <span className="text-sm">
                  {student.className || "--"}
                </span>

              </div>

              {/* BUS */}
              <div className="flex items-center justify-center gap-2 text-gray-500 mt-2">

                <BusFront size={16} />

                <span className="text-sm">
                  Bus: {student.busNumber || "--"}
                </span>

              </div>

            </div>

          </button>
        ))}

      </div>

      {/* EMPTY STATE */}
      {students.length === 0 && (
        <div className="bg-white border rounded-3xl p-12 text-center">

          <h3 className="text-xl font-semibold text-gray-800">
            No Students Added
          </h3>

          <p className="text-gray-500 mt-2">
            Add students to start managing transportation.
          </p>

        </div>
      )}

      {/* MODAL */}
      {selectedStudent && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">

          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

            {/* HEADER */}
            <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 h-40">

              <button
                onClick={() => setSelectedStudent(null)}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 p-2 rounded-full text-white"
              >
                <X size={20} />
              </button>

              <div className="absolute left-1/2 -bottom-14 -translate-x-1/2">

                <img
                  src={
                    selectedStudent.photoUrl ||
                    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  }
                  alt="Student"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-lg"
                />

              </div>

            </div>

            {/* BODY */}
            <div className="pt-20 p-8">

              <div className="text-center mb-8">

                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedStudent.studentName}
                </h2>

                <p className="text-gray-500 mt-2">
                  Student Details
                </p>

              </div>

              {/* DETAILS GRID */}
              <div className="grid md:grid-cols-2 gap-4">

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <IdCard size={18} />
                    <span>Student ID</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.studentId || "--"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <GraduationCap size={18} />
                    <span>Class</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.className || "--"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <User size={18} />
                    <span>Parent Name</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.parentName || "--"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Phone size={18} />
                    <span>Parent Contact</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.parentPhone || "--"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <BusFront size={18} />
                    <span>Bus Number</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.busNumber || "--"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <MapPin size={18} />
                    <span>Pickup Location</span>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {selectedStudent.pickupLocation?.address || "--"}
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}