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

  // Public routes (like signin)
  if (url.pathname.startsWith("/signin")) {
    if (token) {
      try {
        const decoded = await admin.auth().verifySessionCookie(token);
        // Get user with custom claims
        const user = await admin.auth().getUser(decoded.uid);
        const role = user.customClaims?.role;
        const roleRoute = ROLE_ROUTES[role] || "/"; // fallback
        return NextResponse.redirect(new URL(roleRoute, req.url));
      } catch (error) {
        return NextResponse.next();
      }
    }
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next(); // skip API routes
  }

  // Protected routes
  if (!token) {
    // Not logged in
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  try {
    const decoded = await admin.auth().verifySessionCookie(token);
    // Get user with custom claims
    const user = await admin.auth().getUser(decoded.uid);
    const role = user.customClaims?.role;

    const roleRoute = ROLE_ROUTES[role];
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
    console.log("first")
    console.log(error)
    return NextResponse.redirect(new URL("/signin", req.url));
  }
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    "/((?!_next/static|favicon.ico|api/|$).*)", // exclude all /api/*
  ],
};