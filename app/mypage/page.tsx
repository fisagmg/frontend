"use client"

"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { AuthGuard } from "@/lib/auth-context"
import { MypageSidebar } from "@/components/mypage-sidebar"
import { MypageLabHistory } from "@/components/mypage-lab-history"
import { MypageReports } from "@/components/mypage-reports"
import { MypageProfile } from "@/components/mypage-profile"
import { MypageAiAnalysis } from "@/components/mypage-ai-analysis"

export default function MypagePage() {
  const searchParams = useSearchParams()
  const [activeView, setActiveView] = useState<"lab-history" | "reports" | "profile" | "ai-analysis">("lab-history")

  // URL에 alarm 파라미터가 있으면 자동으로 AI 분석 탭으로 전환
  useEffect(() => {
    const alarmName = searchParams.get("alarm_name")
    const instanceId = searchParams.get("instance_id")
    const timestamp = searchParams.get("timestamp")

    if (alarmName && instanceId && timestamp) {
      setActiveView("ai-analysis")
    }
  }, [searchParams])

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
          <p className="text-muted-foreground">내 정보와 활동 내역을 관리하세요</p>
        </div>

        <div className="flex gap-6">
          <MypageSidebar activeView={activeView} onViewChange={setActiveView} />

          <div className="flex-1">
            {activeView === "lab-history" && <MypageLabHistory />}
            {activeView === "reports" && <MypageReports />}
            {activeView === "ai-analysis" && <MypageAiAnalysis />}
            {activeView === "profile" && <MypageProfile />}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}