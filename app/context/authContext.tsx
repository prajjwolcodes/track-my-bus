// context/AuthContext.tsx
"use client";

import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";
import { createContext, useContext, useEffect, useState } from "react";

interface AuthUser {
    uid: string;
    role: string;
    schoolId: string;
    name?: string;
    schoolName?: string;
    email?: string | null;
    busId?: string;
    studentId?: string;
}

const AuthContext = createContext<{
    user: AuthUser | null;
    loading: boolean;
}>({ user: null, loading: true });

export const AuthProvider = ({ children }: any) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            const uid = firebaseUser.uid;
            const email = firebaseUser.email ?? null;

            const userSnap = await getDoc(doc(db, "users", uid));
            if (userSnap.exists()) {
                setUser({
                    uid,
                    email,
                    ...userSnap.data(),
                } as AuthUser);
                setLoading(false);
                return;
            }

            const driverSnap = await getDoc(doc(db, "drivers", uid));
            if (driverSnap.exists()) {
                setUser({
                    uid,
                    email,
                    role: "driver",
                    ...driverSnap.data(),
                } as AuthUser);
                setLoading(false);
                return;
            }

            const studentSnap = await getDoc(doc(db, "students", uid));
            if (studentSnap.exists()) {
                setUser({
                    uid,
                    email,
                    role: "parent",
                    ...studentSnap.data(),
                } as AuthUser);
                setLoading(false);
                return;
            }

            setUser(null);

            setLoading(false);
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
