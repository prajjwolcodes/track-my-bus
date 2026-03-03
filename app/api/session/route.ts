import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
  console.log("test")
    // only POST is allowed
    // if (req.method !== "POST") {
    //     return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    // }

    // req.body is a stream, parse it explicitly
    const { idToken } = await req.json();

    try {
        // Create a session cookie 
        const expiresIn = 5 * 24 * 60 * 60 * 1000;
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
        console.log("Session cookie created:", sessionCookie);

        // build the response and attach the cookie
        const response = NextResponse.json({ message: "Cookie set" }, { status: 200 });
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
