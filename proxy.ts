import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin";

// Define role-based routes
const ROLE_ROUTES: { [key: string]: string } = {
  school: "/school",
  driver: "/driver",
  parent: "/parent",
};

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const token = req.cookies.get("token")?.value || null; 

  console.log("token in proxy:", token);
  // Public routes (like signin)
  if (url.pathname.startsWith("/signin")) {
    if (token) {
      try {
        const decoded = await admin.auth().verifyIdToken(token);
        const roleRoute = ROLE_ROUTES[decoded.role] || "/"; // fallback
        return NextResponse.redirect(new URL(roleRoute, req.url));
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next(); 
  }

  // Protected routes
  if (!token) {
    // Not logged in
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);

    const roleRoute = ROLE_ROUTES[decoded.role];
    if (!roleRoute) {
      // Unknown role, redirect to signin
      return NextResponse.redirect(new URL("/signin", req.url));
    }

    // Block access to other roles
    if (!url.pathname.startsWith(roleRoute)) {
      return NextResponse.redirect(new URL(roleRoute, req.url));
    }

    // Access granted
    return NextResponse.next();
  } catch (error) {
    // Invalid token
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

// Apply middleware to all routes except static files
export const config = {
    matcher: ["/((?!_next/static|favicon.ico|$).*)"],

};