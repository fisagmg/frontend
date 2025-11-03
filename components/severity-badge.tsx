import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SeverityBadgeProps {
  score: number
  level: "Low" | "Medium" | "High" | "Critical"
  showScore?: boolean
  className?: string
}

const severityColors = {
  Critical: "bg-red-500/15 text-red-400 ring-1 ring-red-500/30",
  High: "bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30",
  Medium: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
  Low: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
}

const scoreColors = {
  Critical: "text-red-400",
  High: "text-orange-400",
  Medium: "text-amber-400",
  Low: "text-emerald-400",
}

export function SeverityBadge({ score, level, showScore = true, className }: SeverityBadgeProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showScore && (
        <span className={cn("text-lg font-bold tabular-nums", scoreColors[level])}>{score.toFixed(1)}</span>
      )}
      <Badge className={cn(severityColors[level])}>{level}</Badge>
    </div>
  )
}
