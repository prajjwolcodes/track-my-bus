"use client"

import { ThemeProvider } from "next-themes"
import { Toaster } from "@/components/ui/sonner"
import { useEffect, useRef, useState } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseApp, db } from "@/firebase/firebase";
import { AuthProvider, useAuth } from "./context/authContext";
import { generateToken } from "@/firebase/firebase-messaging";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import NotificationCard, { InAppNotification, NOTIFICATION_AUTO_DISMISS_MS } from "@/components/NotificationCard";

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
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<InAppNotification[]>([]);
    const lastSoundAtRef = useRef(0);
    const seenBusNotificationIdsRef = useRef<Set<string>>(new Set());
    const busNotificationsReadyRef = useRef(false);

    function playAlertSound() {
        if (typeof window === "undefined") return;
        if (typeof document !== "undefined") {
            const isFocused = typeof document.hasFocus === "function" ? document.hasFocus() : false;
            const isVisible = document.visibilityState === "visible";
            if (!isFocused && !isVisible) return;
        }

        const now = Date.now();
        if (now - lastSoundAtRef.current < 1500) return;
        lastSoundAtRef.current = now;

        try {
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextCtor) return;

            const ctx: AudioContext = new AudioContextCtor();

            // Compressor increases perceived loudness without harsh clipping.
            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-28, ctx.currentTime);
            compressor.knee.setValueAtTime(30, ctx.currentTime);
            compressor.ratio.setValueAtTime(12, ctx.currentTime);
            compressor.attack.setValueAtTime(0.003, ctx.currentTime);
            compressor.release.setValueAtTime(0.22, ctx.currentTime);

            const master = ctx.createGain();
            master.gain.setValueAtTime(0.85, ctx.currentTime);

            compressor.connect(master);
            master.connect(ctx.destination);

            // Autoplay policies may block audio until user interacts.
            void ctx.resume().catch(() => { });

            const t0 = ctx.currentTime;
            const endAt = t0 + 0.85;

            const scheduleTone = (opts: {
                at: number;
                duration: number;
                type: OscillatorType;
                f0: number;
                f1: number;
                peak: number;
                detuneCents?: number;
            }) => {
                const at = opts.at;
                const duration = opts.duration;

                const oscA = ctx.createOscillator();
                const oscB = ctx.createOscillator();
                const gain = ctx.createGain();

                oscA.type = opts.type;
                oscB.type = "sine";

                // Primary tone sweep
                oscA.frequency.setValueAtTime(opts.f0, at);
                oscA.frequency.linearRampToValueAtTime(opts.f1, at + duration);

                // Support tone one octave lower (adds “ringtone” character)
                oscB.frequency.setValueAtTime(opts.f0 / 2, at);
                oscB.frequency.linearRampToValueAtTime(opts.f1 / 2, at + duration);

                if (typeof opts.detuneCents === "number") {
                    oscA.detune.setValueAtTime(opts.detuneCents, at);
                }

                // Envelope
                gain.gain.setValueAtTime(0.0001, at);
                gain.gain.exponentialRampToValueAtTime(opts.peak, at + 0.015);
                gain.gain.exponentialRampToValueAtTime(0.0001, at + duration);

                oscA.connect(gain);
                oscB.connect(gain);
                gain.connect(compressor);

                oscA.start(at);
                oscB.start(at);
                oscA.stop(at + duration + 0.02);
                oscB.stop(at + duration + 0.02);
            };

            // Loud, attention-grabbing “ringtone-style” triple-chime (original sound)
            scheduleTone({ at: t0 + 0.00, duration: 0.18, type: "sawtooth", f0: 1050, f1: 1550, peak: 0.55, detuneCents: 6 });
            scheduleTone({ at: t0 + 0.24, duration: 0.18, type: "square", f0: 880, f1: 1320, peak: 0.52, detuneCents: -4 });
            scheduleTone({ at: t0 + 0.48, duration: 0.22, type: "sawtooth", f0: 760, f1: 1180, peak: 0.60, detuneCents: 3 });

            // Cleanup
            window.setTimeout(() => {
                try {
                    if (ctx.state !== "closed") void ctx.close();
                } catch {
                    // ignore
                }
            }, Math.ceil((endAt - t0) * 1000) + 100);
        } catch {
            // ignore
        }
    }

    async function showSystemNotification(payload: { title: string; body: string; icon?: string | null }) {
        if (typeof window === "undefined") return;
        if (!("Notification" in window)) return;

        if (Notification.permission !== "granted") {
            return;
        }

        const title = payload.title;
        const body = payload.body;
        const icon = payload.icon ?? undefined;

        try {
            if ("serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(title, {
                    body,
                    icon,
                    badge: "/badge-icon.svg",
                    tag: "bus-notification-foreground",
                    requireInteraction: false,
                    silent: false,
                    data: {
                        source: "foreground",
                    },
                });
                return;
            }

            // Fallback (some browsers may still allow this)
            // eslint-disable-next-line no-new
            new Notification(title, {
                body,
                icon,
            });
        } catch {
            // ignore
        }
    }

    function pushNotification(payload: { title: string; body: string; icon?: string | null }) {
        const id = String(Date.now()) + Math.random().toString(36).slice(2, 7);
        const notif: InAppNotification = { id, title: payload.title, body: payload.body, icon: payload.icon ?? null, source: "FCM" };
        setNotifications((s) => [notif, ...s]);

        playAlertSound();

        // Auto dismiss (keep in sync with NotificationCard progress bar)
        window.setTimeout(() => {
            setNotifications((s) => s.filter((n) => n.id !== id));
        }, NOTIFICATION_AUTO_DISMISS_MS);
    }

    function removeNotification(id: string) {
        setNotifications((s) => s.filter((n) => n.id !== id));
    }

    useEffect(() => {
        seenBusNotificationIdsRef.current = new Set();
        busNotificationsReadyRef.current = false;
    }, []);

    useEffect(() => {
        console.log("[App-Messaging] Setting up foreground message handler...");
        const messaging = getMessaging(firebaseApp);
        const unsubscribeForeground = onMessage(messaging, (payload) => {
            console.log("[App-Messaging] Foreground message received:", payload);
            const title = payload.data?.tabOpenTitle || payload.notification?.title || "Bus Update";
            const body = payload.data?.tabOpenBody || payload.notification?.body || "New update received";
            const icon = payload.data?.icon || payload.notification?.icon || null;
            console.log("[App-Messaging] Showing in-app + system notification:", title, body);
            pushNotification({ title, body, icon });
            void showSystemNotification({ title, body, icon });
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
                const icon = event.data.data?.icon || null;
                console.log("[App-Messaging] FCM_ALERT detected, showing in-app + system notification:", title, body);
                pushNotification({ title, body, icon });
                void showSystemNotification({ title, body, icon });
            }
        };

        navigator.serviceWorker.addEventListener("message", handleMessage);
        console.log("[App-Messaging] Message handlers registered");

        return () => {
            unsubscribeForeground();
            navigator.serviceWorker.removeEventListener("message", handleMessage);
        };
    }, []);

    useEffect(() => {
        if (!user || user.role !== "parent" || !user.busId) return;

        seenBusNotificationIdsRef.current = new Set();
        busNotificationsReadyRef.current = false;

        const notificationsQuery = query(
            collection(db, "busNotifications"),
            where("busId", "==", user.busId)
        );

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const shouldSkipInitial = !busNotificationsReadyRef.current;

            snapshot.docChanges().forEach((change) => {
                if (change.type !== "added") return;

                const notificationId = change.doc.id;
                if (seenBusNotificationIdsRef.current.has(notificationId)) return;
                seenBusNotificationIdsRef.current.add(notificationId);

                if (shouldSkipInitial) return;

                const data = change.doc.data() as { title?: string; body?: string; icon?: string | null };
                const title = data.title || "Bus Update";
                const body = data.body || "New update received";
                const icon = data.icon ?? null;

                pushNotification({ title, body, icon });
                void showSystemNotification({ title, body, icon });
            });

            busNotificationsReadyRef.current = true;
        });

        return () => unsubscribe();
    }, [user?.busId, user?.role]);

    return (
        <AuthProvider>
            <FcmTokenRegistrar />
            <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
                {children}

                {/* Notification stack */}
                <div className="fixed right-4 bottom-6 z-50 flex flex-col-reverse gap-3">
                    {notifications.map((n) => (
                        <NotificationCard key={n.id} notification={n} onClose={removeNotification} />
                    ))}
                </div>

                <Toaster />
            </ThemeProvider>
        </AuthProvider>
    )
}
