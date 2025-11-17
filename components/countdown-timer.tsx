"use client"

import { useEffect, useState } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  expiresAt: string | null  // ISO datetime string from backend
  onComplete: () => void
}

export function CountdownTimer({ expiresAt, onComplete }: CountdownTimerProps) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (!expiresAt) {
      setSeconds(0)
      return
    }

    // 초기 계산
    const calculateRemaining = () => {
      const now = Date.now()
      const expires = new Date(expiresAt).getTime()
      const remaining = Math.max(0, Math.floor((expires - now) / 1000))
      return remaining
    }

    // 즉시 계산
    const remaining = calculateRemaining()
    setSeconds(remaining)

    if (remaining <= 0) {
      onComplete()
      return
    }

    // 매 초마다 재계산
    const interval = setInterval(() => {
      const remaining = calculateRemaining()
      setSeconds(remaining)

      if (remaining <= 0) {
        onComplete()
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onComplete])

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
