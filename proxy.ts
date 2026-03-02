import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authRoutes = ["/signin", "/signup"];
const validRoles = ["school", "driver", "parent"] as const;
type Role = (typeof validRoles)[number];
const roleRoutes: Record<string, string> = {
  "/school": "school",
  "/driver": "driver",
  "/parent": "parent",
};

const getRoleFromCookie = (request: NextRequest): Role | null => {
  const rawRole = request.cookies.get("role")?.value;
  if (!rawRole) return null;
  return (validRoles as readonly string[]).includes(rawRole) ? (rawRole as Role) : null;
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const rawRole = request.cookies.get("role")?.value;
  const role = getRoleFromCookie(request);
  const hasInvalidRoleCookie = !!rawRole && !role;

  const maybeClearInvalidRoleCookie = (response: NextResponse) => {
    if (hasInvalidRoleCookie) {
      response.cookies.set("role", "", { path: "/", maxAge: 0 });
    }
    return response;
  };

  if (authRoutes.includes(pathname)) {
    if (role) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
    return maybeClearInvalidRoleCookie(NextResponse.next());
  }

  const requiredRole = roleRoutes[pathname];
  if (requiredRole) {
    if (!role) {
      return maybeClearInvalidRoleCookie(
        NextResponse.redirect(new URL("/signin", request.url))
      );
    }
    if (role !== requiredRole) {
      return NextResponse.redirect(new URL(`/${role}`, request.url));
    }
  }

  return maybeClearInvalidRoleCookie(NextResponse.next());
}

export default proxy;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
