import { NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    const expiresIn = 60 * 60 * 24 * 2 * 1000; // 2 days

    // Create Firebase session cookie
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

    // Decode ID token to get UID
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Fetch school document using UID
    const schoolDocRef = doc(db, "schools", uid);
    const schoolDoc = await getDoc(schoolDocRef);

    if (!schoolDoc.exists()) {
      return NextResponse.json(
        { status: "error", message: "School not found" },
        { status: 400 }
      );
    }

    const data = schoolDoc.data();
    const role = "school";
    const schoolId = data.schoolId;

    // Response with cookies
    const response = NextResponse.json({ status: "success", role, schoolId });

    response.cookies.set("session", sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: "strict",
    });

    response.cookies.set("role", role, {
      httpOnly: false, // can read client-side
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: "strict",
    });

    response.cookies.set("schoolId", schoolId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 400 }
    );
  }
}
