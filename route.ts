export async function POST(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") return res.status(405).end("Method not allowed");

    const { idToken } = req.body;

    try {
        // Create a session cookie (expires in 5 days)
        const expiresIn = 5 * 24 * 60 * 60 * 1000;
        const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

        // Set cookie
        res.setHeader("Set-Cookie", cookie.serialize("__session", sessionCookie, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: expiresIn / 1000,
            path: "/",
            sameSite: "strict",
        }));

        res.status(200).json({ message: "Cookie set" });
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: "Invalid token" });
    }
}