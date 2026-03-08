import { cookies } from "next/headers";

export async function POST(req: Request) {
    const { token } = await req.json();

    (await cookies()).set("token", token, {
        httpOnly: true,
        secure: true,
        path: "/",
    });

    return Response.json({ success: true });
}