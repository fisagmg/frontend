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
import {
  createReport,
  createVM,
  getRemainingTime,
  terminateSession,
  completeLabSession,
  cancelLabSession,
} from "@/lib/api";

const INITIAL_TIME = 1 * 60 * 60; // 1 hour in seconds (fallback)

type StoredLabSession = {
  uuid: string;
  guacamoleUrl: string | null;
  terminated?: boolean;
};

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
  const [vmStatus, setVmStatus] = useState<"idle" | "creating" | "ready" | "terminated">(
    "idle"
  );
  const [vmId, setVmId] = useState<string | null>(null);
  const [terminalUrl, setTerminalUrl] = useState<string | null>(null);//iframe url
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

  const storageKey = `lab_session_${cveId}`;

  // 페이지 로드 시 기존 VM의 남은 시간 가져오기
  useEffect(() => {
    if (vmId) {
      return;
    }

    const savedSession = localStorage.getItem(storageKey);
    if (!savedSession) {
      return;
    }

    try {
      const parsed: StoredLabSession = JSON.parse(savedSession);

      if (!parsed.uuid) {
        throw new Error("Invalid stored lab session");
      }

      setVmId(parsed.uuid);
      setTerminalUrl(parsed.guacamoleUrl ?? null);
      if (parsed.terminated) {
        setVmStatus("terminated");
        setTimerStarted(false);
        setExpiresAt(null);
      } else {
        setVmStatus("ready");
        setTimerStarted(false);
        setExpiresAt(null);

        getRemainingTime(parsed.uuid)
          .then((response) => {
            if (response.expires_at) {
              setExpiresAt(response.expires_at);
              setTimerStarted(true);
            }
          })
          .catch((error) => {
            console.error("Failed to fetch remaining time:", error);
            localStorage.removeItem(storageKey);
            setVmId(null);
            setTerminalUrl(null);
            setVmStatus("idle");
            setTimerStarted(false);
            setExpiresAt(null);
          });
      }
    } catch (error) {
      console.error("Failed to restore lab session:", error);
      localStorage.removeItem(storageKey);
    }
  }, [vmId, storageKey]);

  const handleCreateVm = async () => {
    setShowCreateVmDialog(false);
    setVmStatus("creating");
    setTimerStarted(false);
    setExpiresAt(null);

    try {
      toast({
        title: "VM 생성 시작",
        description: "취약 환경을 구성하고 있습니다...",
      });

      const response = await createVM(cveId);

      setVmId(response.uuid);
      setTerminalUrl(response.guacamoleUrl ?? null);
      setVmStatus("ready");

      const sessionToStore: StoredLabSession = {
        uuid: response.uuid,
        guacamoleUrl: response.guacamoleUrl ?? null,
        terminated: false,
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionToStore));

      // VM 생성 완료 후 백엔드에서 정확한 만료 시간 가져오기
      try {
        const timeResponse = await getRemainingTime(response.uuid);
        if (timeResponse.expires_at) {
          setExpiresAt(timeResponse.expires_at);
          setTimerStarted(true);
        } else {
          const fallback = new Date(Date.now() + INITIAL_TIME * 1000).toISOString();
          setExpiresAt(fallback);
          setTimerStarted(true);
        }
      } catch (timeError) {
        console.warn("Failed to fetch remaining time, using fallback:", timeError);
        const fallback = new Date(Date.now() + INITIAL_TIME * 1000).toISOString();
        setExpiresAt(fallback);
        setTimerStarted(true);
      }

      toast({
        title: "VM 생성 완료",
        description: response.guacamoleUrl
          ? `호스트: ${response.hostname} (${response.privateIp})`
          : "VM은 생성되었지만 원격 접속 URL을 아직 가져오지 못했습니다.",
      });
    } catch (error) {
      console.error("VM 생성 실패:", error);
      setVmStatus("idle");
      setTimerStarted(false);
      setExpiresAt(null);
      setVmId(null);
      setTerminalUrl(null);
      localStorage.removeItem(storageKey);

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

      await terminateSession(vmId);

      setVmStatus("terminated");
      setTerminalUrl(null);
      setTimerStarted(false);
      setExpiresAt(null);
      localStorage.setItem(
        storageKey,
        JSON.stringify({ uuid: vmId, guacamoleUrl: null, terminated: true })
      );

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

    if (vmId) {
      try {
        await completeLabSession(vmId);
        toast({
          title: "실습이 완료되었습니다",
          description: "VM이 종료되고 실습 기록이 저장되었습니다.",
        });
      } catch (error) {
        console.error("실습 완료 처리 실패:", error);
        toast({
          title: "실습 완료 실패",
          description:
            error instanceof Error
              ? error.message
              : "실습 완료 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }

    localStorage.removeItem(storageKey);
    setVmStatus("idle");
    setVmId(null);
    setTerminalUrl(null);
    setTimerStarted(false);
    setExpiresAt(null);
    router.push("/");
  };

  const handleCancel = async () => {
    setShowCancelDialog(false);

    if (vmId) {
      try {
        await cancelLabSession(vmId);
        toast({
          title: "실습이 취소되었습니다",
          description: "VM이 종료되고 기록이 남지 않습니다.",
        });
      } catch (error) {
        console.error("실습 취소 실패:", error);
        toast({
          title: "실습 취소 실패",
          description:
            error instanceof Error
              ? error.message
              : "실습 취소 처리 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }

    localStorage.removeItem(storageKey);
    setVmStatus("idle");
    setVmId(null);
    setTerminalUrl(null);
    setTimerStarted(false);
    setExpiresAt(null);
    router.push("/learn");
  };

  const handleTimeout = async () => {
    setShowTimeoutDialog(false);

    if (vmId) {
      try {
        await cancelLabSession(vmId);
      } catch (error) {
        console.error("타임아웃 처리 실패:", error);
      } finally {
        localStorage.removeItem(storageKey);
      }
    }

    setVmStatus("idle");
    setVmId(null);
    setTerminalUrl(null);
    setTimerStarted(false);
    setExpiresAt(null);
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
                disabled={vmStatus === "creating" || vmStatus === "ready"}
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
                    localStorage.removeItem(storageKey);
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
              {vmStatus === "terminated" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">VM이 종료되었습니다.</p>
                  <p className="text-sm text-muted-foreground">
                    필요하면 다시 VM을 생성하거나 실습을 완료/취소하세요.
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
              {vmStatus === "ready" && !terminalUrl && (
                <div className="text-center space-y-2">
                  <p className="text-muted-foreground">원격 접속 URL을 준비하고 있습니다.</p>
                  <p className="text-xs text-muted-foreground">
                    잠시 후 다시 시도하거나 페이지를 새로고침해 주세요.
                  </p>
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
