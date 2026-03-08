import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { token, role } = await req.json();

    (await cookies()).set("token", token, {
        httpOnly: true,
        secure: true,
        path: "/",
    });


    (await cookies()).set("role", role, {
        httpOnly: true,
        secure: true,
        path: "/",
    });


    return Response.json({ success: true });
}