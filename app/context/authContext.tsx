"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/firebase";

interface AuthUser {
    uid: string;
    role: "school" | "driver" | "parent";
    schoolId: string;
    name?: string;
    email?: string | null;
    busId?: string;
    studentId?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    loading: boolean;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const clearRoleCookie = () => {
        document.cookie = "role=; path=/; max-age=0";
        document.cookie = "schoolId=; path=/; max-age=0";
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                clearRoleCookie();
                setLoading(false);
                return;
            }

            // Try "users" first
            const userSnap = await getDoc(doc(db, "users", firebaseUser.uid));

            if (userSnap.exists()) {
                const data = userSnap.data() as any;
                const role: "school" | "driver" | "parent" = data.role || "school";

                setUser({
                    uid: firebaseUser.uid,
                    role,
                    schoolId: data.schoolId,
                    name: data.name,
                    email: firebaseUser.email ?? null,
                    busId: data.busId || null,
                    studentId: data.studentId || null,
                });
            } else {
                // Fallback for school auth (school uid is used during login)
                const schoolSnap = await getDoc(doc(db, "schools", firebaseUser.uid));
                if (schoolSnap.exists()) {
                    const schoolData = schoolSnap.data() as any;
                    setUser({
                        uid: firebaseUser.uid,
                        role: "school",
                        schoolId: schoolData.schoolId || "",
                        name: schoolData.name,
                        email: firebaseUser.email ?? null,
                    });
                } else {
                    // Unknown user for app routing; clear stale cookies to avoid proxy loops
                    setUser(null);
                    clearRoleCookie();
                }
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        await signOut(auth);
        setUser(null);
        localStorage.removeItem("users");
        document.cookie = "role=; path=/; max-age=0";
    };

    return (
        <AuthContext.Provider value={{ user, loading, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
