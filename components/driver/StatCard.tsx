import { cn } from "@/lib/utils"

// StatCard.tsx
interface StatCardProps {
    icon: React.ReactNode
    label: string
    value: string | number
    hint: string
    valueClassName?: string
    colorScheme: "blue" | "violet" | "amber" | "slate"
}

const colorMap = {
    blue: { icon: "bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400", value: "text-blue-600 dark:text-blue-400" },
    violet: { icon: "bg-violet-50 border border-violet-200 text-violet-600 dark:bg-violet-950 dark:border-violet-800 dark:text-violet-400", value: "text-violet-600 dark:text-violet-400" },
    amber: { icon: "bg-amber-50 border border-amber-200 text-amber-600 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-400", value: "text-amber-600 dark:text-amber-400" },
    slate: { icon: "bg-slate-100 border border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400", value: "text-slate-500 dark:text-slate-400" },
}

export function StatCard({ icon, label, value, hint, valueClassName, colorScheme }: StatCardProps) {
    const colors = colorMap[colorScheme]
    return (
        <div className="group grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl px-3.5 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60">
            <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", colors.icon)}>
                {icon}
            </div>
            <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{label}</p>
                <p className="truncate text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
            </div>
            <span className={cn("shrink-0 text-right text-base font-semibold", valueClassName ?? colors.value)}>
                {value}
            </span>
        </div>
    )
}