"use client";

import { getMessaging, getToken } from "firebase/messaging";
import { firebaseApp } from "./firebase";



export const generateToken = async () => {
    if (typeof window === "undefined") return;

    try {
        const permission = await Notification.requestPermission();

        if (permission !== "granted") {
            console.log("Permission denied");
            return;
        }
        const messaging = getMessaging(firebaseApp);


        let registration = await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js");

        if (!registration) {
            // console.log("Registering new service worker...");
            registration = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
            );
            // Wait for service worker to be ready
            await navigator.serviceWorker.ready;
        } else {
            // console.log("Using existing service worker registration");
        }

        const vapidKey = process.env.NEXT_PUBLIC_vapidKey;

        if (!vapidKey) {
            throw new Error("VAPID key is not defined. Check your .env file.");
        }

        const token = await getToken(messaging, {
            vapidKey: vapidKey,
            serviceWorkerRegistration: registration,
        });

        console.log("FCM Token:", token);
        return token;
    } catch (err) {
        console.error("FCM error:", err);
        throw err;
    }
};
