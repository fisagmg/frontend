import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <div className="space-y-6">
      <Badge variant="secondary" className="mb-2">
        보안 취약점 학습 플랫폼
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-balance leading-tight">
        <span className="text-foreground">CVE 취약점을 배우고</span>
        <br />
        <span className="text-gradient">실전처럼 실습하세요</span>
      </h1>
      <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center sm:justify-start">
        <Button asChild size="lg" className="text-base">
          <Link href="/learn">시작하기</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="text-base bg-transparent">
          <Link href="/signup">Join</Link>
        </Button>
      </div>
    </div>
  )
}
