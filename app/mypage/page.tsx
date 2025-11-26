"use client"

import { useState } from "react"
import { AuthGuard } from "@/lib/auth-context"
import { MypageSidebar } from "@/components/mypage-sidebar"
import { MypageLabHistory } from "@/components/mypage-lab-history"
import { MypageReports } from "@/components/mypage-reports"
import { MypageProfile } from "@/components/mypage-profile"
import { MypageAdminConsole } from "@/components/mypage-admin-console"

export default function MypagePage() {
  const [activeView, setActiveView] = useState<"lab-history" | "reports" | "profile" | "admin-console">("lab-history")
  const [isAdminDetailView, setIsAdminDetailView] = useState(false)

  return (
    <AuthGuard>
      <div className={isAdminDetailView ? "min-h-screen" : "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"}>
        {!isAdminDetailView && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-muted-foreground">내 정보와 활동 내역을 관리하세요</p>
          </div>
        )}

        <div className={isAdminDetailView ? "" : "flex gap-6"}>
          {!isAdminDetailView && <MypageSidebar activeView={activeView} onViewChange={setActiveView} />}

          <div className={isAdminDetailView ? "w-full" : "flex-1"}>
            {activeView === "lab-history" && <MypageLabHistory />}
            {activeView === "reports" && <MypageReports />}
            {activeView === "profile" && <MypageProfile />}
            {activeView === "admin-console" && <MypageAdminConsole onDetailViewChange={setIsAdminDetailView} />}
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
