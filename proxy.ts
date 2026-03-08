import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "./firebase/firebase-admin"


const ROLE_ROUTES: Record<string, string> = {
    school: "/school",
    parent: "/parent",
    driver: "/driver",
};

export async function proxy(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const roleFromCookie = req.cookies.get("role")?.value;
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

        await adminAuth.verifyIdToken(token);
        const role = roleFromCookie as string | undefined;

        if (!role || !ROLE_ROUTES[role]) {
            const response = NextResponse.redirect(new URL("/signin", req.url));
            response.cookies.delete("token");
            response.cookies.delete("role");
            return response;
        }

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
            return NextResponse.redirect(new URL(ROLE_ROUTES[role], req.url));
        }

        return NextResponse.next();
    } catch (error) {
        const response = NextResponse.redirect(new URL("/signin", req.url));
        response.cookies.delete("token");
        response.cookies.delete("role");
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