import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase/firebase-admin"


const ROLE_ROUTES: Record<string, string> = {
    school: "/school",
    parent: "/parent",
    driver: "/driver",
};

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    console.log("TOKEN", token)
    const { pathname } = req.nextUrl;

    const publicRoutes = ["/signin", "/signup"];

    // If user is NOT logged in
    if (!token) {
        if (!publicRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL("/signin", req.url));
        }
        return NextResponse.next();
    }

    try {
        // Verify Firebase ID Token

        const decoded = await adminAuth.verifyIdToken(token);
        const role = decoded.role as string;

        const allowedRoute = ROLE_ROUTES[role];

        if (
            pathname.startsWith("/school") ||
            pathname.startsWith("/parent") ||
            pathname.startsWith("/driver")
        ) {
            if (!pathname.startsWith(allowedRoute)) {
                return NextResponse.redirect(new URL(allowedRoute, req.url));
            }
        }

        // If logged in user tries to visit signin/siignup
        if (publicRoutes.includes(pathname)) {
            return NextResponse.redirect(new URL(role, req.url));
        }

        return NextResponse.next();
    } catch (error) {
        const response = NextResponse.redirect(new URL("/signin", req.url));
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: [
        "/school/:path*",
        "/parent/:path*",
        "/driver/:path*",
        "/signin",
        "/signup",
    ],
};