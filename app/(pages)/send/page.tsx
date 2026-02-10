"use client"

import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { firebaseApp } from "@/firebase/firebase";

const page = () => {
    useEffect(() => {
        const messaging = getMessaging(firebaseApp);
        const unsubscribe = onMessage(messaging, (payload) => {
            const title = payload.notification?.title || payload.data?.title || "Bus Update";
            const body = payload.notification?.body || payload.data?.body || "New update received";

            if (Notification.permission === "granted") {
                new Notification(title, {
                    body,
                    icon: payload.notification?.icon || payload.data?.icon,
                });
            }
        });

        return () => unsubscribe();
    }, []);
    async function send() {
        const res = await fetch("/api/sendnotification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                token: "dqlKh5UkxcSNyQLAHlpKVA:APA91bGXzkpT6iG9zkEDetdxhvh-eeni6ad3dFJoC26rGXJJgqR7koy0MyLZxoYTj5D8CkoNldukIeisJOUPXKWlAiELBMcdJGNIn1h8gwHKpAabRaYBJSc"
            })
        })
        const data = await res.json()

        console.log("Send response:", data)

    }
    return (
        <div>
            <button onClick={send}>Send Notification</button>
        </div>
    )
}

export default page