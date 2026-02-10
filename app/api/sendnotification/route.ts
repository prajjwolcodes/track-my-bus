import { adminMessaging } from "@/firebase/firebase-admin"

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const { token } = await request.json()

        const messageId = await adminMessaging.send({
            token,
            notification: {
                title: "Bus Nearby",
                body: "Bus is near your stop",
            },
            webpush: {
                notification: {
                    title: "Bus Nearby",
                    body: "Bus is near your stop",
                },
            },
            data: {
                busId: "bus123",
                lat: "...",
                lng: "...",
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