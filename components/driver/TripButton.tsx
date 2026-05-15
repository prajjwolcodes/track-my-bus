"use client";

import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TripButton({
    started,
    onStart,
    onStop,
    disabled,
    floating = false,
    isLocating = false,
}: {
    started: boolean;
    onStart: () => void;
    onStop: () => void;
    disabled?: boolean;
    floating?: boolean;
    isLocating?: boolean;
}) {
    const wrapperClass = floating
        ? "fixed z-50 right-4 bottom-6 md:hidden"
        : "w-full";

    const label = !started
        ? "Start Trip"
        : isLocating
            ? "Locating GPS..."
            : "Stop Trip";

    return (
        <div className={wrapperClass}>
            {!started ? (
                <Button
                    onClick={onStart}
                    disabled={disabled}
                    className={cn(
                        "w-full bg-green-600 hover:bg-green-700 text-white rounded-xl px-6 py-5 shadow-lg",
                        "transform transition-all duration-200 active:scale-[0.98]"
                    )}
                    size="lg"
                >
                    <Play className="mr-2" /> {label}
                </Button>
            ) : (
                <Button
                    onClick={onStop}
                    disabled={disabled}
                    className={cn(
                        "w-full bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 py-5 shadow-lg",
                        "transform transition-all duration-200 active:scale-[0.98]"
                    )}
                    size="lg"
                >
                    <Square className="mr-2" /> {label}
                </Button>
            )}
        </div>
    );
}
