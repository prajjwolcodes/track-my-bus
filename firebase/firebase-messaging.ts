"use client";

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase";

export type NotificationSetupResult =
    | { type: "fcm"; token: string }
    | { type: "sms" };

export const generateToken = async (): Promise<NotificationSetupResult> => {
    if (typeof window === "undefined") return { type: "sms" };

    try {
        const supported = await isSupported();
        if (!supported) {
            console.log("Firebase messaging not supported, use SMS");
            return { type: "sms" };
        }

        if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
            console.log("Push API not supported, use SMS");
            return { type: "sms" };
        }

        // 🔹 Ask permission ONLY after support check
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("Notification permission denied, Please enable notifications to receive updates");
            return { type: "sms" };
        }

        // 🔹 Ensure service worker is registered
        let registration = await navigator.serviceWorker.getRegistration(
            "/firebase-messaging-sw.js"
        );

        if (!registration) {
            registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );
            await navigator.serviceWorker.ready;
        }

        // 🔹 Get FCM token
        const messaging = getMessaging(firebaseApp);
        const vapidKey = process.env.NEXT_PUBLIC_vapidKey!;

        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });

        if (!token) {
            console.log("No FCM token received");
            return { type: "sms" };
        }

        console.log("FCM Token:", token);
        return { type: "fcm", token };
    } catch (err) {
        console.log("FROM ERROR : FCM setup failed → use SMS", err);
        return { type: "sms" };
    }
};
