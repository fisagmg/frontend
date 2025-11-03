"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { CountdownTimer } from "@/components/countdown-timer"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { AuthGuard } from "@/lib/auth-context"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Loader2 } from "lucide-react"
import { ReportModal } from "@/components/report-modal"

const INITIAL_TIME = 1 * 60 * 60 // 1 hour in seconds

export default function LabStartPage() {
  const router = useRouter()
  const [vmStatus, setVmStatus] = useState<"idle" | "creating" | "ready">("idle")
  const [timerStarted, setTimerStarted] = useState(false)
  const [showCreateVmDialog, setShowCreateVmDialog] = useState(false)
  const [showStopVmDialog, setShowStopVmDialog] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showTimeoutDialog, setShowTimeoutDialog] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const handleCreateVm = () => {
    setShowCreateVmDialog(false)
    setVmStatus("creating")

    // Simulate VM provisioning
    setTimeout(() => {
      setVmStatus("ready")
      setTimerStarted(true)
    }, 3000)
  }

  const handleStopVm = () => {
    setShowStopVmDialog(false)
    setVmStatus("idle")
    setTimerStarted(false)
  }

  const handleComplete = () => {
    setShowCompleteDialog(false)
    if (vmStatus === "ready") {
      setVmStatus("idle")
    }
    router.push("/")
  }

  const handleCancel = () => {
    setShowCancelDialog(false)
    if (vmStatus === "ready") {
      setVmStatus("idle")
    }
    router.push("/learn")
  }

  const handleTimeout = () => {
    setShowTimeoutDialog(false)
    setVmStatus("idle")
    router.push("/")
  }

  return (
    <AuthGuard>
      <div className="fixed inset-0 pt-16 bg-background">
        <div className="border-b border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button onClick={() => setShowReportModal(true)} variant="outline" size="sm">
                보고서 작성
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
              <Button onClick={() => setShowCompleteDialog(true)} variant="default" size="sm">
                실습 완료
              </Button>
              <Button onClick={() => setShowCancelDialog(true)} variant="outline" size="sm">
                실습 취소
              </Button>
            </div>
            <div className="flex items-center gap-3">
              {timerStarted && (
                <CountdownTimer initialSeconds={INITIAL_TIME} onComplete={() => setShowTimeoutDialog(true)} />
              )}
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-8rem)] flex">
          <div className="w-[20%] border-r border-border bg-card overflow-y-auto">
            <div className="p-4">
              <h2 className="text-lg font-bold mb-4">실습 가이드</h2>
              <Accordion type="single" collapsible defaultValue="overview" className="w-full">
                <AccordionItem value="overview">
                  <AccordionTrigger>개요</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      이 실습에서는 CVE 취약점을 직접 재현하고 분석합니다. VM을 생성하여 실습 환경을 준비하세요.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="hints">
                  <AccordionTrigger>힌트</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>먼저 시스템 버전을 확인하세요</li>
                      <li>네트워크 포트 스캔을 수행하세요</li>
                      <li>취약한 서비스를 식별하세요</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="caution">
                  <AccordionTrigger>주의사항</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      실습 환경은 격리된 네트워크에서 동작합니다. 외부 시스템에 대한 공격은 절대 금지됩니다.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="checklist">
                  <AccordionTrigger>체크리스트</AccordionTrigger>
                  <AccordionContent>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>취약점 재현 완료</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>공격 벡터 분석 완료</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>패치 적용 및 검증 완료</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span>보고서 작성 완료</span>
                      </li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>

          {/* Right: VM Area (80-85%) */}
          <div className="flex-1 p-4 bg-muted/20">
            <div className="h-full rounded-lg border border-border bg-card flex items-center justify-center">
              {vmStatus === "idle" && (
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">VM이 생성되지 않았습니다</p>
                  <p className="text-sm text-muted-foreground">
                    상단의 "VM 생성" 버튼을 클릭하여 실습 환경을 시작하세요
                  </p>
                </div>
              )}
              {vmStatus === "creating" && (
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 mx-auto text-primary animate-spin" />
                  <p className="text-muted-foreground">VM 환경 생성 중...</p>
                  <p className="text-xs text-muted-foreground">잠시만 기다려주세요</p>
                </div>
              )}
              {vmStatus === "ready" && (
                <div className="w-full h-full p-4">
                  <div className="w-full h-full rounded border border-border bg-background flex items-center justify-center">
                    <p className="text-muted-foreground">VDI 터널링 화면 (실제 환경에서는 VM 화면이 표시됩니다)</p>
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
          description="VM 생성 후 타이머가 시작됩니다. (1시간)"
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

        <ReportModal
          open={showReportModal}
          onOpenChange={setShowReportModal}
          cveId="CVE-2024-1234"
          cveName="CVE-2024-1234 - Example Vulnerability"
        />
      </div>
    </AuthGuard>
  )
}
