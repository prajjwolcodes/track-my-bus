import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const roleRoutes: Record<string, string> = {
    "/school": "school",
    "/driver": "driver",
    "/parent": "parent",
}

const authRoutes = ["/signin", "/signup"]

export function proxy(request: NextRequest) {
    const path = request.nextUrl.pathname
    const role = request.cookies.get("role")?.value

    // Logged in → block /signin and /signup → redirect to own dashboard
    if (authRoutes.includes(path) && role) {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
    }

    // Not logged in → block protected routes → redirect to /signin
    const requiredRole = roleRoutes[path]
    if (requiredRole && !role) {
        return NextResponse.redirect(new URL("/signin", request.url))
    }

    // Wrong role → redirect to own dashboard
    if (requiredRole && role && role !== requiredRole) {
        return NextResponse.redirect(new URL(`/${role}`, request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/school", "/driver", "/parent", "/signin", "/signup"],
}