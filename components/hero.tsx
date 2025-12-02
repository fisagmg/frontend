"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"

export function Hero() {
  const { isAuthed } = useAuth()
  
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-8 py-8 lg:py-12">
      <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-3 py-1">
        보안 취약점 학습 플랫폼
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight max-w-4xl">
        <span className="text-foreground">CVE 취약점을 배우고</span>
        <br />
        <span className="text-gradient">실전처럼 실습하세요</span>
      </h1>
      <div className="flex flex-row gap-4 pt-4">
        <Button asChild size="lg" className="text-base px-8 h-12 font-semibold bg-white text-slate-950 hover:bg-white/90">
          <Link href="/learn">시작하기</Link>
        </Button>
        {!isAuthed && (
          <Button asChild size="lg" variant="outline" className="text-base px-8 h-12 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent">
            <Link href="/login">로그인</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
