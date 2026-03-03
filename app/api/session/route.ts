import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    // only POST is allowed
    // if (req.method !== "POST") {
    //     return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    // }

    // req.body is a stream, parse it explicitly
    const { idToken, role } = await req.json();

    try {
        // Verify the ID token to get the user UID
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedIdToken.uid;

        // Set the role as a custom claim for the user
        await admin.auth().setCustomUserClaims(uid, { role });

        // Create a session cookie 
        const expiresIn = 5 * 24 * 60 * 60 * 1000;
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

        // build the response and attach the cookie
        const response = NextResponse.json({ message: "Cookie set", role }, { status: 200 });
        response.cookies.set("token", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expiresIn / 1000,
            path: "/",
            sameSite: "strict",
        });

        return response;
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
}
