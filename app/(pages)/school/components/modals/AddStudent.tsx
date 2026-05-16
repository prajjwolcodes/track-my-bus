"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/context/authContext";
import { db } from "@/firebase/firebase";
import { uploadSignedImage } from "@/utils/uploadSigned";
import {
    arrayUnion,
    collection,
    doc,
    getDocs,
    Timestamp,
    writeBatch,
    query,
    where,
} from "firebase/firestore";
import { Users, Plus, Trash2, X, Upload } from "lucide-react";
import { Libre_Baskerville, Nunito } from "next/font/google";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("../LocationPicker"), {
    ssr: false,
});

const libreBaskerville = Libre_Baskerville({
    subsets: ["latin"],
    weight: ["400", "700"],
});

const nunito = Nunito({
    subsets: ["latin"],
    weight: ["400", "600", "700"],
});

type LatLng = {
    lat: number;
    lng: number;
};

interface StudentForm {
    name: string;
    grade: string;
    busNumber: string;
    parentName: string;
    parentPhone: string;
    photo: File | null;
    pickupLocation?: LatLng | null;
}

interface Props {
    onClose: () => void;
}

const AddStudent: React.FC<Props> = ({ onClose }) => {
    const { user } = useAuth();
    const schoolId = user?.schoolId ?? null;

    const [students, setStudents] = useState<StudentForm[]>([
        {
            name: "",
            grade: "",
            busNumber: "",
            parentName: "",
            parentPhone: "",
            photo: null,
            pickupLocation: null,
        },
    ]);

    const [buses, setBuses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const generateId = (prefix: "STU", schoolId: string) => {
        const date = new Date();
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        const random = Math.random().toString(36).substring(2, 4).toUpperCase();
        return `${schoolId}-${prefix}-${yy}${mm}${dd}-${random}`;
    };

    useEffect(() => {
        if (!schoolId) return;

        (async () => {
            const q = query(collection(db, "buses"), where("schoolId", "==", schoolId));
            const snap = await getDocs(q);
            setBuses(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        })();
    }, [schoolId]);

    const addStudentRow = () => {
        setStudents([
            ...students,
            {
                name: "",
                grade: "",
                busNumber: "",
                parentName: "",
                parentPhone: "",
                photo: null,
                pickupLocation: null,
            },
        ]);
    };

    const removeStudent = (index: number) => {
        setStudents(students.filter((_, i) => i !== index));
    };

    const handleChange = (index: number, field: keyof StudentForm, value: any) => {
        const updated = [...students];
        updated[index][field] = value;
        setStudents(updated);
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!schoolId) return;

        setLoading(true);

        try {
            const batch = writeBatch(db);

            const uploads = students.map(async (s) => {
                if (!s.name || !s.grade || !s.busNumber) {
                    throw new Error("Fill all required fields");
                }

                const bus = buses.find((b) => b.busNo === s.busNumber);
                if (!bus) throw new Error("Bus not found");

                const photoUrl = s.photo
                    ? await uploadSignedImage(s.photo, "students")
                    : null;

                const studentId = generateId("STU", schoolId);
                const ref = doc(collection(db, "students"), studentId);

                batch.set(ref, {
                    studentId,
                    schoolId,
                    busId: bus.id,
                    name: s.name,
                    grade: Number(s.grade),
                    parentName: s.parentName,
                    parentPhone: s.parentPhone,
                    busNo: s.busNumber,
                    photo: photoUrl,
                    pickupLocation: s.pickupLocation,
                    createdAt: Timestamp.now(),
                });

                batch.update(doc(db, "buses", bus.id), {
                    students: arrayUnion({
                        studentId,
                        name: s.name,
                        photo: photoUrl,
                        pickupLocation: s.pickupLocation,
                    }),
                });
            });

            await Promise.all(uploads);
            await batch.commit();

            alert("Students added successfully!");
            onClose();
        } catch (err) {
            console.error(err);
            alert("Failed to add students");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center px-4 py-10 overflow-y-auto">
            <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border overflow-hidden">

                {/* HEADER */}
                <div className="flex justify-between p-6 border-b bg-indigo-50">
                    <div className="flex gap-4">
                        <Users />
                        <div>
                            <h2 className={`text-3xl font-bold ${libreBaskerville.className}`}>
                                Add Students
                            </h2>
                            <p className={`text-sm text-slate-500 ${nunito.className}`}>
                                Register and assign students to buses
                            </p>
                        </div>
                    </div>

                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-6">

                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addStudentRow}
                            className="px-4 py-2 bg-indigo-900 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4 inline" /> Add More
                        </button>
                    </div>

                    {students.map((s, i) => (
                        <div key={i} className="border p-5 rounded-2xl bg-slate-50 relative">

                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-slate-600">
                                    Student {i + 1}
                                </h3>

                                {students.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeStudent(i)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">

                                <input
                                    placeholder="Student Name"
                                    value={s.name}
                                    onChange={(e) => handleChange(i, "name", e.target.value)}
                                    className="p-3 border rounded-xl"
                                />

                                <select
                                    value={s.grade}
                                    onChange={(e) => handleChange(i, "grade", e.target.value)}
                                    className="p-3 border rounded-xl"
                                >
                                    <option value="">Grade</option>
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                                        <option key={g}>Grade {g}</option>
                                    ))}
                                </select>

                                <select
                                    value={s.busNumber}
                                    onChange={(e) => handleChange(i, "busNumber", e.target.value)}
                                    className="p-3 border rounded-xl col-span-2"
                                >
                                    <option value="">Select Bus</option>
                                    {buses.map((b) => (
                                        <option key={b.id} value={b.busNo}>
                                            Bus {b.busNo}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    placeholder="Parent Name"
                                    value={s.parentName}
                                    onChange={(e) => handleChange(i, "parentName", e.target.value)}
                                    className="p-3 border rounded-xl"
                                />

                                <input
                                    placeholder="Parent Phone"
                                    value={s.parentPhone}
                                    onChange={(e) => handleChange(i, "parentPhone", e.target.value)}
                                    className="p-3 border rounded-xl"
                                />

                                {/* LOCATION PICKER */}
                                <div className="col-span-2 grid grid-cols-2 gap-4 items-start">

                                    {/* LEFT: IMAGE UPLOAD */}
                                    <label className="flex flex-col gap-2 border p-3 rounded-xl cursor-pointer bg-white">
                                        <div className="flex items-center gap-2">
                                            <Upload className="w-4 h-4" />
                                            <span className="text-sm font-medium">Upload Photo</span>
                                        </div>

                                        <span className="text-sm text-gray-500">
                                            {s.photo?.name || "No file chosen"}
                                        </span>

                                        <input
                                            type="file"
                                            hidden
                                            onChange={(e) =>
                                                handleChange(i, "photo", e.target.files?.[0])
                                            }
                                        />
                                    </label>

                                    <div className="border p-3 rounded-xl bg-white flex flex-col gap-2">
                                        <LocationPicker
                                            setPickupLocation={(loc) =>
                                                handleChange(i, "pickupLocation", loc)
                                            }
                                        />

                                        {s.pickupLocation && (
                                            <p className="text-xs text-green-600">
                                                Selected: {s.pickupLocation.lat.toFixed(4)},{" "}
                                                {s.pickupLocation.lng.toFixed(4)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="flex justify-end gap-3 border-t pt-4">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-200 rounded-xl">
                            Cancel
                        </button>

                        <button disabled={loading} className="px-5 py-2 bg-indigo-900 text-white rounded-xl">
                            {loading
                                ? 'Saving...'
                                : students.length === 1
                                    ? 'Save Student'
                                    : 'Save Students'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddStudent;