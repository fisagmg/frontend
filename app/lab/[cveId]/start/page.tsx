"use client";

import { useState, use, useEffect, useRef } from "react";
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
  deleteVM,
  completeLabSession,
  cancelLabSession,
  getApiBaseUrl,
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
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  
  // Guacamole iframe ref
  const guacamoleIframeRef = useRef<HTMLIFrameElement>(null);

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
        localStorage.removeItem("active_lab_session");
      } else {
        setVmStatus("ready");
        setTimerStarted(false);
        setExpiresAt(null);
        localStorage.setItem(
          "active_lab_session",
          JSON.stringify({ cveId, uuid: parsed.uuid, status: "ready" })
        );

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
            localStorage.removeItem("active_lab_session");
          });
      }
    } catch (error) {
      console.error("Failed to restore lab session:", error);
      localStorage.removeItem(storageKey);
      localStorage.removeItem("active_lab_session");
    }
  }, [vmId, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const raw = localStorage.getItem("active_lab_session")
      if (!raw) {
        return
      }

      try {
        const session = JSON.parse(raw) as { status?: string }
        if (session?.status && ["creating", "ready"].includes(session.status)) {
          event.preventDefault()
          event.returnValue = "작업 중인 실습 VM이 종료됩니다."
        }
      } catch {
        localStorage.removeItem("active_lab_session")
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  // Guacamole 공식 권장: iframe 자동 포커스 처리
  useEffect(() => {
    if (vmStatus !== "ready" || !terminalUrl || !guacamoleIframeRef.current) {
      return;
    }

    /**
     * Refocuses the iframe containing Guacamole if the user is not already
     * focusing another non-body element on the page.
     */
    const refocusGuacamole = (event: MouseEvent | KeyboardEvent) => {
      // Do not refocus if focus is on an input field, button, or textarea
      const focused = document.activeElement;
      if (focused && focused !== document.body) {
        const tagName = focused.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'button' || tagName === 'select') {
          return;
        }
      }

      // Do not refocus if user clicked on the guide panel or scrollable area (왼쪽 패널)
      if (event.target instanceof Element) {
        // 가이드 패널을 클릭한 경우 iframe 포커스 방지 (스크롤 보호)
        const clickedOnGuidePanel = event.target.closest('[data-guide-panel="true"]');
        if (clickedOnGuidePanel) {
          return;
        }
      }

      // Ensure iframe is focused
      guacamoleIframeRef.current?.focus();
    };

    // Attempt to refocus iframe upon click or keydown
    document.addEventListener('click', refocusGuacamole as EventListener);
    document.addEventListener('keydown', refocusGuacamole as EventListener);

    console.log('[Guacamole] Auto-refocus listeners registered');

    return () => {
      document.removeEventListener('click', refocusGuacamole as EventListener);
      document.removeEventListener('keydown', refocusGuacamole as EventListener);
      console.log('[Guacamole] Auto-refocus listeners removed');
    };
  }, [vmStatus, terminalUrl])

  const handleCreateVm = async () => {
    console.log('[VM 생성] 시작');
    setShowCreateVmDialog(false);
    setVmStatus("creating");
    setTimerStarted(false);
    setExpiresAt(null);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "active_lab_session",
          JSON.stringify({ cveId, status: "creating" })
        );
      }
    } catch (error) {
      console.warn("Failed to set active lab session:", error);
    }

    try {
      toast({
        title: "VM 생성 시작",
        description: "취약 환경을 구성하고 있습니다...",
      });

      //console.log('[VM 생성] API 호출 시작:', cveId);
      const response = await createVM(cveId);
      //console.log('[VM 생성] API 호출 성공:', response);

      setVmId(response.uuid);
      setTerminalUrl(response.guacamoleUrl ?? null);
      setVmStatus("ready");

      const sessionToStore: StoredLabSession = {
        uuid: response.uuid,
        guacamoleUrl: response.guacamoleUrl ?? null,
        terminated: false,
      };
      localStorage.setItem(storageKey, JSON.stringify(sessionToStore));
      localStorage.setItem(
        "active_lab_session",
        JSON.stringify({ cveId, uuid: response.uuid, status: "ready" })
      );

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
      localStorage.removeItem("active_lab_session");

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

      setVmStatus("terminated");
      setTerminalUrl(null);
      setTimerStarted(false);
      setExpiresAt(null);
      localStorage.setItem(
        storageKey,
        JSON.stringify({ uuid: vmId, guacamoleUrl: null, terminated: true })
      );
      localStorage.removeItem("active_lab_session");

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
    localStorage.removeItem("active_lab_session");
    setVmStatus("idle");
    setVmId(null);
    setTerminalUrl(null);
    setTimerStarted(false);
    setExpiresAt(null);
    router.push("/");
  };

  const handleTimeout = async () => {
    setShowTimeoutDialog(false);

    if (vmId) {
      try {
        await cancelLabSession(vmId, cveId);
      } catch (error) {
        console.error("타임아웃 처리 실패:", error);
      } finally {
        localStorage.removeItem(storageKey);
        localStorage.removeItem("active_lab_session");
      }
    }

    setVmStatus("idle");
    setVmId(null);
    setTerminalUrl(null);
    setTimerStarted(false);
    setExpiresAt(null);
    router.push("/");
  };

  const handleOpenReport = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('[보고서 작성] 버튼 클릭됨');
    setIsCreatingReport(true);
    
    try {
      const reportName = `${cveId}_보고서_${new Date().toISOString().split("T")[0]}`;

      console.log('[보고서 작성] API 호출 시작:', { cveId, reportName });
      const report = await createReport(cveId, reportName);
      console.log('[보고서 작성] API 호출 성공:', report);

      if (report.presignedDownloadUrl) {
        window.open(report.presignedDownloadUrl, "_blank");
      }

      toast({
        title: "보고서가 생성되었습니다",
        description: "새 탭에서 워드 파일을 다운로드하여 편집하세요.",
      });
    } catch (error) {
      console.error("[보고서 작성] 오류 발생:", error);
      toast({
        title: "보고서 생성 실패",
        description: error instanceof Error ? error.message : "보고서 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingReport(false);
    }
  };

  return (
    <AuthGuard>
      <div className="fixed top-20 left-0 right-0 bottom-0 bg-background flex flex-col">
        <div className="border-b border-border bg-card px-4 py-3 flex-shrink-0 relative z-[100]">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 relative z-[101]">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[보고서 작성] 버튼 직접 클릭됨!');
                  handleOpenReport();
                }}
                disabled={isCreatingReport}
                style={{
                  backgroundColor: '#3f3f46',
                  color: 'white',
                  border: '1px solid #52525b',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: isCreatingReport ? 'not-allowed' : 'pointer',
                  opacity: isCreatingReport ? 0.5 : 1,
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  if (!isCreatingReport) {
                    e.currentTarget.style.backgroundColor = '#52525b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCreatingReport) {
                    e.currentTarget.style.backgroundColor = '#3f3f46';
                  }
                }}
              >
                {isCreatingReport ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    생성 중...
                  </>
                ) : (
                  "보고서 작성"
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[VM 생성] 버튼 직접 클릭됨!');
                  setShowCreateVmDialog(true);
                }}
                disabled={vmStatus === "creating" || vmStatus === "ready"}
                style={{
                  backgroundColor: '#3f3f46',
                  color: 'white',
                  border: '1px solid #52525b',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: (vmStatus === "creating" || vmStatus === "ready") ? 'not-allowed' : 'pointer',
                  opacity: (vmStatus === "creating" || vmStatus === "ready") ? 0.5 : 1,
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  if (vmStatus !== "creating" && vmStatus !== "ready") {
                    e.currentTarget.style.backgroundColor = '#52525b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (vmStatus !== "creating" && vmStatus !== "ready") {
                    e.currentTarget.style.backgroundColor = '#3f3f46';
                  }
                }}
              >
                {vmStatus === "creating" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin inline" />
                    생성 중...
                  </>
                ) : (
                  "VM 생성"
                )}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[VM 종료] 버튼 직접 클릭됨!');
                  setShowStopVmDialog(true);
                }}
                disabled={vmStatus !== "ready"}
                style={{
                  backgroundColor: '#3f3f46',
                  color: 'white',
                  border: '1px solid #52525b',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: vmStatus !== "ready" ? 'not-allowed' : 'pointer',
                  opacity: vmStatus !== "ready" ? 0.5 : 1,
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  if (vmStatus === "ready") {
                    e.currentTarget.style.backgroundColor = '#52525b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (vmStatus === "ready") {
                    e.currentTarget.style.backgroundColor = '#3f3f46';
                  }
                }}
              >
                VM 종료
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('[실습 완료] 버튼 직접 클릭됨!');
                  setShowCompleteDialog(true);
                }}
                disabled={vmStatus !== "ready" && vmStatus !== "terminated"}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: '1px solid #1d4ed8',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: (vmStatus !== "ready" && vmStatus !== "terminated") ? 'not-allowed' : 'pointer',
                  opacity: (vmStatus !== "ready" && vmStatus !== "terminated") ? 0.5 : 1,
                  position: 'relative',
                  zIndex: 9999,
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  if (vmStatus === "ready" || vmStatus === "terminated") {
                    e.currentTarget.style.backgroundColor = '#1d4ed8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (vmStatus === "ready" || vmStatus === "terminated") {
                    e.currentTarget.style.backgroundColor = '#2563eb';
                  }
                }}
              >
                실습 완료
              </button>
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
                    localStorage.removeItem("active_lab_session");
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

        <div className="flex-1 flex relative overflow-hidden">
          {/* Left: Guide Panel */}
          <div
            data-guide-panel="true"
            className={`border-r border-border bg-white text-slate-900 overflow-y-auto transition-all duration-300 ${
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
          <div className="flex-1 p-4 bg-slate-50">
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
                  ref={guacamoleIframeRef}
                  src={terminalUrl}
                  className="w-full h-full rounded"
                  title="VM Terminal"
                  allow="clipboard-read; clipboard-write; fullscreen"
                  style={{ border: 0, pointerEvents: 'auto' }}
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