"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/countdown-timer";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { LabActionButtons } from "@/components/lab-action-buttons";
import { AuthGuard } from "@/lib/auth-context";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { LabGuidePanel } from "@/components/lab-guide-panel";
import { useToast } from "@/hooks/use-toast";
import { createReport, createVM, deleteVM, getRemainingTime } from "@/lib/api";

const INITIAL_TIME = 1 * 60 * 60; // 1 hour in seconds (fallback)

// CVE 메타데이터
const cveMetadata: Record<string, { title: string; subtitle: string }> = {
  "CVE-2025-1302": {
    title: "CVE-2025-1302",
    subtitle: "JSONPath-Plus RCE 취약점",
  },
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
  const [vmId, setVmId] = useState<string | null>(null);
  const [terminalUrl, setTerminalUrl] = useState<string | null>(null);
  const [timerStarted, setTimerStarted] = useState(false);
  const [expiresAt, setExpiresAt] = useState<string | null>(null); // 하이브리드 타이머용
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

  // 페이지 로드 시 기존 VM의 남은 시간 가져오기
  useEffect(() => {
    const savedVmId = localStorage.getItem(`vm_${cveId}`);
    if (savedVmId && !vmId) {
      // 기존 VM이 있으면 복구
      setVmId(savedVmId);
      setVmStatus("ready");
      setTimerStarted(true);

      // 백엔드에서 정확한 만료 시간 가져오기
      getRemainingTime(savedVmId)
        .then((response) => {
          setExpiresAt(response.expires_at);
        })
        .catch((error) => {
          console.error("Failed to fetch remaining time:", error);
          // 실패 시 로컬 스토리지 정리
          localStorage.removeItem(`vm_${cveId}`);
          setVmId(null);
          setVmStatus("idle");
          setTimerStarted(false);
        });
    }
  }, [cveId, vmId]);

  const handleCreateVm = async () => {
    setShowCreateVmDialog(false);
    setVmStatus("creating");

    // VM 생성 시작과 동시에 타이머 시작 (임시 1시간)
    setTimerStarted(true);
    const tempExpiresAt = new Date(Date.now() + INITIAL_TIME * 1000).toISOString();
    setExpiresAt(tempExpiresAt);

    try {
      toast({
        title: "VM 생성 시작",
        description: "취약 환경을 구성하고 있습니다...",
      });

      const response = await createVM(cveId);

      setVmId(response.vmId);
      setTerminalUrl(response.terminalUrl);
      setVmStatus("ready");

      // localStorage에 VM ID 저장 (페이지 새로고침 대비)
      localStorage.setItem(`vm_${cveId}`, response.vmId);

      // VM 생성 완료 후 백엔드에서 정확한 만료 시간 가져오기
      try {
        const timeResponse = await getRemainingTime(response.vmId);
        setExpiresAt(timeResponse.expires_at);
      } catch (timeError) {
        console.warn("Failed to fetch remaining time, using fallback:", timeError);
        // 실패 시 임시 시간 유지
      }

      toast({
        title: "VM 생성 완료",
        description: `IP: ${response.publicIp} | 터미널이 준비되었습니다.`,
      });
    } catch (error) {
      console.error("VM 생성 실패:", error);
      setVmStatus("idle");
      
      // VM 생성 실패 시 타이머도 중지
      setTimerStarted(false);
      setExpiresAt(null);

      toast({
        title: "VM 생성 실패",
        description:
          error instanceof Error
            ? error.message
            : "VM 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleStopVm = async () => {
    setShowStopVmDialog(false);

    if (!vmId) return;

    try {
      toast({
        title: "VM 종료 중",
        description: "VM을 종료하고 있습니다...",
      });

      await deleteVM(vmId, cveId);

      setVmStatus("idle");
      setVmId(null);
      setTerminalUrl(null);
      setTimerStarted(false);
      setExpiresAt(null);

      // localStorage 정리
      localStorage.removeItem(`vm_${cveId}`);

      toast({
        title: "VM 종료 완료",
        description: "VM이 성공적으로 종료되었습니다.",
      });
    } catch (error) {
      console.error("VM 종료 실패:", error);

      toast({
        title: "VM 종료 실패",
        description:
          error instanceof Error
            ? error.message
            : "VM 종료 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleComplete = async () => {
    setShowCompleteDialog(false);

    if (vmStatus === "ready" && vmId) {
      try {
        await deleteVM(vmId, cveId);
        localStorage.removeItem(`vm_${cveId}`);
      } catch (error) {
        console.error("VM 정리 실패:", error);
      }
    }

    router.push("/");
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);

    if (vmStatus === "ready" && vmId) {
      try {
        await deleteVM(vmId, cveId);
        localStorage.removeItem(`vm_${cveId}`);
      } catch (error) {
        console.error("VM 정리 실패:", error);
      }
    }

    router.push("/learn");
  };

  const handleTimeout = async () => {
    setShowTimeoutDialog(false);

    if (vmId) {
      try {
        await deleteVM(vmId, cveId);
        localStorage.removeItem(`vm_${cveId}`);
      } catch (error) {
        console.error("VM 정리 실패:", error);
      }
    }

    setVmStatus("idle");
    router.push("/");
  };

  const handleOpenReport = async () => {
    setIsCreatingReport(true);
    try {
      const userId = 1; // TODO: 실제 userId 획득 로직 추가 필요
      const reportName = `${cveId}_보고서_${new Date().toISOString().split("T")[0]}`;

      const report = await createReport(userId, cveId, reportName);

      if (report.presignedDownloadUrl) {
        window.open(report.presignedDownloadUrl, "_blank");
      }

      toast({
        title: "보고서가 생성되었습니다",
        description: "새 탭에서 워드 파일을 다운로드하여 편집하세요.",
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
                {vmStatus === "creating" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    생성 중...
                  </>
                ) : (
                  "VM 생성"
                )}
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
              {vmStatus === "ready" && vmId && expiresAt && (
                <LabActionButtons
                  uuid={vmId}
                  expiresAt={expiresAt}
                  onUpdateExpires={(newExpiresAt) => {
                    setExpiresAt(newExpiresAt);
                  }}
                  onTerminated={() => {
                    // 세션 종료 시 처리
                    setVmStatus("idle");
                    setVmId(null);
                    setTerminalUrl(null);
                    setTimerStarted(false);
                    setExpiresAt(null);
                    localStorage.removeItem(`vm_${cveId}`);
                    router.push("/");
                  }}
                />
              )}
              {timerStarted && (
                <CountdownTimer
                  expiresAt={expiresAt}
                  onComplete={() => setShowTimeoutDialog(true)}
                />
              )}
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-8rem)] flex relative">
          {/* Left: Guide Panel */}
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
                    {cveId} 취약 환경 구성 중
                  </p>
                </div>
              )}
              {vmStatus === "ready" && terminalUrl && (
                <iframe
                  src={terminalUrl}
                  className="w-full h-full rounded"
                  title="VM Terminal"
                  sandbox="allow-same-origin allow-scripts allow-forms"
                />
              )}
            </div>
          </div>
        </div>

        {/* Dialogs */}
        <ConfirmDialog
          open={showCreateVmDialog}
          onOpenChange={setShowCreateVmDialog}
          title="VM을 생성하시겠습니까?"
          description={`${cveId} 취약 환경이 구성됩니다. VM 생성 후 타이머가 시작됩니다. (1시간)`}
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
