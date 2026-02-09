import { adminMessaging } from "@/firebase/firebase-admin"

export async function POST(request: Request) {
    const { token } = await request.json()

    const res = await adminMessaging.send({
        token,
        notification: {
            title: "Bus Nearby",
            body: "Bus is near your stop",
        },
        data: {
            busId: "bus123",
            lat: "...",
            lng: "...",
        },
    });


    return Response.json({ message: "Notification sent successfully", token, res })
}