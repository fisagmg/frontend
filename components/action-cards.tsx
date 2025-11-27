"use client"

import { useRouter } from "next/navigation"
import { BookOpen, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { useState } from "react"
import { ConfirmDialog } from "@/components/confirm-dialog"

const actions = [
  {
    icon: BookOpen,
    title: "학습",
    description: "CVE 취약점 개념과 사례를 학습하세요",
    href: "/learn",
    requiresAuth: false,
  },
  {
    icon: FlaskConical,
    title: "실습",
    description: "VDI 환경에서 실제 취약점을 체험하세요",
    href: "/lab",
    requiresAuth: true,
  },
]

export function ActionCards() {
  const router = useRouter()
  const { isAuthed } = useAuth()
  const [showAuthDialog, setShowAuthDialog] = useState(false)

  const handleClick = (href: string, requiresAuth: boolean) => {
    if (requiresAuth && !isAuthed) {
      setShowAuthDialog(true)
    } else {
      router.push(href)
    }
  }

  const handleAuthConfirm = () => {
    setShowAuthDialog(false)
    router.push("/login?redirect=/lab")
  }

  return (
    <>
      <div className="grid md:grid-cols-2 gap-6">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <Card
              key={action.href}
              className="bg-white border-zinc-200 hover:border-primary/50 transition-colors cursor-pointer shadow-sm"
              onClick={() => handleClick(action.href, action.requiresAuth)}
            >
              <CardHeader>
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl text-zinc-900">{action.title}</CardTitle>
                <CardDescription className="text-zinc-600">{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200">
                  시작하기
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <ConfirmDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        title="로그인이 필요합니다"
        description="실습 기능을 사용하려면 로그인이 필요합니다. 로그인 페이지로 이동하시겠습니까?"
        onConfirm={handleAuthConfirm}
      />
    </>
  )
}
