"use client";

import { onAuthStateChanged } from "firebase/auth";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
} from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthUser {
    uid: string;
    role: string;
    schoolId: string;
    schoolName?: string;
    name?: string;
    email?: string | null;
    contact?: string;
    photoURL?: string | null;
    busId?: string;
    studentId?: string;
    pickupLocation?: {
        lat: number | null;
        lng: number | null;
        address?: string;
    };
    students?: any[];
}

const AuthContext = createContext<{
    user: AuthUser | null;
    loading: boolean;
}>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    // Helper function to get school name
    const getSchoolName = async (schoolId: string) => {
        if (!schoolId) return "";

        try {
            const q = query(
                collection(db, "schools"),
                where("schoolId", "==", schoolId)
            );

            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                console.log("School not found");
                return "";
            }

            const schoolData = snapshot.docs[0].data();

            console.log("School Data:", schoolData);

            return schoolData.name;
        } catch (err) {
            console.error(err);
            return "";
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const uid = firebaseUser.uid;
            const email = firebaseUser.email ?? null;

            try {
                // ================= USERS =================
                const userSnap = await getDoc(doc(db, "users", uid));

                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const schoolName = await getSchoolName(userData.schoolId);

                    setUser({
                        uid,
                        email,
                        schoolName,
                        ...userData,
                    } as AuthUser);

                    setLoading(false);
                    return;
                }

                // ================= DRIVERS =================
                const driverSnap = await getDoc(doc(db, "drivers", uid));

                if (driverSnap.exists()) {
                    const driverData = driverSnap.data();

                    const schoolName = await getSchoolName(driverData.schoolId);

                    let students: any[] = [];

                    if (driverData.busId) {
                        const busSnap = await getDoc(
                            doc(db, "buses", driverData.busId)
                        );

                        if (busSnap.exists()) {
                            const busData = busSnap.data();
                            students = busData.students || [];
                        }
                    }

                    setUser({
                        uid,
                        email,
                        role: "driver",
                        schoolName,
                        students,
                        ...driverData,
                    } as AuthUser);

                    setLoading(false);
                    return;
                }

                // ================= STUDENTS / PARENTS =================
                const studentSnap = await getDoc(doc(db, "students", uid));

                if (studentSnap.exists()) {
                    const studentData = studentSnap.data();

                    const schoolName = await getSchoolName(
                        studentData.schoolId
                    );

                    setUser({
                        uid,
                        email,
                        role: "parent",
                        schoolName,
                        ...studentData,
                    } as AuthUser);

                    setLoading(false);
                    return;
                }

                setUser(null);
                setLoading(false);
            } catch (error) {
                console.error("Error loading authenticated user:", error);
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);