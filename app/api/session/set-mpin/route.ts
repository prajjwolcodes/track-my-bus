import { adminDb } from "@/firebase/firebase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { uid, role, mpin } =
            await req.json()

        if (!uid || !mpin) {
            return NextResponse.json(
                {
                    error:
                        "UID and mPIN are required",
                },
                {
                    status: 400,
                }
            )
        }

        const collectionName =
            role === "driver"
                ? "drivers"
                : "students"

        await adminDb
            .collection(collectionName)
            .doc(uid)
            .update({
                mpin,
            })

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error(error)

        return NextResponse.json(
            {
                error: "Failed to set mPIN",
            },
            {
                status: 500,
            }
        )
    }
}