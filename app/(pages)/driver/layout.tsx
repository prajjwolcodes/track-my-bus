"use client";

import { useAuth } from "@/app/context/authContext";
import LogoutButton from "@/components/LogoutButton";
import { LayoutDashboard, Map as MapIcon, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user } = useAuth()
    const pathname = usePathname();

    if (pathname === "/driver") {
        return <div className="w-full">{children}</div>;
    }
    // Get the currently authenticated user
    return (
        <div className="w-full flex min-h-screen bg-slate-50">
            {children}
        </div>
    );
}