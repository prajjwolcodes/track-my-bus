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

        console.log("[FCM] Starting token registration for user:", user.uid);
        let isMounted = true;

        const registerToken = async () => {
            try {
                console.log("[FCM] generateToken() called...");
                const result = await generateToken();
                console.log("[FCM] generateToken() result:", result);

                if (!isMounted) {
                    console.log("[FCM] Component unmounted, skipping token save");
                    return;
                }

                if (result.type !== "fcm") {
                    console.warn("[FCM] Token generation returned type:", result.type, "not 'fcm'. Skipping save.");
                    return;
                }

                console.log("[FCM] Saving token to Firestore for user:", user.uid);
                await updateDoc(doc(db, "students", user.uid), {
                    notificationToken: result.token,
                    notificationTokenUpdatedAt: serverTimestamp(),
                });
                console.log("[FCM] Token saved successfully to Firestore");

                didRegisterRef.current = true;
            } catch (error) {
                console.error("[FCM] Error in registerToken:", error);
            }
        };

        registerToken();

        return () => {
            isMounted = false;
        };
    }, [user]);

    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        console.log("[App-Messaging] Setting up foreground message handler...");
        const messaging = getMessaging(firebaseApp);
        const unsubscribeForeground = onMessage(messaging, (payload) => {
            console.log("[App-Messaging] Foreground message received:", payload);
            const title = payload.data?.tabOpenTitle || payload.notification?.title || "Bus Update";
            const body = payload.data?.tabOpenBody || payload.notification?.body || "New update received";
            console.log("[App-Messaging] Showing toast:", title, body);
            toast.message(title, { description: body });
        });

        if (!("serviceWorker" in navigator)) {
            console.log("[App-Messaging] Service worker not supported");
            return;
        }

        const handleMessage = (event: MessageEvent) => {
            console.log("[App-Messaging] Service worker message received:", event.data);
            if (event.data?.type === "FCM_ALERT") {
                const title = event.data.data?.tabOpenTitle || "Bus Update";
                const body = event.data.data?.tabOpenBody || "New update received";
                console.log("[App-Messaging] FCM_ALERT detected, showing toast:", title, body);
                toast.message(title, { description: body });
            }
        };

        navigator.serviceWorker.addEventListener("message", handleMessage);
        console.log("[App-Messaging] Message handlers registered");

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
