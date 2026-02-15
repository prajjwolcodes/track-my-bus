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

            const snap = await getDoc(doc(db, "users", firebaseUser.uid));
            if (snap.exists()) {
                setUser({
                    uid: firebaseUser.uid,
                    ...snap.data(),
                } as AuthUser);
            }

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
