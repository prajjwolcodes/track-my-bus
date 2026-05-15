"use client";

import { auth } from "@/firebase/firebase";
import { signOut } from "firebase/auth";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

/**
 * @param {{ onBeforeLogout?: () => Promise<void> | void }} props
 */
export default function LogoutButton({ onBeforeLogout } = {}) {
    const router = useRouter();

    const handleLogout = async () => {
        try {
            if (onBeforeLogout) {
                await onBeforeLogout();
            }

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
            className="flex justify-left text-sm font-semibold items-center w-full px-4 py-2 rounded-lg  text-red-500 border border-red-500 hover:text-gray-200 hover:bg-red-500 cursor-pointer transition"
        >
            <LogOut className="inline-block mr-2" size={18} />
            Logout
        </button>
    );
}