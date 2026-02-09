"use client"

import dynamic from "next/dynamic"

const BusMap = dynamic(() => import("./BusMap"), {
    ssr: false
})

export default function MapPage() {

    return (
        <div className="h-screen w-full">
            <BusMap />
        </div>
    )
}