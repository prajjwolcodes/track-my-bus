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

            await signOut(auth);

            await fetch("/api/session/logout", {
                method: "POST",
            });

            router.push("/signin");
            router.refresh();
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex w-full justify-center text-sm font-semibold items-center px-4 py-2 rounded-lg  text-red-800 border border-red-800 hover:text-white  hover:bg-red-800 cursor-pointer transition"
        >
            <LogOut className="inline-block mr-2" size={18} />
            Logout
        </button>
    );
}