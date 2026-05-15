import React, { useEffect, useState } from "react";
import { BellRing, Bus, Home, Navigation, X } from "lucide-react";

/** Auto-dismiss duration; `app/providers.tsx` imports this for the removal timer. */
export const NOTIFICATION_AUTO_DISMISS_MS = 6000;

const PROGRESS_TICK_MS = 30;

export type InAppNotification = {
    id: string;
    title: string;
    body: string;
    icon?: string | null;
    source?: string;
};

export default function NotificationCard({
    notification,
    onClose,
}: {
    notification: InAppNotification;
    onClose: (id: string) => void;
}) {
    const { id, title, body, icon, source } = notification;
    const [progress, setProgress] = useState(100);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const enterTimer = setTimeout(() => setVisible(true), 10);
        const step = (100 * PROGRESS_TICK_MS) / NOTIFICATION_AUTO_DISMISS_MS;

        const interval = setInterval(() => {
            setProgress((prev) => {
                const next = Math.max(0, prev - step);
                if (next <= 0) {
                    clearInterval(interval);
                    return 0;
                }
                return next;
            });
        }, PROGRESS_TICK_MS);

        return () => {
            clearTimeout(enterTimer);
            clearInterval(interval);
        };
    }, []);

    const handleClose = () => {
        setVisible(false);
        setTimeout(() => onClose(id), 300);
    };

    return (
        <div
            role="alert"
            aria-live="assertive"
            style={{
                transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.98)",
                opacity: visible ? 1 : 0,
                transition:
                    "transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.28s ease, box-shadow 0.32s ease",
            }}
            className={[
                "relative w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl",
                "border border-slate-200/90 bg-white/95 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.18),0_4px_16px_-4px_rgba(15,23,42,0.08)]",
                "backdrop-blur-xl dark:border-zinc-700/80 dark:bg-zinc-950/95",
                "dark:shadow-[0_16px_48px_-12px_rgba(0,0,0,0.55),0_0_0_1px_rgba(255,255,255,0.06)_inset]",
                "font-sans antialiased text-slate-900 dark:text-zinc-50",
            ].join(" ")}
        >
            {/* Priority accent — reads as “system” alert, not a snackbar */}
            <div
                className="pointer-events-none absolute inset-y-3 left-0 w-1 rounded-full bg-linear-to-b from-amber-400 via-orange-500 to-rose-500 opacity-90"
                aria-hidden
            />

            <div className="relative pl-4 pr-8 pt-3.5 pb-1">
                {/* Tray header: app + live + time */}
                <div className="flex items-center justify-between gap-2 pl-1 pr-1 pb-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <div className="mb-3 flex items-center gap-2 pl-1">
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200/90 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-100">
                                <BellRing className="h-3 w-3" strokeWidth={2.25} aria-hidden />
                                Arrival alert
                            </span>
                        </div>
                    </div>
                    <div className="mr-4 flex shrink-0 items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70 dark:bg-emerald-400/60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-slate-400 dark:text-zinc-500">
                            Just now
                        </span>
                    </div>
                </div>

                {/* Priority ribbon */}


                <div className="flex gap-3 pl-1 pr-9">
                    <div className="relative shrink-0">
                        <div className="flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                            {icon ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={icon} alt="" className="h-9 w-9 object-contain" />
                            ) : (
                                <Bus className="h-4 w-4 text-slate-700 dark:text-zinc-200" strokeWidth={1.75} aria-hidden />
                            )}
                        </div>
                    </div>

                    <div className="min-w-0 flex-1 pt-0.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                            {title}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-snug text-slate-700 dark:text-zinc-300">
                            {body}
                        </p>
                    </div>
                </div>

                {/* Context — home proximity (fixed copy for this alert type) */}
                <div className="mt-3.5 pl-1 pr-1">
                    <div className="flex items-start gap-2.5 rounded-xl border border-slate-200/80 bg-slate-50/90 px-3 py-2.5 dark:border-zinc-700/80 dark:bg-zinc-900/60">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200/80 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-600/60">
                            <Home className="h-4 w-4" strokeWidth={2} aria-hidden />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                                Near your home
                            </p>
                            <p className="mt-0.5 text-[12px] leading-snug text-slate-700 dark:text-zinc-300">
                                Your bus is within range of your saved home location. Head out if you are boarding.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Primary action — full width like a rich notification */}
                <div className="mt-3 pl-1 pr-1 pb-3">
                    <button
                        type="button"
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-[13px] font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                        <Navigation className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
                        Track bus
                    </button>
                </div>

                {source && (
                    <p className="pb-2 text-center text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-zinc-600">
                        via {source}
                    </p>
                )}
            </div>

            <button
                type="button"
                onClick={handleClose}
                aria-label="Dismiss"
                className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
            >
                <X className="h-4 w-4" strokeWidth={2} />
            </button>

            {/* Auto-dismiss — thin system-style progress */}
            <div className="h-0.5 w-full bg-slate-100 dark:bg-zinc-800" aria-hidden>
                <div
                    className="h-full rounded-none bg-linear-to-r from-slate-700 via-slate-900 to-slate-700 dark:from-zinc-300 dark:via-white dark:to-zinc-300"
                    style={{
                        width: `${progress}%`,
                        transition: "width 30ms linear",
                    }}
                />
            </div>
        </div>
    );
}
