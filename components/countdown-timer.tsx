"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  initialSeconds: number
  onComplete: () => void
}

export function CountdownTimer({ initialSeconds, onComplete }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    if (seconds <= 0) {
      onComplete()
      return
    }

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [seconds, onComplete])

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`

  return (
    <div className="flex items-center gap-2 text-sm font-mono">
      <Clock className="h-4 w-4" />
      <span className={seconds < 600 ? "text-destructive" : ""}>{timeString}</span>
    </div>
  )
}
