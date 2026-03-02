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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (!firebaseUser) {
                setUser(null);
                setLoading(false);
                return;
            }

            // Try to get user from Firestore "users" collection
            const snap = await getDoc(doc(db, "users", firebaseUser.uid));

            if (snap.exists()) {
                const data = snap.data() as any;
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
                // If user not found in "users", treat as logged out
                setUser(null);
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