import { adminMessaging } from "@/firebase/firebase-admin"

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        const messageId = await adminMessaging.send({
            token,
            data: {
                tabOpenTitle: "🟢 App Open: Bus is very close!",
                tabOpenBody: "Get ready. Bus arriving now.",

                tabClosedTitle: "🔔 App Closed: Bus Update",
                tabClosedBody: "Your bus is near your stop.",

                icon: "https://imgs.search.brave.com/JzzQ3hCqNrreZIasRtxZW_E2IAU9mv4nEo_dSawUQlQ/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA2Lzk2LzU1Lzk0/LzM2MF9GXzY5NjU1/OTQ2Ml9vc0VRUXhC/RmJNamRsRWNpRlpJ/bUNFRE15SVJRYUdh/Zy5qcGc",

                busId: "bus123",
            },
        });

        return Response.json({ message: "Notification sent successfully", messageId })
    } catch (error: any) {
        return Response.json(
            {
                message: "Failed to send notification",
                error: error.message,
                code: error.code,
            },
            { status: 500 }
        );
    }
}