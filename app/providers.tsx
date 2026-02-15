"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/firebase/firebase";
import { AuthProvider } from "./context/authContext";

export function Providers({ children }: { children: React.ReactNode }) {

    useEffect(() => {
        const messaging = getMessaging(firebaseApp);
        const unsubscribeForeground = onMessage(messaging, (payload) => {
            const title = payload.data?.tabOpenTitle || payload.notification?.title || "Bus Update";
            const body = payload.data?.tabOpenBody || payload.notification?.body || "New update received";
            console.log(title, body);
        });

        if (!("serviceWorker" in navigator)) return;

        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "FCM_ALERT") {
                console.log(event.data.data)
                // const { tabOpenTitle, tabOpenBody } = event.data.data;
                console.log("Hello" + event.data.data.tabOpenTitle, event.data.data.tabOpenBody)
                alert(`Hello ${event.data.data.tabOpenTitle}, ${event.data.data.tabOpenBody}`);
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
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem >

                {children}
                <Toaster />
            </ThemeProvider>
        </AuthProvider>
    )
}
