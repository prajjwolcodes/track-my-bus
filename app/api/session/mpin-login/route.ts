import { adminAuth } from "@/firebase/firebase-admin"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
    try {
        const { uid, role } = await req.json()

        if (!uid) {
            return NextResponse.json({ error: "UID required" }, { status: 400 })
        }

        const token = await adminAuth.createCustomToken(uid, { role })

        return NextResponse.json({ token })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failed to generate token" }, { status: 500 })
    }
}