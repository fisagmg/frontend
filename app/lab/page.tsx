"use client"

import Link from "next/link"
import { CVECard } from "@/components/cve-card"
import { Button } from "@/components/ui/button"
import { mockCVEs } from "@/lib/mock-data"
import { AuthGuard } from "@/lib/auth-context"
import { Info } from "lucide-react"

export default function LabPage() {
  const featuredCVEs = mockCVEs.slice(0, 6)

  return (
    <AuthGuard>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">CVE 실습</h1>
          <p className="text-muted-foreground">VDI 기반 실습 환경에서 CVE를 직접 체험하세요</p>
        </div>

        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>검색은 'CVE 전체 보기'에서 가능합니다.</span>
          </div>
          <Button asChild variant="outline">
            <Link href="/lab/all">CVE 전체 보기</Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCVEs.map((cve) => (
            <CVECard key={cve.id} cve={cve} showLabButton={false} />
          ))}
        </div>
      </div>
    </AuthGuard>
  )
}
