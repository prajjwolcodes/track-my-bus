"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useRef } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseApp, db } from "@/firebase/firebase";
import { AuthProvider, useAuth } from "./context/authContext";
import { generateToken } from "@/firebase/firebase-messaging";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { toast } from "sonner";

function FcmTokenRegistrar() {
    const { user } = useAuth();
    const didRegisterRef = useRef(false);

    useEffect(() => {
        if (!user || user.role !== "parent" || didRegisterRef.current) return;

        let isMounted = true;

        const registerToken = async () => {
            const result = await generateToken();

            if (!isMounted || result.type !== "fcm") return;

            await updateDoc(doc(db, "students", user.uid), {
                notificationToken: result.token,
                notificationTokenUpdatedAt: serverTimestamp(),
            });

            didRegisterRef.current = true;
        };

        registerToken().catch((error) => {
            console.error("Failed to register FCM token:", error);
        });

        return () => {
            isMounted = false;
        };
    }, [user]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        const messaging = getMessaging(firebaseApp);
        const unsubscribeForeground = onMessage(messaging, (payload) => {
            const title = payload.data?.tabOpenTitle || payload.notification?.title || "Bus Update";
            const body = payload.data?.tabOpenBody || payload.notification?.body || "New update received";
            toast.message(title, { description: body });
        });

        if (!("serviceWorker" in navigator)) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "FCM_ALERT") {
                const title = event.data.data?.tabOpenTitle || "Bus Update";
                const body = event.data.data?.tabOpenBody || "New update received";
                toast.message(title, { description: body });
            }
        };

        navigator.serviceWorker.addEventListener("message", handleMessage);

        return () => {
            unsubscribeForeground();
            navigator.serviceWorker.removeEventListener("message", handleMessage);
        };
    }, []);

    return (
        <AuthProvider>
            <FcmTokenRegistrar />
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                {children}
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
    )
}
