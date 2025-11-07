// app/lab/[cveId]/start/page.tsx
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { AuthGuard } from "@/lib/auth-context";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { LabGuidePanel } from "@/components/lab-guide-panel";
import { useToast } from "@/hooks/use-toast";
import { createReport } from "@/lib/api";

const INITIAL_TIME = 1 * 60 * 60; // 1 hour in seconds

// CVE 메타데이터
const cveMetadata: Record<string, { title: string; subtitle: string }> = {
  "CVE-2025-1302": {
    title: "CVE-2025-1302",
    subtitle: "JSONPath-Plus RCE 취약점",
  },
  // 다른 CVE 추가...
};

export default function LabStartPage({
  params,
}: {
  params: Promise<{ cveId: string }>;
}) {
  const { cveId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const [vmStatus, setVmStatus] = useState<"idle" | "creating" | "ready">(
    "idle"
  );
  const [timerStarted, setTimerStarted] = useState(false);
  const [showCreateVmDialog, setShowCreateVmDialog] = useState(false);
  const [showStopVmDialog, setShowStopVmDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);

  const metadata = cveMetadata[cveId] || {
    title: cveId,
    subtitle: "실습 가이드",
  };

  const handleCreateVm = () => {
    setShowCreateVmDialog(false);
    setVmStatus("creating");
    setTimeout(() => {
      setVmStatus("ready");
      setTimerStarted(true);
    }, 3000);
  };

  const handleStopVm = () => {
    setShowStopVmDialog(false);
    setVmStatus("idle");
    setTimerStarted(false);
  };

  const handleComplete = () => {
    setShowCompleteDialog(false);
    if (vmStatus === "ready") {
      setVmStatus("idle");
    }
    router.push("/");
  };

  const handleCancel = () => {
    setShowCancelDialog(false);
    if (vmStatus === "ready") {
      setVmStatus("idle");
    }
    router.push("/learn");
  };

  const handleTimeout = () => {
    setShowTimeoutDialog(false);
    setVmStatus("idle");
    router.push("/");
  };

  const handleOpenReport = async () => {
    setIsCreatingReport(true);
    try {
      const userId = 1; // TODO: 실제 userId 획득 로직 추가 필요
      const reportName = `${cveId}_보고서_${new Date().toISOString().split('T')[0]}`;
      
      // S3에 템플릿 복사 및 DB 레코드 생성
      const report = await createReport(userId, cveId, reportName);
      
      // 새 탭에서 워드 파일 열기 (바로 편집 가능)
      if (report.presignedDownloadUrl) {
        window.open(report.presignedDownloadUrl, '_blank');
      }
      
      toast({
        title: "보고서가 생성되었습니다",
        description: "새 탭에서 워드 파일을 다운로드하여 편집하세요. 수정 후 '작성한 보고서'에서 업로드할 수 있습니다.",
      });
    } catch (error) {
      console.error("보고서 생성 실패:", error);
      toast({
        title: "보고서 생성 실패",
        description: "보고서 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingReport(false);
    }
  };

  return (
    <AuthGuard>
      <div className="fixed inset-0 pt-16 bg-background">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleOpenReport} 
                variant="outline" 
                size="sm"
                disabled={isCreatingReport}
              >
                {isCreatingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "보고서 작성"
                )}
              </Button>
              <Button
                onClick={() => setShowCreateVmDialog(true)}
                disabled={vmStatus !== "idle"}
                variant="outline"
                size="sm"
              >
                VM 생성
              </Button>
              <Button
                onClick={() => setShowStopVmDialog(true)}
                disabled={vmStatus !== "ready"}
                variant="outline"
                size="sm"
              >
                VM 종료
              </Button>
              <Button
                onClick={() => setShowCompleteDialog(true)}
                variant="default"
                size="sm"
              >
                실습 완료
              </Button>
              <Button
                onClick={() => setShowCancelDialog(true)}
                variant="outline"
                size="sm"
              >
                실습 취소
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {timerStarted && (
                <CountdownTimer
                  initialSeconds={INITIAL_TIME}
                  onComplete={() => setShowTimeoutDialog(true)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-8rem)] flex relative">
          {/* Left: Guide Panel - 세로 스크롤바만 숨김 */}
          <div
            className={`border-r border-border bg-card overflow-y-auto transition-all duration-300 ${
              isPanelCollapsed ? "w-0" : "w-[30%]"
            }`}
            style={{
              minWidth: isPanelCollapsed ? "0" : "400px",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {!isPanelCollapsed && (
              <LabGuidePanel cveId={cveId} metadata={metadata} />
            )}
          </div>

          {/* Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            className="absolute left-[calc(30%-20px)] top-4 z-10 h-10 w-10 p-0 rounded-full shadow-lg"
            style={{
              left: isPanelCollapsed ? "0" : "calc(30% - 20px)",
              transition: "left 0.3s",
            }}
            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
          >
            {isPanelCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>

          {/* Right: VM Area */}
          <div className="flex-1 p-4 bg-muted/20">
            <div className="h-full rounded-lg border border-border bg-card flex items-center justify-center">
              {vmStatus === "idle" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    VM이 생성되지 않았습니다
                  </p>
                  <p className="text-sm text-muted-foreground">
                    상단의 "VM 생성" 버튼을 클릭하여 실습 환경을 시작하세요
                  </p>
                </div>
              )}
              {vmStatus === "creating" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">VM 환경 생성 중...</p>
                  <p className="text-xs text-muted-foreground">
                    JSONPath-Plus 취약 환경 구성 중
                  </p>
                </div>
              )}
              {vmStatus === "ready" && (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full rounded border border-border bg-background flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <p className="text-muted-foreground">VDI 터미널 화면</p>
                      <p className="text-xs text-muted-foreground">
                        (실제 환경에서는 SSH 터미널이 표시됩니다)
                      </p>
                      <div className="mt-4 p-4 bg-muted/50 rounded text-left text-xs font-mono">
                        <p className="text-green-500">ubuntu@cve-lab:~$</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={showCreateVmDialog}
          onOpenChange={setShowCreateVmDialog}
          title="VM을 생성하시겠습니까?"
          description="JSONPath-Plus 취약 환경이 구성됩니다. VM 생성 후 타이머가 시작됩니다. (1시간)"
          onConfirm={handleCreateVm}
        />

        <ConfirmDialog
          open={showStopVmDialog}
          onOpenChange={setShowStopVmDialog}
          title="VM을 종료하시겠습니까?"
          description="VM을 종료하면 현재 작업 내용이 저장되지 않을 수 있습니다."
          onConfirm={handleStopVm}
        />

        <ConfirmDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          title="실습을 완료하시겠습니까?"
          description="실습을 완료하면 VM이 종료되고 홈 화면으로 이동합니다."
          onConfirm={handleComplete}
        />

        <ConfirmDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          title="실습을 취소하시겠습니까?"
          description="실습을 취소하면 VM이 종료되고 학습 페이지로 이동합니다."
          onConfirm={handleCancel}
        />

        <ConfirmDialog
          open={showTimeoutDialog}
          onOpenChange={setShowTimeoutDialog}
          title="실습 시간이 종료되었습니다"
          description="1시간 실습 시간이 모두 소진되었습니다. 홈 화면으로 이동합니다."
          onConfirm={handleTimeout}
          cancelText=""
        />
      </div>
    </AuthGuard>
  );
}
