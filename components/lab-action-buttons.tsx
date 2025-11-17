"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import {
  checkExtendable,
  extendSession,
  terminateSession,
} from "@/lib/api"
import type { LabExtendableResponse } from "@/types/lab"

interface LabActionButtonsProps {
  uuid: string
  expiresAt: string
  onUpdateExpires: (newExpiresAt: string) => void
  onTerminated?: () => void
}

export function LabActionButtons({
  uuid,
  expiresAt,
  onUpdateExpires,
  onTerminated,
}: LabActionButtonsProps) {
  const { toast } = useToast()
  const [extendableInfo, setExtendableInfo] = useState<LabExtendableResponse | null>(null)
  const [isExtending, setIsExtending] = useState(false)
  const [isTerminating, setIsTerminating] = useState(false)
  const [showTerminateDialog, setShowTerminateDialog] = useState(false)

  // 페이지 로드 시 연장 가능 여부 확인
  useEffect(() => {
    const fetchExtendable = async () => {
      try {
        const info = await checkExtendable(uuid)
        setExtendableInfo(info)
      } catch (error) {
        console.error("연장 가능 여부 확인 실패:", error)
      }
    }

    fetchExtendable()
  }, [uuid, expiresAt]) // expiresAt 변경 시 재확인

  const handleExtend = async () => {
    setIsExtending(true)
    try {
      const response = await extendSession(uuid)
      
      // 백엔드에서 받은 새로운 만료 시간으로 업데이트
      onUpdateExpires(response.expires_at)

      // 연장 가능 여부 다시 확인
      const newInfo = await checkExtendable(uuid)
      setExtendableInfo(newInfo)

      toast({
        title: "세션 연장 완료",
        description: `세션이 ${response.extended_minutes}분 연장되었습니다.`,
      })
    } catch (error: any) {
      console.error("세션 연장 실패:", error)

      // 에러 타입별 처리
      if (error.response?.status === 400) {
        toast({
          title: "연장 불가",
          description: "더 이상 연장할 수 없습니다. (최대 TTL 초과)",
          variant: "destructive",
        })
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "인증 만료",
          description: "로그인이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "세션 연장 실패",
          description: error.message || "세션 연장 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsExtending(false)
    }
  }

  const handleTerminate = async () => {
    setShowTerminateDialog(false)
    setIsTerminating(true)

    try {
      await terminateSession(uuid)

      toast({
        title: "세션 종료 완료",
        description: "Lab 세션이 성공적으로 종료되었습니다.",
      })

      // 부모 컴포넌트에 종료 알림
      if (onTerminated) {
        onTerminated()
      }
    } catch (error: any) {
      console.error("세션 종료 실패:", error)

      if (error.response?.status === 401 || error.response?.status === 403) {
        toast({
          title: "인증 만료",
          description: "로그인이 만료되었습니다. 다시 로그인해주세요.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "세션 종료 실패",
          description: error.message || "세션 종료 중 오류가 발생했습니다.",
          variant: "destructive",
        })
      }
    } finally {
      setIsTerminating(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* 시간 연장 버튼 */}
        <Button
          onClick={handleExtend}
          disabled={!extendableInfo?.extendable || isExtending}
          variant="default"
          size="sm"
          title={
            extendableInfo?.extendable
              ? "세션 시간을 30분 연장합니다"
              : "더 이상 연장할 수 없습니다 (최대 2시간)"
          }
        >
          {isExtending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              연장 중...
            </>
          ) : (
            "시간 연장 (+30분)"
          )}
        </Button>

        {/* 세션 종료 버튼 */}
        <Button
          onClick={() => setShowTerminateDialog(true)}
          disabled={isTerminating}
          variant="destructive"
          size="sm"
        >
          {isTerminating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              종료 중...
            </>
          ) : (
            "세션 종료"
          )}
        </Button>
      </div>

      {/* 종료 확인 다이얼로그 */}
      <ConfirmDialog
        open={showTerminateDialog}
        onOpenChange={setShowTerminateDialog}
        title="세션을 종료하시겠습니까?"
        description="세션을 종료하면 VM이 삭제되고 작업 내용이 저장되지 않을 수 있습니다."
        onConfirm={handleTerminate}
      />
    </>
  )
}

