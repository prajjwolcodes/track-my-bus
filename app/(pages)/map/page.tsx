"use client"

import { useAuth } from "@/app/context/authContext"
import dynamic from "next/dynamic"

const BusMap = dynamic(() => import("./BusMap"), {
    ssr: false
})

export default function MapPage() {
    const { user } = useAuth()

    return (
        <div className="h-screen w-full">
            <BusMap busId={user?.busId} />
        </div>
    )
}