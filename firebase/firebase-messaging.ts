"use client";

import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { firebaseApp } from "./firebase";

export type NotificationSetupResult =
    | { type: "fcm"; token: string }
    | { type: "sms" };

export const generateToken = async (): Promise<NotificationSetupResult> => {
    if (typeof window === "undefined") {
        console.log("[FCM-Token] Server-side, returning SMS type");
        return { type: "sms" };
    }

    try {
        const supported = await isSupported();
        if (!supported) {
            console.log("[FCM-Token] Firebase messaging not supported, use SMS");
            return { type: "sms" };
        }

        const hasServiceWorker = "serviceWorker" in navigator;
        const hasPushManager = "PushManager" in window;

        if (!hasServiceWorker || !hasPushManager) {
            console.log("[FCM-Token] Push API not supported, use SMS");
            return { type: "sms" };
        }

        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("[FCM-Token] Notification permission denied");
            return { type: "sms" };
        }

        let registration = await navigator.serviceWorker.getRegistration(
            "/firebase-messaging-sw.js"
        );

        if (!registration) {
            registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );
            await navigator.serviceWorker.ready;
        }

        const messaging = getMessaging(firebaseApp);
        const vapidKey = process.env.NEXT_PUBLIC_vapidKey;
        console.log("[FCM-Token] VAPID key available:", !!vapidKey);

        if (!vapidKey) {
            console.error("[FCM-Token] VAPID key is missing! Check NEXT_PUBLIC_vapidKey env var");
            return { type: "sms" };
        }

        const token = await getToken(messaging, {
            vapidKey,
            serviceWorkerRegistration: registration,
        });
        if (!token) {
            console.log("[FCM-Token] No FCM token received (null result)");
            return { type: "sms" };
        }

        console.log("[FCM-Token] ✓ Successfully generated FCM token", token);
        return { type: "fcm", token };
    } catch (err) {
        console.error("[FCM-Token] ERROR during token generation:", err);
        return { type: "sms" };
    }
};
