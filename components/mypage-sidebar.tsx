"use client"

import { useRouter } from "next/navigation"
import { LogOut, User, FileText, BookOpen, Brain } from "lucide-react"
import { LogOut, User, FileText, BookOpen, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"

interface MypageSidebarProps {
  activeView: "lab-history" | "reports" | "profile" | "ai-analysis" | "admin-console"
  onViewChange: (view: "lab-history" | "reports" | "profile" | "ai-analysis" | "admin-console") => void
}

export function MypageSidebar({ activeView, onViewChange }: MypageSidebarProps) {
  const router = useRouter()
  const { logout, isAdmin } = useAuth()
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const menuItems = [
    { id: "lab-history" as const, label: "실습한 CVE", icon: BookOpen },
    { id: "reports" as const, label: "작성한 보고서", icon: FileText },
    { id: "ai-analysis" as const, label: "AI 분석 결과", icon: Brain },
    { id: "profile" as const, label: "정보 수정", icon: User },
  ]

  return (
    <>
      <aside className="w-64 shrink-0">
        <div className="rounded-lg border border-border bg-card p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeView === item.id ? "secondary" : "ghost"}
                className={cn("w-full justify-start", activeView === item.id && "bg-primary/10 text-primary")}
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
          {isAdmin && (
            <>
              <div className="pt-2 border-t border-border" />
              <Button
                variant={activeView === "admin-console" ? "secondary" : "ghost"}
                className={cn("w-full justify-start", activeView === "admin-console" && "bg-primary/10 text-primary")}
                onClick={() => onViewChange("admin-console")}
              >
                <Settings className="mr-2 h-4 w-4" />
                관리자 콘솔
              </Button>
            </>
          )}
          <div className="pt-2 border-t border-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>
      </aside>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>로그아웃 하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>로그아웃하면 로그인 페이지로 이동합니다.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout}>로그아웃</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}