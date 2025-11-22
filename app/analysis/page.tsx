"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect } from "react"

export default function AnalysisRedirectPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    // query params를 그대로 유지하면서 /mypage로 리다이렉트
    const alarmName = searchParams.get("alarm_name")
    const instanceId = searchParams.get("instance_id")
    const timestamp = searchParams.get("timestamp")

    if (alarmName && instanceId && timestamp) {
      router.push(`/mypage?alarm_name=${alarmName}&instance_id=${instanceId}&timestamp=${timestamp}`)
    } else {
      router.push("/mypage")
    }
  }, [searchParams, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-lg">리다이렉트 중...</p>
      </div>
    </div>
  )
}