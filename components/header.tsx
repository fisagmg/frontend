"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
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

  const navigateWithGuard = useCallback(
    (href: string) => {
      router.push(href)
    },
    [router]
  )

  const handleNavClick = (href: string) => async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await navigateWithGuard(href)
  }

  const handleLogoClick = async (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    await navigateWithGuard("/")
  }

  const handleLogout = () => {
    const confirmed = window.confirm("로그아웃하시겠습니까?")
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
            <Link href="/" onClick={handleLogoClick} className="flex items-center">
              <Image 
                src="/bluelogo.png" 
                alt="CVE LabHub" 
                width={150} 
                height={40}
                priority
              />
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
