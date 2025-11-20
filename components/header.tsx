"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import { terminateSession } from "@/lib/api"
import { useCallback } from "react"

const navItems = [
  { href: "/", label: "홈" },
  { href: "/news", label: "뉴스" },
  { href: "/learn", label: "학습" },
]

export function Header() {
  const pathname = usePathname()
  const { isAuthed, logout } = useAuth()
  const router = useRouter()

  const handleActiveSessionGuard = useCallback(async () => {
    if (typeof window === "undefined") return true

    const raw = localStorage.getItem("active_lab_session")
    if (!raw) return true

    let session: { uuid?: string; cveId?: string; status?: string } | null = null
    try {
      session = JSON.parse(raw)
    } catch (error) {
      console.warn("Failed to parse active lab session from storage", error)
      localStorage.removeItem("active_lab_session")
      return true
    }

    if (!session || !session.status || !["creating", "ready"].includes(session.status)) {
      return true
    }

    const confirmLeave = window.confirm(
      "현재 생성 중이거나 실행 중인 실습 VM이 있습니다. 페이지를 이동하면 VM이 종료됩니다. 계속하시겠습니까?"
    )

    if (!confirmLeave) {
      return false
    }

    try {
      if (session.uuid) {
        await terminateSession(session.uuid)
      }
    } catch (error) {
      console.error("Failed to terminate active lab session while navigating:", error)
    } finally {
      if (session?.cveId) {
        localStorage.removeItem(`lab_session_${session.cveId}`)
      }
      localStorage.removeItem("active_lab_session")
    }

    return true
  }, [])

  const navigateWithGuard = useCallback(
    async (href: string) => {
      const canLeave = await handleActiveSessionGuard()
      if (canLeave) {
        router.push(href)
      }
    },
    [handleActiveSessionGuard, router]
  )

  const handleNavClick = (href: string) => async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await navigateWithGuard(href)
  }

  const handleLogoClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await navigateWithGuard("/")
  }

  const handleLogout = async () => {
    const canLeave = await handleActiveSessionGuard()
    if (!canLeave) {
      return
    }

    const confirmed = window.confirm("로그아웃하면 현재 세션이 종료됩니다. 계속하시겠습니까?")
    if (!confirmed) {
      return
    }

    logout()
    router.push("/")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" onClick={handleLogoClick} className="text-xl font-bold text-primary">
              CVE LabHub
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={handleNavClick(item.href)}
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="사용자 메뉴">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthed ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/mypage" onClick={handleNavClick("/mypage")}>
                      마이페이지
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>로그아웃</DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" onClick={handleNavClick("/login")}>
                      로그인
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/signup" onClick={handleNavClick("/signup")}>
                      회원가입
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
