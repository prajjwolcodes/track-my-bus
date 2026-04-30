import { adminDb, adminMessaging } from "@/firebase/firebase-admin"

export const runtime = "nodejs";

type SendNotificationRequest = {
    busId?: string;
    title?: string;
    body?: string;
    data?: Record<string, string>;

};

async function sendInBatches(tokens: string[], payload: Parameters<typeof adminMessaging.sendEachForMulticast>[0]) {
    const batchSize = 500;
    let successCount = 0;
    let failureCount = 0;

    for (let index = 0; index < tokens.length; index += batchSize) {
        const batchTokens = tokens.slice(index, index + batchSize);
        const response = await adminMessaging.sendEachForMulticast({
            ...payload,
            tokens: batchTokens,
        });

        successCount += response.successCount;
        failureCount += response.failureCount;
    }

    return { successCount, failureCount };
}

export async function POST(request: Request) {
    try {
        const { busId, title, body, data } = (await request.json()) as SendNotificationRequest;

        if (!busId) {
            return Response.json(
                { message: "busId is required" },
                { status: 400 }
            );
        }

        const snapshot = await adminDb.collection("students").where("busId", "==", busId).get();

        const tokens = snapshot.docs
            .map((doc) => doc.data()?.notificationToken)
            .filter((token): token is string => typeof token === "string" && token.trim().length > 0);

        // const uniqueTokens = Array.from(new Set(tokens));
        const uniqueTokens = ["dqlKh5UkxcSNyQLAHlpKVA:APA91bHnt1XxDbYZppznL46La1P_-emv5y7-uYB3Wd5OYII_WQzsGmiABGJIqNrik0Uthu1JN_vS0CLD5ORZs80bw2DRDHlBJEC47f9fzv29Gw7H4KC_icw"];


        if (!uniqueTokens.length) {
            return Response.json(
                {
                    message: "No logged-in parent tokens found for this bus",
                    busId,
                    recipientCount: 0,
                },
                { status: 404 }
            );
        }

        const notificationTitle = title ?? "🟢 App Open: Bus is very close!";
        const notificationBody = body ?? "Get ready. Your bus is arriving now.";

        const result = await sendInBatches(uniqueTokens, {
            notification: {
                title: notificationTitle,
                body: notificationBody,
                icon: data?.icon,
            },
            data: {
                tabOpenTitle: notificationTitle,
                tabOpenBody: notificationBody,
                tabClosedTitle: notificationTitle,
                tabClosedBody: notificationBody,
                busId,
                ...data,
            },
        });

        return Response.json({
            message: "Notification sent successfully",
            busId,
            recipientCount: uniqueTokens.length,
            ...result,
        });
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