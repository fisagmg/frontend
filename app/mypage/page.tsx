// app/mypage/page.tsx - 수정된 버전
"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthGuard } from "@/lib/auth-context";
import { MypageSidebar } from "@/components/mypage-sidebar";
import { MypageLabHistory } from "@/components/mypage-lab-history";
import { MypageReports } from "@/components/mypage-reports";
import { MypageProfile } from "@/components/mypage-profile";
import { MypageAiAnalysis } from "@/components/mypage-ai-analysis";
import { MypageAdminConsole } from "@/components/mypage-admin-console";

export default function MypagePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeView, setActiveView] = useState<
    "lab-history" | "reports" | "profile" | "admin-console" | "ai-analysis"
  >("lab-history");
  const [isAdminDetailView, setIsAdminDetailView] = useState(false);

  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [analyzedIncidentId, setAnalyzedIncidentId] = useState<
    number | undefined
  >(undefined);

  const hasAnalyzed = useRef<boolean>(false);

  // 쿼리 파라미터 추출
  const initialIncidentIdParam = searchParams.get("incidentId");
  const initialIncidentId = initialIncidentIdParam
    ? Number(initialIncidentIdParam)
    : undefined;

  const alarmName = searchParams.get("alarm_name");
  const instanceId = searchParams.get("instance_id");
  const timestamp = searchParams.get("timestamp");

  useEffect(() => {
    // 🔹 1) incidentId가 있으면 AI 탭 + 상세 화면
    if (initialIncidentId) {
      setActiveView("ai-analysis");
      setAnalyzedIncidentId(initialIncidentId);
      return;
    }

    // 🔹 2) alarm 파라미터가 있고 아직 분석 안했으면 분석 시작
    if (alarmName && instanceId && timestamp && !hasAnalyzed.current) {
      setActiveView("ai-analysis");
      hasAnalyzed.current = true;
      startAnalysis();
    }
  }, [searchParams, initialIncidentId, alarmName, instanceId, timestamp]);

  const startAnalysis = async () => {
    if (!alarmName || !instanceId || !timestamp) return;

    try {
      setAnalyzing(true);

      const lambdaUrl = process.env.NEXT_PUBLIC_LAMBDA_ANALYSIS_URL;
      const response = await fetch(
        `${lambdaUrl}?alarm_name=${encodeURIComponent(alarmName)}&instance_id=${encodeURIComponent(instanceId)}&timestamp=${encodeURIComponent(timestamp)}`
      );

      if (!response.ok) {
        throw new Error(`분석 실패: ${response.status}`);
      }

      const data = await response.json();
      const incidentId = data.incident_id;

      if (incidentId) {
        // ✅ 핵심: 분석 완료 후 URL을 incidentId로 변경
        // 이렇게 하면 상세 화면으로 바로 이동
        router.replace(`/mypage?incidentId=${incidentId}`);
        setAnalyzedIncidentId(incidentId);
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // 에러 발생시 파라미터만 제거하고 AI 분석 탭은 유지
      router.replace("/mypage");
      setActiveView("ai-analysis");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AuthGuard>
      <div
        className={
          isAdminDetailView
            ? "min-h-screen"
            : "mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8"
        }
      >
        {!isAdminDetailView && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">마이페이지</h1>
            <p className="text-muted-foreground">
              내 정보와 활동 내역을 관리하세요
            </p>
          </div>
        )}

        <div className={isAdminDetailView ? "" : "flex gap-6"}>
          {!isAdminDetailView && (
            <MypageSidebar
              activeView={activeView}
              onViewChange={setActiveView}
            />
          )}

          <div className={isAdminDetailView ? "w-full" : "flex-1"}>
            {activeView === "lab-history" && <MypageLabHistory />}
            {activeView === "reports" && <MypageReports />}
            {activeView === "profile" && <MypageProfile />}
            {activeView === "ai-analysis" && (
              <>
                {analyzing && (
                  <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-sm">AI 분석 진행 중...</span>
                  </div>
                )}
                <MypageAiAnalysis
                  initialIncidentId={analyzedIncidentId || initialIncidentId}
                />
              </>
            )}
            {activeView === "admin-console" && (
              <MypageAdminConsole onDetailViewChange={setIsAdminDetailView} />
            )}
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
