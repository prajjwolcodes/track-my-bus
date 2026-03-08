"use client";

import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            // 1. Firebase logout
            await signOut(auth);

            // 2. Remove cookie from server
            await fetch("/api/session/logout", {
                method: "POST",
            });

            // 3. Redirect to login
            router.push("/signin");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
        >
            Logout
        </button>
    );
}